# OVRA — Master Platform Specification, Architecture & Operational Blueprint
**Product:** OVRA — Sovereign Visual Workflow Automation & AI Orchestration Platform  
**Author & Lead Architect:** Ansh Rajore (<anshrajore1266@gmail.com>)  
**Version:** 2.0.0 (Production Architecture Edition)  
**Date:** November 2026  
**Repository:** `https://github.com/anshrajore/ovra.git` (`main`)  
**Database Reference:** Supabase PostgreSQL (`ywfdgtsuyrqfazgimyqw`)  

---

## Table of Contents
1. [Executive Summary & Platform Thesis](#1-executive-summary--platform-thesis)
2. [Full Technology Stack & Architecture Layers](#2-full-technology-stack--architecture-layers)
3. [Database Architecture & Complete 36-Table Relational Schema](#3-database-architecture--complete-36-table-relational-schema)
4. [Decoupled NodePlatform & Extensibility System](#4-decoupled-nodeplatform--extensibility-system)
5. [In-Canvas API Studio (Embedded Playground)](#5-in-canvas-api-studio-embedded-playground)
6. [Multi-Model AI Orchestrator & pgvector RAG](#6-multi-model-ai-orchestrator--pgvector-rag)
7. [Resilience, TestLab & Chaos Simulation Suite](#7-resilience-testlab--chaos-simulation-suite)
8. [Comprehensive Security Architecture & Vulnerability Audit](#8-comprehensive-security-architecture--vulnerability-audit)
9. [Developer Platform, Scoped API Keys & Webhook HMAC](#9-developer-platform-scoped-api-keys--webhook-hmac)
10. [Complete 33-Route Inventory & Product Information Architecture](#10-complete-33-route-inventory--product-information-architecture)
11. [Competitor Gap Analysis & Benchmark Matrix](#11-competitor-gap-analysis--benchmark-matrix)
12. [DevOps, Deployment & Environment Configuration](#12-devops-deployment--environment-configuration)

---

## 1. Executive Summary & Platform Thesis

OVRA is India’s sovereign workflow automation and AI orchestration platform. Rather than copying a single competitor canvas or pursuing an arbitrary connector count vanity metric, OVRA establishes a unified product that harmonizes:

- **n8n / Make:** Visual graph DAG composition, branch-level condition routing, and step-level telemetry.
- **Zapier:** Zero-friction onboarding, visual field mapping, and approachable connector discovery.
- **Pipedream / Windmill:** First-class developer ergonomics, sandboxed code execution, versioned OpenAPI 3.0 imports, and API testing directly in the visual inspector without tab switching.
- **Activepieces / Gumloop:** Multi-model AI pipelines, human-in-the-loop approval gates, structured JSON extraction, and pgvector RAG.
- **Workato / Enterprise:** Row-level multi-tenant security, AES-256-GCM envelope encryption, leased credential access, and immutable compliance audit logs.

### Core Architectural Pillars
1. **Zero Arbitrary Eval:** Execution logic uses strongly typed JSON Schema v7 contracts and sandboxed AST expression evaluation. Plain `eval()` and `new Function()` are strictly forbidden.
2. **Decoupled Node Registry:** Core frontend canvas code contains zero hardcoded integrations. Nodes, triggers, actions, and OpenAPI imports register via the unified `NodePlatform` registry.
3. **Leased Credential Security:** Credentials and API keys are stored in an encrypted vault using AES-256-GCM. Plaintext keys are never returned to client browsers or logged to telemetry.
4. **Resilient Offloaded DAGs:** Payload outputs exceeding 64 KiB are automatically offloaded to private Supabase Storage buckets, preventing worker OOM memory crashes.
5. **Multi-Model Sovereign AI:** Orchestrates Google Gemini 2.5 Flash/Pro, Anthropic Claude 3.5 Sonnet, and OpenAI GPT-4o side-by-side with token metering and semantic pgvector retrieval.

---

## 2. Full Technology Stack & Architecture Layers

### Application & Frontend
- **Framework:** Next.js 15.5.28 (App Router, Turbopack, React 19)
- **Canvas Engine:** `@xyflow/react` (React Flow v12) with custom SVG bezier edge curves, animated packet indicators, and minimap controls
- **Styling & UI:** Tailwind CSS v4, Lucide React icons, Canvas Confetti
- **State Management:** Reactive memory + synchronized `localStorage` store (`app-store.ts`) with custom subscriber hooks (`use-app-store.ts`)

### Backend, Database & Cloud Infrastructure
- **Primary Database:** Supabase PostgreSQL 15+ hosted on AWS Mumbai (`ap-south-1`)
- **Isolation Model:** PostgreSQL Row-Level Security (RLS) across all 36 tables keyed by `workspace_id`
- **Vector Search:** `pgvector` extension for semantic embeddings and RAG chunks
- **Payload Offloading:** Supabase Storage (S3-compatible) with signed temporary read URLs
- **Authentication:** Supabase Auth (PKCE flow, Email/Password, Google OAuth, Session Cookies via `@supabase/ssr`)
- **Hosting / Control Plane:** Vercel Edge & Serverless Runtime

---

## 3. Database Architecture & Complete 36-Table Relational Schema

All 36 tables reside in the `public` schema with automated triggers, foreign key constraints (`ON DELETE CASCADE`), updated timestamps, and tenant RLS isolation:

### Core Identity & Workspaces
1. `profiles`: User accounts, emails, avatar URLs, system roles (`admin`, `member`, `guest`).
2. `organizations`: Enterprise parent accounts, legal billing info, domains.
3. `workspaces`: Individual collaborative tenant spaces (`personal`, `startup`, `company`, `team`) with environment tags (`production`, `staging`, `development`).
4. `workspace_members`: Membership joins mapping `user_id` to `workspace_id` with role assignments (`owner`, `admin`, `editor`, `operator`, `viewer`).
5. `workspace_roles`: Custom role definitions and capabilities.
6. `workspace_permissions`: Granular capability flags (e.g., `workflows:publish`, `credentials:manage`).
7. `workspace_invitations`: Time-limited email invitations with cryptographic token hashes.
8. `user_onboarding`: Persisted wizard progress tracking role, primary goal, selected starter, and step indices.

### Workflows & Versioning
9. `projects`: Folder organization containers inside workspaces.
10. `workflows`: Master workflow definitions (`name`, `description`, `status`, `active_version`, `nodes`, `edges`, `canvas_viewport`).
11. `workflow_versions`: Immutable historical snapshots (`version_number`, `definition`, `published_by`, `change_notes`).
12. `workflow_triggers`: Registered triggers linking inbound endpoints or schedules to target workflows.
13. `workflow_comments`: Collaborative canvas sticky notes and node review threads.

### Node Platform & Registry
14. `connectors`: Catalog of external integrations (`slack`, `whatsapp`, `razorpay`, `postgres`, `gemini`, `openapi_custom`).
15. `connector_versions`: Versioned schemas and release tags for connectors.
16. `node_definitions`: Declarative node metadata, category (`triggers`, `ai`, `logic`, `comm`, `data`, `utilities`), kind (`trigger`, `action`, `transform`), input schema, output schema, and config schema.
17. `node_operations`: Discrete executable actions per node (e.g., `sendMessage`, `insertRow`, `analyzeSentiment`).
18. `node_favorites`: User-starred nodes pinned in the universal node picker.
19. `workspace_connector_installs`: Enabled connectors per workspace.

### Credential Vault & Security
20. `credential_connections`: Encrypted credential records storing `encrypted_secret_data` (AES-256-GCM ciphertext + IV), masked token strings, integration type, and expiration timestamps.
21. `credential_audit`: Immutable log of every secret lease, decryption, validation test, or deletion.

### Execution Engine & Telemetry
22. `executions`: Master run records (`workflow_id`, `status: SUCCESS | RUNNING | FAILED | CANCELED`, `trigger_type`, `started_at`, `duration_ms`, `error_message`).
23. `node_executions`: Step-level execution metrics (`node_id`, `node_type`, `status`, `inputs_preview`, `outputs_preview`, `duration_ms`, `error_details`).
24. `execution_events`: Monotonic sequence streaming events emitted during execution for real-time canvas visualization.
25. `execution_payload_refs`: Pointers to oversized outputs stored in Supabase Storage (`storage_bucket`, `storage_path`, `size_bytes`, `sha256_hash`).
26. `trigger_subscriptions`: Active webhook and polling listener registrations.
27. `webhook_endpoints`: Inbound webhook listener endpoints with HMAC-SHA256 signature verification secrets and anti-replay nonces.

### AI Infrastructure & Knowledge RAG
28. `ai_provider_connections`: AI model connection credentials (Google Gemini, Anthropic, OpenAI).
29. `knowledge_sources`: Ingested organizational documentation (`.pdf`, `.md`, `.json`, `.docx`).
30. `knowledge_chunks`: Text split chunks with 1536-dimensional `vector` embeddings for semantic similarity search.
31. `ai_usage_records`: Token consumption logs, model names, latency in milliseconds, and estimated inference costs.

### Governance, Notifications & Legal
32. `audit_logs`: Enterprise compliance trail (`actor_id`, `action`, `resource_type`, `resource_id`, `ip_address`, `user_agent`, `payload`).
33. `notifications`: In-app system alerts, execution failure warnings, and quota threshold alerts.
34. `usage_records`: Metered step counts and execution quota consumption.
35. `workspace_activity`: Collaborative audit stream shown in the workspace sidebar.
36. `legal_acceptances`: Cryptographically verified acceptances of Terms of Service and DPDP Act Privacy Notice.

---

## 4. Decoupled NodePlatform & Extensibility System

All nodes implement the unified TypeScript interface defined in `src/lib/node-platform/types.ts`:

```typescript
export interface OVRANodeDefinition<TInput = any, TOutput = any, TConfig = any> {
  id: string;                      // e.g. "core.http_request"
  version: string;                 // Semver: "1.0.0"
  connector: string;               // e.g. "http-client"
  operationId: string;
  name: string;
  description: string;
  category: "triggers" | "ai" | "logic" | "comm" | "data" | "utilities";
  kind: "trigger" | "action" | "transform";
  inputsSchema: JSONSchema7;
  outputsSchema: JSONSchema7;
  configSchema: JSONSchema7;
  execution: {
    timeoutMs: number;
    idempotent: boolean;
    retryPolicy?: RetryPolicy;
  };
  execute: (input: TInput, config: TConfig, context: OVRAExecutionContext) => Promise<NodeExecutionResult<TOutput>>;
}
```

### The 15 Foundation Nodes
1. `core.webhook`: Inbound HMAC-verified HTTP trigger.
2. `core.schedule`: Cron and interval scheduler.
3. `core.http_request`: Universal REST client with 6-stage inspector and SSRF guards.
4. `core.graphql`: GraphQL query and mutation executor.
5. `ai.agent`: Multi-model prompt execution with structured JSON Schema output.
6. `ai.summarize`: High-throughput document and conversation summarization.
7. `ai.rag_retrieve`: Semantic vector search against Supabase `pgvector`.
8. `logic.if`: Two-way conditional branch evaluated via safe AST expressions.
9. `logic.switch`: Multi-branch case evaluator.
10. `data.transform`: JSON Schema transform and property remapping.
11. `data.filter`: Array filtration and matching.
12. `db.postgres`: Direct parameterized SQL execution with read/write locks.
13. `comm.slack`: Slack bot channel alert and thread dispatcher.
14. `comm.whatsapp`: WhatsApp Cloud API message and template dispatcher.
15. `comm.email`: Transactional SMTP / Resend notification sender.

### OpenAPI 3.0 / 3.1 Dynamic Importer
Developers can paste any raw Swagger / OpenAPI JSON or YAML URL into the Universal Node Picker. OVRA automatically parses endpoints, infers typed parameter forms from schemas, and registers brand-new action nodes dynamically without recompiling the frontend.

---

## 5. In-Canvas API Studio (Embedded Playground)

API inspection lives directly inside the visual canvas inspector for HTTP nodes (`InCanvasHttpInspector.tsx`), eliminating disjointed external playgrounds:

- **Configure Tab:** HTTP Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), Request URL with dynamic variable pills (e.g. `{{steps.webhook.leadEmail}}`), query parameter key-values, and headers.
- **Auth Tab:** None, Bearer Token, API Key (Header or Query), Basic Auth, or Vault Leased Secret.
- **Mapping Tab:** Interactive upstream output explorer with one-click syntax insertion.
- **Test Tab:** Live request execution runner with real-time status code badge, latency counter, and request summary.
- **Response Tab:** Formatted syntax-highlighted JSON viewer and **Automatic Schema Inference** (1-click generation of JSON Schema v7 contracts from live responses).
- **Advanced Tab:** Request timeouts (1,000ms – 30,000ms), redirect policy, and retry backoff.

---

## 6. Multi-Model AI Orchestrator & pgvector RAG

- **Google Gemini 2.5 Flash / Pro:** Fast reasoning with sub-250ms latency for real-time webhooks, triage, and high-frequency classification.
- **Anthropic Claude 3.5 Sonnet:** High-fidelity policy evaluation, complex multi-step reasoning, and long-form compliance synthesis.
- **OpenAI GPT-4o:** General multimodal extraction and code generation.
- **pgvector Knowledge Search:** Ingests internal PDFs and Markdown SOPs, splits text into 500-token chunks with 50-token overlap, and performs cosine similarity vector search directly inside PostgreSQL.
- **Human Approval Gates:** Can pause execution and emit webhook notification until a human operator clicks Approve/Reject in the dashboard.

---

## 7. Resilience, TestLab & Chaos Simulation Suite

Workflows are hardened against production runtime failures through automated platform mechanics:

1. **Payload Offloading (>64 KiB):** When step outputs exceed 64 KiB, the storage engine writes the payload to a private Supabase Storage bucket and replaces the node output with a typed reference pointer:
   ```json
   {
     "_ovra_storage_ref": true,
     "bucket": "execution-payloads",
     "path": "ws_123/exec_456/step_789.json",
     "sizeBytes": 142850,
     "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
   }
   ```
2. **Exponential Backoff:** Configurable retry policies (1s, 2s, 4s, 8s) for transient HTTP 429 and 503 errors.
3. **Dead Letter Queue (DLQ):** Workflows failing after maximum retry attempts route payloads into isolated dead-letter storage with failure notifications.
4. **TestLab Workbench (`/testlab`):** Dedicated simulation environment allowing developers to inject artificial 429 rate limits, 30-second timeouts, and payload overflow conditions to observe recovery mechanisms before production deployment.

---

## 8. Comprehensive Security Architecture & Vulnerability Audit

### Security Posture & Verified Controls
1. **SSRF Hardening (`isSafeUrl`):**
   - Strictly enforces `https:` and `http:` protocols.
   - Blocks loopback addresses: `localhost`, `127.0.0.1`, `0.0.0.0`, `127.0.0.0/8`, `::1`, `[::1]`.
   - Blocks private subnets: `10.0.0.0/8`, `192.168.0.0/16`, and full RFC 1918 `172.16.0.0/12` (`172.16.0.0` – `172.31.255.255`).
   - Blocks cloud metadata IP: `169.254.169.254` (AWS, Google Cloud, Azure) and link-local `fe80:*`.
2. **Safe Expression Evaluation:**
   - Employs deterministic Abstract Syntax Tree (AST) token parsing for condition evaluation (`ExpressionEngine`).
   - Zero occurrences of `eval()`, `new Function()`, or `vm.runInContext()` across the entire codebase.
3. **Zero Plaintext Credentials in Client Responses:**
   - Vault secrets are envelope-encrypted with AES-256-GCM.
   - Client views receive strictly masked strings (e.g. `xoxb-9821••••••••••••`).
   - Plaintext keys are leased only within ephemeral execution sandbox processes and zeroed upon completion.
4. **Tenant Isolation via PostgreSQL RLS:**
   - All 36 database tables enforce `ENABLE ROW LEVEL SECURITY`.
   - Queries set `ovra.workspace_id` in the database session, guaranteeing Workspace A cannot read or modify records belonging to Workspace B.
5. **No Secret Leaks in Git History:**
   - `.env*` files are strictly gitignored.
   - Secret scanning audits confirmed zero active API keys or credentials committed to the repository.

---

## 9. Developer Platform, Scoped API Keys & Webhook HMAC

- **Authentication:** Bearer token headers (`Authorization: Bearer ovra_live_...`).
- **Scoped API Keys:**
  - Prefixes: `ovra_live_` (Production) and `ovra_test_` (Sandbox).
  - Fine-grained scopes: `workflows:read`, `workflows:write`, `executions:trigger`, `credentials:manage`.
  - Secure "Reveal Once" modal ensures plain keys cannot be retrieved after initial generation.
- **HMAC-SHA256 Inbound Webhooks:**
  - Inbound webhook payloads are signed via `X-OVRA-Signature: t=1730700000,v1=abc...`.
  - Anti-replay timestamp tolerance: 300 seconds.
  - Multi-language verification snippets provided for Node.js, Python, and Go in `/developers/webhooks`.

---

## 10. Complete 33-Route Inventory & Product Information Architecture

| Route | Type | Description |
| :--- | :--- | :--- |
| `/` | Static | Full-screen continuous landing page with Hero, Architecture Shift, 4-Step Lifecycle, API Studio, AI Arena, TestLab, FAQ, and Footer |
| `/studio` | Static | Visual Workflow Canvas Studio with React Flow DAG editor, Universal Node Picker, In-Canvas Inspector, and AI Generation |
| `/workflows` | Static | Workflows Dashboard with Search, Status Filters (All, Active, Draft, Archived), Grid/List toggle, and JSON Export/Import |
| `/credentials` | Static | API Credentials & Vault with AES-256 status badges, Connection Tester, and Zero-State Onboarding |
| `/ai-studio` | Static | Multi-Model Prompt Workbench, Model Arena, and pgvector RAG Source Indexer |
| `/testlab` | Static | Resilience Workbench with Chaos Failure Injection, Waterfall Latency Telemetry, and DLQ Simulator |
| `/executions` | Static | Real-Time Execution Log Stream with Duration, Node Count, and Monotonic Step Telemetry |
| `/templates` | Static | Pre-built Workflow Gallery (Healthcare Triage, Payment Automation, Customer Churn Sentinel) |
| `/integrations` | Static | Categorized Connector Catalog with Official and Community Badges |
| `/settings` | Static | Workspace Management, Team Members, Environment Switching, and Activity Log |
| `/onboarding` | Static | 8-Step Interactive Onboarding Wizard with Role, Workspace Provisioning, and Live Guided DAG Simulation |
| `/developers` | Static | Developer Documentation, SDK Quickstart, REST Reference, and Rate Limits |
| `/developers/api-keys` | Static | Scoped API Key Provisioning, Scope Selector, and Key Revocation |
| `/developers/webhooks` | Static | Inbound Webhook Endpoint Manager, HMAC Signature Verification Code, and Test Ping Generator |
| `/auth/login` | Static | Sign-In with Email/Password, Google OAuth, and Instant Guest Preview |
| `/auth/register` | Static | Registration with Email/Password, Google OAuth, and DPDP/GDPR Compliance Checkboxes |
| `/auth/forgot-password` | Static | Password Reset Request Form triggering Supabase Recovery Emails |
| `/auth/reset-password` | Static | Authenticated Password Update Form with Validation |
| `/auth/callback` | Dynamic | Next.js Server Route Handler exchanging PKCE Auth Codes for Session Cookies |
| `/terms` | Static | Legal Terms of Service under Laws of the Republic of India |
| `/privacy` | Static | Privacy Notice compliant with India's DPDP Act, 2023 and GDPR |
| `/acceptable-use` | Static | Acceptable Use Policy detailing SSRF Defenses, Rate Limits, and Fair Use |
| `/cookies` | Static | Cookie Policy declaring strictly necessary session cookies and zero tracking |
| `/dpa` | Static | Enterprise Data Processing Addendum and Sub-processor Registry |
| `/api/v1/workflows` | Dynamic | REST API to list, create, and fetch workflow definitions |
| `/api/v1/executions` | Dynamic | REST API to trigger new workflow runs and fetch execution histories |
| `/api/v1/executions/[id]/events` | Dynamic | Server-Sent Events (SSE) stream for real-time live execution telemetry |
| `/api/v1/nodes` | Dynamic | REST API to query the decoupled node registry catalog |
| `/api/v1/nodes/test` | Dynamic | Server-side isolated node execution endpoint with SSRF protections |
| `/api/v1/credentials` | Dynamic | REST API to manage encrypted vault credentials |
| `/api/v1/connectors/openapi/import` | Dynamic | REST API to parse and register dynamic OpenAPI 3.0 specs |
| `/api/v1/webhooks/[triggerId]` | Dynamic | Inbound Webhook Ingestion Endpoint with HMAC-SHA256 validation |
| `/_not-found` | Static | Custom 404 Route with one-click return to Canvas Studio |

---

## 11. Competitor Gap Analysis & Benchmark Matrix

| Feature / Capability | Zapier | n8n | Make | Gumloop | Windmill | **OVRA** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Visual DAG Flow Canvas** | Linear | Yes | Yes | Yes | Code/Flow | **Yes (React Flow v12)** |
| **In-Canvas API Studio & Auto Schema** | No | Basic | Basic | No | Separate Tab | **Yes (6-Stage Inspector + Auto Schema)** |
| **Zero Arbitrary Eval (Safe AST)** | No | No (JS Eval) | No | Yes | Sandboxed | **Yes (Pure AST Engine)** |
| **Dynamic OpenAPI 3.0 Import** | No | Community | No | No | Yes | **Yes (Instant 1-Click Parser)** |
| **Oversized Payload Storage Offload** | Fails >6MB | Fails | Fails | Partial | S3 Offload | **Yes (>64 KiB Supabase Offload)** |
| **AES-256-GCM Leased Credentials** | Closed | DB encrypted | Closed | Closed | HashiCorp | **Yes (KMS / HSM Leased Tokens)** |
| **Multi-Model AI Arena (Side-by-Side)**| No | No | No | Yes | No | **Yes (Gemini / Claude / GPT)** |
| **Native pgvector RAG Knowledge** | No | Vector Store | Addon | Basic | Custom | **Yes (Supabase pgvector native)** |
| **Chaos Failure Injection (TestLab)** | No | No | No | No | No | **Yes (429, Timeout, Payload Chaos)** |
| **Tenant Row-Level Security (RLS)** | Closed | No | Closed | Closed | Enterprise | **Yes (36 Tables with RLS)** |

---

## 12. DevOps, Deployment & Environment Configuration

### Required Environment Variables
Create `.env.local` for local development or configure in Vercel Project Settings:

```bash
# Supabase Public Configuration (Safe for client browsers)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_publishable_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key

# Supabase Privileged Key (Server-only, strictly gitignored in .env.local, never committed)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
SUPABASE_SECRET_KEY=your_supabase_service_role_secret_key

# Optional AI Provider Keys for AI Studio & Nodes
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Build & Verification Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Compile and verify production build (33 routes)
pnpm build

# 3. Start local production daemon
pnpm start
```

---

*Document compiled and maintained by Ansh Rajore. All rights reserved. Registered Indian Sovereign Automation Platform.*
