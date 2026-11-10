# OVRA API Inventory & Route Audit

**Audit Date:** 10 November 2026  
**Baseline Commit:** `56104e8`

---

## 1. Route Handlers Overview

OVRA exposes 9 backend route handlers under Next.js App Router (`src/app/api/v1/*` and `src/app/auth/callback/route.ts`).

| Endpoint | Method | Purpose | Persistence | Auth Level | Truth Status |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `/api/v1/workflows` | GET | List workflows in workspace | `appStore` / Supabase | Session / Public | PARTIAL (Currently returns `initialWorkflow`) |
| `/api/v1/workflows` | POST | Create or import workflow | `appStore` / Supabase | Session / Public | VERIFIED |
| `/api/v1/executions` | GET | List execution history | In-memory `executionHistoryStore` | Session / Public | VERIFIED |
| `/api/v1/executions` | POST | Start workflow execution DAG | `BoundedExecutionSimulator` / `RealWorkflowEngine` | Session / Public | VERIFIED |
| `/api/v1/executions/[id]/events` | GET | SSE stream of node run telemetry | In-memory `RealtimeProvider` | Session / Public | VERIFIED |
| `/api/v1/credentials` | GET / POST | Manage credential connections | In-memory / Supabase | Session / Public | PARTIAL |
| `/api/v1/connectors/openapi/import` | POST | Parse and import Swagger/OpenAPI | Transient AST parser | Session / Public | VERIFIED |
| `/api/v1/nodes` | GET | Catalogue of node manifests | `nodeRegistry` | Public | VERIFIED |
| `/api/v1/nodes/test` | POST | Test individual node execution | Node executor + mock context | Session / Public | VERIFIED |
| `/api/v1/test/runtime` | GET | Run 46 automated contract tests | `runRuntimeContractTests` | Developer / Public | VERIFIED |
| `/api/v1/webhooks/[triggerId]` | POST | Ingest external webhook payloads | Triggers workflow DAG | Public | VERIFIED |
| `/auth/callback` | GET | Supabase PKCE Auth exchange | Supabase Auth cookies | Public | VERIFIED |

---

## 2. Security and Egress Posture

- **Egress Filter:** Verified active via [`validateUrlEgress()`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/runtime/http-transport.ts). All outbound HTTP calls block loopback, metadata IPs (`169.254.169.254`), and private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- **Header Redaction:** Verified active via [`sanitizeHeaders()`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/runtime/http-transport.ts). `Authorization`, `x-api-key`, and `cookie` headers are replaced with `[REDACTED]`.
- **Payload Offload:** Payloads > 64 KiB generate a SHA-256 hash and offload to `storage://payloads/{hash}.json`.
- **Gaps:** Currently, API endpoints do not strictly enforce session tokens when running in local preview mode. Session verification must be gated strictly in production.
