# OVRA Threat Model & Security Specification

**Document ID:** OVRA-SEC-001  
**Version:** 1.0.0  
**Status:** Baseline locked  
**Date:** 2026-11-03  

## 1. Threat Landscape & Attack Surface
OVRA executes user-defined operations, stores external SaaS credentials, processes business payloads, and orchestrates distributed workloads. This produces a significantly wider attack surface than typical CRUD SaaS platforms.

## 2. Core Trust Boundaries
1. **Client / Edge Boundary:** Public internet to Web Studio & API Gateway (Fastify). TLS 1.3, strict CORS, rate limiting, and session security.
2. **Tenant Boundary:** Organization A to Organization B. Strong isolation in data, memory, caches, and queues.
3. **Control Plane / Execution Plane Boundary:** API/Database to Temporal workers. Workers only receive execution context for active tasks.
4. **Worker / Egress Boundary:** Worker nodes making outbound HTTP requests to the internet. Must be mediated by the SSRF Egress Gateway.
5. **Worker / Isolated Sandbox Boundary:** Trusted Activity worker to untrusted user-code runner.
6. **AI Agent / Platform Boundary:** LLM outputs to execution tools. All model tool invocations require strict parameter validation and authorization scopes.

## 3. High-Priority Threat Vectors & Defenses

### 3.1 Server-Side Request Forgery (SSRF)
- **Threat:** Workflows with HTTP Request nodes or Webhook calls attempting to access internal infrastructure (AWS/GCP metadata `169.254.169.254`, Kubernetes API `10.96.0.1`, internal PostgreSQL, Redis, or Temporal servers).
- **Defense:** Dedicated egress proxy.
  - DNS resolved securely before request initiation.
  - IP destinations validated against comprehensive non-routable, loopback, private, and link-local denylists (RFC 1918, RFC 3927, RFC 6890).
  - Explicit defense against DNS Rebinding (pinning resolved IP for the HTTP connection).
  - HTTP redirects re-validated through the entire DNS and IP screening logic.

### 3.2 Arbitrary Code Execution & Sandbox Breakout
- **Threat:** User-defined Python or JS scripts attempting container breakout, host filesystem tampering, or host kernel exploits.
- **Defense:**
  - Code nodes disabled by default in multi-tenant environments.
  - When enabled, execution is confined to userspace sandboxing (gVisor `runsc`) or microVMs (Kata Containers) on dedicated, isolated Kubernetes node pools.
  - Read-only root filesystem, non-root user, PID limit (e.g., 64), strict memory (e.g., 256MB) and CPU (e.g., 0.5 vCPU) quotas.
  - Zero access to host Docker socket, Kubernetes service accounts, or ambient secrets.

### 3.3 Credential Theft & Cross-Tenant Leakage
- **Threat:** Malicious tenants crafting workflows or extracting tokens from execution logs, traces, or database errors.
- **Defense:**
  - Envelope encryption using Cloud KMS / Vault Transit engine.
  - Sensitive secrets never stored in workflow JSON or returned to browsers.
  - Workers only receive short-lived, single-attempt credential leases scoped to the specific node being executed.
  - Universal redaction filters across OpenTelemetry tracing, structured logs, and WebSocket events.

### 3.4 Broken Object-Level Authorization (BOLA)
- **Threat:** Tenant A requests `/api/v1/executions/:id` or `/api/v1/credentials/:id` belonging to Tenant B.
- **Defense:**
  - Mandatory tenant ownership check at the application layer on every request.
  - PostgreSQL Row-Level Security (RLS) active on all tenant-owned tables using transaction-local configuration (`set_config('app.current_workspace_id', ..., true)`).
  - Negative cross-tenant integration test suite as a continuous release blocker.
