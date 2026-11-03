# Phase 0 Architecture Review: OVRA Platform

**Document ID:** OVRA-REV-001  
**Version:** 1.0.0  
**Status:** Under Architectural Review  
**Date:** 2026-11-03  
**Reviewer:** Principal Architect & Security Reviewer  

---

## 1. Executive Summary & System Context

OVRA is an India-built, enterprise-grade, distributed workflow automation and agentic orchestration platform. It is engineered to unify:
- **Visual Workflow Automation** (intuitive drag-and-drop authoring for non-technical operators),
- **Durable Distributed Orchestration** (fault-tolerant, recoverable execution powered by Temporal),
- **AI-Native Agentic Capabilities** (multi-agent orchestration, tool sandboxing, RAG, and MCP interoperability),
- **Enterprise Multi-Tenancy & Security** (cryptographic secret isolation, SSRF prevention, gVisor sandboxing, and PostgreSQL Row-Level Security).

### Trust Boundaries & Threat Landscape
1. **Edge / Public Internet Boundary:** Web Studio and Public API endpoints receiving external traffic. Protected by TLS 1.3, strict CORS, rate limiting, and WAF.
2. **Tenant Isolation Boundary:** Complete separation of Organization and Workspace entities across database queries, memory caches, worker job claims, and execution logs.
3. **Control Plane / Execution Plane Boundary:** The Control Plane (NestJS Fastify) owns orchestration commands, authorization, and projections. The Execution Plane (Temporal Workers, Activity Fleet) handles task scheduling and node execution.
4. **Trusted Worker / External Internet Egress Boundary:** External HTTP requests and webhook dispatches executed by worker activities must transit a hardened SSRF Egress Gateway.
5. **Trusted Worker / Untrusted User-Code Boundary:** Execution of user-defined Python or JavaScript code is completely severed from trusted host processes and isolated via userspace micro-kernels (gVisor `runsc`) on isolated Kubernetes node pools.
6. **AI Agent / System Boundary:** AI models can propose tool invocations, but cannot execute sensitive operations without deterministic schema validation, policy checks, budget enforcement, and mandatory human approval gates.

---

## 2. Architecture Decisions & ADR Mapping

| Decision Area | Core Architectural Decision | Governing ADR |
|---|---|---|
| System Topology | Control Plane & Execution Plane strict decoupling | `ADR-001: Control Plane Separation` |
| Durable Orchestration | Custom DAG Interpreter built on Temporal Workflow engine | `ADR-002: Temporal Orchestration` |
| Multi-Tenancy | Defense-in-depth: App RBAC + Postgres RLS via transaction-local GUC | `ADR-003: Tenant Isolation` |
| Untrusted Code | Gated by default; gVisor userspace sandbox on dedicated node pools | `ADR-004: Execution Sandbox` |
| Event Delivery | Temporal authoritative history + Postgres projection + WebSocket replay | `ADR-005: Event Delivery` |
| Data Layer ORM | Drizzle ORM selected for native `set_config(..., true)` connection safety | `ADR-006: Data Access (Proposed)` |
| Expression Engine | OEL v1: Pure AST-evaluated language without runtime `eval` | `ADR-007: Expression Engine (Proposed)` |

---

## 3. Review of Inconsistencies, Ambiguities & Missing Contracts

During our rigorous review of the baseline specifications, several critical ambiguities and missing contracts were identified:

1. **Prisma vs Drizzle RLS Transaction Ergonomics:**
   - *Inconsistency:* The baseline specification listed "Prisma or Drizzle". However, Prisma utilizes a binary query engine and connection pooler abstraction where setting transaction-local parameters (`set_config('app.current_workspace_id', ..., true)`) requires `$transaction` combined with raw SQL `$executeRaw` or extension wrappers. If any query runs outside `$transaction`, connection pooling can leak GUC settings across requests.
   - *Resolution:* Drizzle ORM is explicitly recommended (see `docs/decisions/proposals/ADR-006-drizzle-orm-data-access.md`) because it maps directly to `pg` connection pools with transparent `tx.execute(sql`...`)` transaction boundaries.
2. **Temporal History Size Explosion from Intermediate Payloads:**
   - *Risk:* If node executions pass large JSON documents or binary payloads through Temporal Workflow memory or Activity returns, the Temporal Workflow History will exceed the recommended 50,000 event or 50MB execution safety limits, triggering severe performance degradation or workflow termination.
   - *Contract Requirement:* Payloads exceeding 64KB must be offloaded to S3-compatible object storage, passing only immutable `FlowData` references (`storageKey`, SHA-256 hash, mime-type, size) through Temporal.
3. **Webhook Ingress Buffering & Backpressure:**
   - *Ambiguity:* Direct synchronous invocation of Temporal workflows from webhook handlers under heavy traffic spikes (e.g., flash sales, webhook floods) can exhaust API gateway connections and database connection pools.
   - *Contract Requirement:* Inbound webhooks must be validated and written to an append-only webhook ingress table or buffer with immediate 202 Accepted, followed by asynchronous dispatch to Temporal via transactional outbox workers.
4. **WebSocket Connection Drop vs Execution Event Loss:**
   - *Ambiguity:* WebSockets are lossy over unstable mobile/enterprise networks.
   - *Contract Requirement:* WebSocket events must carry a monotonic `sequence_number`. Clients maintain an `acknowledged_sequence_number` and use REST `/api/v1/executions/:id/events?since=:seq` to replay dropped frames upon reconnection.

---

## 4. Temporal Workflow-Interpreter Validation & Determinism Audit

Building an interpreter on top of Temporal requires strict segregation between deterministic workflow coordination and non-deterministic activity execution.

### Deterministic Workflow Code (Interpreter Logic)
The following operations **MUST remain in the Workflow function**:
- Parsing the compiled DAG nodes, dependencies, and state machine.
- Calculating which nodes have all upstream dependencies satisfied.
- Evaluating branch conditions and switch statements using pure, in-memory OEL expressions.
- Advancing loop state counters (`currentIteration < maxIterations`).
- Invoking Temporal Activities asynchronously via `workflow.proxyActivities()`.
- Awaiting human approval signals via `workflow.defineSignal('human_approval')` and `workflow.condition()`.
- Handling durable workflow pauses using `workflow.sleep()`.

### Strict Activity Boundaries (Non-Deterministic Workload)
The following operations **MUST NEVER run inside Workflow code** and are strictly relegated to Activities:
- Any network call (HTTP requests, REST APIs, GraphQL, gRPC).
- Database operations (PostgreSQL queries, Redis lookups).
- Cryptographic secret decryption and credential leasing.
- File system access or S3 object upload/download.
- System time calls: `Date.now()`, `new Date()` (must use Temporal `workflow.now()`).
- Randomness: `Math.random()`, `crypto.randomUUID()` (must use Temporal `workflow.uuid4()`).
- Interaction with external AI providers (OpenAI, Anthropic, Gemini).

---

## 5. At-Least-Once Delivery, Idempotency & OUTCOME_UNKNOWN

### The Fallacy of Exactly-Once
In distributed systems, true end-to-end "exactly-once" execution across heterogeneous third-party APIs (payment gateways, CRM webhooks, messaging APIs) is mathematically impossible due to the Two Generals' Problem. Network failures during response transmission leave the caller uncertain whether the remote operation completed.

### Idempotency Key Architecture
Every activity invocation that mutates external state generates a cryptographically deterministic idempotency key:
$$\text{IdempotencyKey} = \text{HMAC-SHA256}(\text{execution\_id} \parallel \text{node\_id} \parallel \text{attempt}, K_{\text{workspace}})$$

### Provider Reconciliation Matrix
When a side-effecting activity encounters a network timeout or 502/503/504 error, it handles the outcome according to provider capabilities:

| Provider Class | Integration Example | Idempotency Support | Engine Behavior on Timeout |
|---|---|---|---|
| **Class A: Native Idempotent** | Stripe, Razorpay, Modern APIs | Header `Idempotency-Key` supported | Safe automatic retry with identical key and exponential backoff |
| **Class B: Naturally Idempotent** | PostgreSQL `UPSERT`, S3 `PUT`, Redis `SET` | Inherently idempotent operations | Safe automatic retry |
| **Class C: Queryable / Reconcilable** | WhatsApp Cloud API, Bank Transfers | No idempotency header, but supports GET by external reference | Mark `OUTCOME_UNKNOWN`; run dedicated **Reconciliation Activity** (query status) before retrying |
| **Class D: Non-Idempotent & Blind** | Legacy Webhooks, Raw SMTP Email | No idempotency, no query API | Mark `OUTCOME_UNKNOWN`; **halt execution** and route to Human Approval or configured Compensation Branch |

---

## 6. Multi-Tenant Isolation & PostgreSQL RLS Context

### Tenant Ownership Hierarchy
- **Organization:** Billing, subscription limits, root enterprise administration.
- **Workspace:** Workflow definitions, credentials, executions, environments (dev/prod).

### Database Row-Level Security (RLS) Strategy
Every tenant-partitioned table (`workflows`, `workflow_versions`, `executions`, `credentials`, `audit_logs`) includes:
```sql
organization_id UUID NOT NULL,
workspace_id    UUID NOT NULL,
CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
```

### Connection Pool Safety & GUC Configuration
To prevent tenant context leakage across pooled connections (e.g. PgBouncer in transaction mode):
1. **Never use `SET app.current_workspace_id = '...'`** (which sets session-level state).
2. **Always use transaction-local configuration:**
   ```sql
   SELECT set_config('app.current_workspace_id', $1, true);
   ```
   The third parameter `true` scopes the GUC parameter strictly to the current transaction. When the transaction commits or aborts, PostgreSQL automatically clears the variable.
3. RLS Policy Definition:
   ```sql
   ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
   CREATE POLICY workspace_isolation_policy ON workflows
     FOR ALL
     USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::uuid);
   ```
4. **Mandatory Negative Testing:** Continuous integration test suites must execute cross-tenant access attempts (e.g. User from Workspace A querying Workflow from Workspace B) and verify HTTP 404/403 responses and zero SQL rows returned.

---

## 7. Credential Broker & Worker Lease Model

### Threat Model for Secrets
Storing unencrypted API keys or OAuth access tokens in workflow definitions or passing them to client browsers guarantees eventual credential compromise.

### Envelope Encryption Architecture
- **Key Hierarchy:**
  - **Master Key (KEK):** Managed in Cloud KMS (AWS KMS, GCP Cloud KMS) or HashiCorp Vault Transit Engine. Never leaves the KMS boundary.
  - **Data Encryption Key (DEK):** Cryptographically random 256-bit key generated per credential record.
- **Ciphertext Storage:** The secret is encrypted with AES-256-GCM using the DEK and authenticated data (AAD) binding `organization_id` and `workspace_id`. The DEK itself is encrypted under the KMS KEK and stored alongside the ciphertext.

### Worker Lease Model
1. Workflow definitions only store an opaque `credential_id` reference.
2. When an Activity worker prepares to execute a node requiring credentials, it issues a request to the **Credential Broker**:
   `POST /internal/v1/credentials/:id/lease`
   Payload: `{ executionId, workflowId, nodeId, attempt, workerIdentityToken }`
3. The Credential Broker validates:
   - Worker identity and mTLS token.
   - Active execution status and node assignment.
4. The Broker decrypts the secret and returns a short-lived, in-memory lease (TTL 60–300 seconds).
5. The worker uses the secret in memory for the single request and immediately zeroes the memory buffer.
6. Secrets are filtered through universal regex redaction before any string enters logging, tracing, or WebSocket pipelines.

---

## 8. SSRF Egress Enforcement & Outbound Defense

Arbitrary HTTP nodes and user webhooks present severe Server-Side Request Forgery risks.

### Egress Proxy Architecture
All outbound requests from worker nodes must pass through a specialized forward proxy (or hardened HTTP client wrapper):
1. **DNS Resolution & Rebinding Defense:**
   - The egress service resolves DNS queries using a hardened resolver.
   - Destination IP addresses are evaluated against forbidden IP ranges *prior* to connection:
     - `127.0.0.0/8` (Loopback)
     - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Private RFC 1918)
     - `169.254.0.0/16` (IPv4 Link-Local / Cloud Metadata: `169.254.169.254`)
     - `::1/128`, `fc00::/7`, `fe80::/10` (IPv6 equivalents)
   - **DNS Rebinding Prevention:** The HTTP client connects directly to the validated IP address, passing the original hostname exclusively in the HTTP `Host` header and TLS SNI extension.
2. **Redirect Validation:**
   - HTTP 301/302/307 redirects are intercepted. The redirect target URL must undergo the exact same DNS resolution and IP screening process before the client follows the redirect.
3. **Private Network Integrations:**
   - If an enterprise customer requires access to on-premises databases or internal services, this is permitted ONLY via dedicated, customer-configured Secure Connectors or Private Link agents with explicit workspace domain allowlists.

---

## 9. Untrusted User-Code Sandbox Requirements

### Readiness Checklist Before Enabling Public Code Nodes
Running arbitrary Python or JavaScript submitted by platform users presents maximum risk. The following requirements must be verified and certified before enabling code nodes in multi-tenant environments:

- [ ] **Runtime Isolation:** Code execution MUST use userspace kernel emulation (Google gVisor `runsc`) or hardware virtualization microVMs (Kata Containers / Firecracker). Regular Docker/containerd is strictly forbidden.
- [ ] **Node Pool Segmentation:** Sandboxes must reside on physically/logically isolated Kubernetes node pools with taints and tolerations, completely separated from API and control-plane pods.
- [ ] **Non-Root & Read-Only Filesystem:** Sandboxes run as unprivileged UID 10001 with read-only root filesystems and restricted temporary in-memory `tmpfs` mounts (max 64MB).
- [ ] **Strict Resource Quotas:** Enforced Linux cgroups limits: max 256MB RAM, 0.5 vCPU, 64 PIDs, and 15-second execution timeout.
- [ ] **Zero Cloud Credential Access:** Worker node pool IAM service accounts must have zero cloud provider permissions. Instance metadata endpoints are blocked via Kubernetes network policies.
- [ ] **Network Egress Block:** Default-deny all egress. If outbound HTTP is permitted, it must route exclusively through the SSRF egress proxy with domain allowlisting.
- [ ] **Independent Penetration Test:** A professional external security assessment must verify container breakout resistance.

---

## 10. API, Webhook, WebSocket & Event Replay Contracts

### Public API Standards
- Base URL: `https://api.ovra.in/v1`
- Authentication: Bearer JWT (users) or Scoped API Keys (`ovra_live_...` with SHA-256 hash lookup).
- Standard Response Envelope:
  ```json
  {
    "success": true,
    "data": {},
    "error": null,
    "meta": {
      "requestId": "req_01HPX...",
      "timestamp": "2026-11-03T10:00:00Z"
    }
  }
  ```
- Idempotency Header: `Idempotency-Key: <UUID>` supported on all mutating endpoints (`POST`, `PATCH`).

### Webhook Ingress Contract
- Endpoint: `POST /api/v1/webhooks/:triggerId`
- Verification: HMAC-SHA256 signature verification against secret stored in trigger configuration.
- Buffering: Payload accepted with immediate `202 Accepted` and response `{ "accepted": true, "eventId": "evt_..." }`.

### WebSocket Realtime Protocol
- Handshake: WSS connection authenticated via ticket/JWT token.
- Room Subscriptions: `subscribe:execution:<executionId>`.
- Replay Mechanism:
  - If a client disconnects, it reconnects and queries:
    `GET /api/v1/executions/:id/events?sinceSequenceNumber=42`
  - The server streams all missing events from the durable `execution_events` projection table.

---

## 11. Data Ownership & Partitioning Matrix

| Data Entity | Primary Store | Secondary / Ephemeral Store | Retention Policy | Notes |
|---|---|---|---|---|
| User & Org Records | PostgreSQL | Redis (Session cache) | Permanent | Strictly audited |
| Workflows & Versions | PostgreSQL | None | Permanent (Immutable versions) | Published versions never deleted if referenced |
| Orchestration State | Temporal Persistence | None | Workflow execution TTL (30–90 days) | Authoritative state machine |
| Execution Projections | PostgreSQL | Redis (Pub/Sub for WebSockets) | Tiered (30–365 days) | Partitioned by `created_at` monthly |
| Large Payloads (>64KB) | S3 Object Storage | None | Tied to execution retention | Pre-signed, short-lived URLs |
| Credentials (Encrypted) | PostgreSQL | Credential Broker memory | Permanent | Envelope encrypted |
| Rate-Limit Counters | Redis | None | TTL (1–60 seconds) | In-memory atomic counters |
| Cross-Service Events | PostgreSQL Outbox | NATS JetStream (conditional) | Outbox pruned on dispatch | At-least-once delivery |

---

## 12. Verified Technology Stack Compatibility Matrix (As of 2026-11-03)

| Component | Target Version | Compatibility Bounds | Official Documentation Source | Verification Notes & Caveats |
|---|---|---|---|---|
| **Node.js** | 22.x LTS (or 20.x LTS) | Supported on 20, 22, 24 | [Node.js Releases](https://nodejs.org/en/about/previous-releases) | Temporal TS SDK officially supports Node 20, 22, and 24. Production must use Active LTS. |
| **Temporal TS SDK** | ^1.11.x | Node.js 20+ | [Temporal TS SDK Docs](https://docs.temporal.io/develop/typescript) | Determinism checker enforced via Webpack bundling. |
| **NestJS** | ^10.4.x / ^11.x | Fastify v4 / v5 | [NestJS Fastify Guide](https://docs.nestjs.com/techniques/performance) | `@nestjs/platform-fastify` version must match core NestJS major version. Avoid version mismatch. |
| **Fastify** | ^4.28.x / ^5.x | Node.js 20+ | [Fastify GitHub](https://github.com/fastify/fastify) | High-performance HTTP adapter for NestJS. |
| **Next.js** | ^15.x / ^14.2.x | React 18 / 19 | [Next.js Documentation](https://nextjs.org/docs) | App router with TypeScript and React 19 support verified. |
| **React Flow** | `@xyflow/react` ^12.x | React 18 / 19 | [React Flow Docs](https://reactflow.dev/) | React 19 peer-dependency conflicts resolved in latest `@xyflow/react`. |
| **PostgreSQL** | 16.x / 17.x | SQL:2023 | [PostgreSQL Documentation](https://www.postgresql.org/docs/16/) | RLS with `set_config(..., true)` natively supported. |
| **Drizzle ORM** | ^0.36.x | Node 20+, PG 14+ | [Drizzle ORM Docs](https://orm.drizzle.team/) | Explicit transaction management and direct SQL template tags for RLS. |
| **Redis** | 7.2+ / 7.4+ | RESP3 protocol | [Redis Documentation](https://redis.io/docs/) | Ephemeral caching and WebSocket socket.io adapter. |
| **gVisor** | Latest (`runsc`) | Linux Kernel 5.15+ | [gVisor Documentation](https://gvisor.dev/docs/) | Dedicated K8s runtimeClass for untrusted code execution. |

---

## 13. OEL v1 (OVRA Expression Language) Language Proposal

To guarantee deterministic, sandboxed, and performant data mapping without risking remote code execution:
- **Design:** Pure recursive-descent parser producing an Abstract Syntax Tree (AST).
- **Execution:** AST interpreter with maximum recursion depth (32) and step execution limit (10,000 operations).
- **No Access:** No access to `globalThis`, `window`, `process`, filesystem, network, or external timers.

### Syntax Outline:
- Variables: `{{ $trigger.body.lead.email }}`
- Node References: `{{ $nodes.ai_classifier.output.category }}`
- Operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`, `+`, `-`, `*`, `/`
- Allowlisted Pure Functions:
  - String: `toUpper()`, `toLower()`, `trim()`, `concat()`, `replace()`, `substring()`, `split()`, `regexMatch()`
  - Math: `round()`, `floor()`, `ceil()`, `min()`, `max()`, `abs()`
  - Collection: `length()`, `contains()`, `first()`, `last()`, `map()`, `filter()`
  - Date/Time: `formatDate()`, `parseDate()`, `dateAdd()`, `dateDiff()` (using pure date math without ambient clock)
  - Coercion: `toString()`, `toNumber()`, `toBoolean()`, `parseJson()`, `toJson()`
