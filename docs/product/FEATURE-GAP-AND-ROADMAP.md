# OVRA — Feature Gap Analysis, Repository Audit & Implementation Roadmap

**Audit Date**: November 2026  
**Status Key**:
- `implemented/tested`: Built and verified via automated tests or live runtime execution.
- `implemented/untested`: Code exists in repository, awaiting full integration or regression suite.
- `mocked`: UI/stub exists, backed by mock adapter or simulated fallback.
- `missing`: Planned architectural capability not yet implemented.

---

## 1. Feature Inventory & Current Repository Audit

### 1.1 Canvas & Studio
| Feature | Status | Notes |
| :--- | :---: | :--- |
| React Flow Canvas with Custom Nodes | `implemented/tested` | `CustomNodes.tsx` with dynamic proxy node types |
| Universal Node Picker Modal | `implemented/tested` | Category filter, search, favorite toggle |
| OpenAPI 3.0 / 3.1 Importer | `implemented/tested` | In-canvas modal parsing JSON/YAML specs |
| Schema-Driven Dynamic Form Engine | `implemented/tested` | `DynamicNodeConfigForm.tsx` handles JSON schemas |
| In-Canvas HTTP Request Tester | `implemented/untested` | Moving to dedicated inspector tabs |
| Execution Telemetry Drawer | `implemented/tested` | Real-time sequence logs & node execution waterfall |
| Undo / Redo Command Stack | `implemented/tested` | Store-backed history stack |
| Canvas Notes / Annotations | `implemented/untested` | Sticky notes on React Flow graph |

### 1.2 Node Platform & Connectors
| Feature | Status | Notes |
| :--- | :---: | :--- |
| `@ovra/node-runtime-contracts` | `implemented/tested` | Strict TypeScript types in `src/lib/node-platform/` |
| `@ovra/expression-engine` | `implemented/tested` | AST-safe interpolation without `eval()` |
| 15 Foundation Nodes | `implemented/tested` | Webhook, manual trigger, schedule, HTTP, IF, switch, merge, loop, data transform, JSON parser, AI model, Slack, Email, Sheets, Postgres |
| Subworkflows (`core.subworkflow`) | `missing` | P1 roadmap |
| Error Trigger / Error Workflow | `missing` | P1 roadmap |
| Incomplete Runs Queue & Recovery | `missing` | P1 roadmap |

### 1.3 Backend & Infrastructure
| Feature | Status | Notes |
| :--- | :---: | :--- |
| 36 Supabase PostgreSQL Tables | `implemented/tested` | Live on project `ywfdgtsuyrqfazgimyqw` |
| Row-Level Security (RLS) Policies | `implemented/tested` | Multi-tenant isolation active across tables |
| AES-256-GCM Envelope Encryption | `implemented/tested` | `CredentialBroker` with DEK/KEK rotation |
| Durable Queue Runner (pgmq) | `implemented/tested` | DAG dependency scheduler & branch pruning |
| >64 KiB Storage Offloading | `implemented/tested` | Private bucket `ovra-execution-payloads` |
| Supabase Realtime Cursor Replay | `implemented/tested` | Monotonic event sequence & `/events?since=<seq>` |
| Dedicated Temporal Worker Plane | `missing` | Planned P2 production gate |

### 1.4 Product Surfaces & Pages
| Page | Status | Notes |
| :--- | :---: | :--- |
| Landing Page (`/`) | `implemented/tested` | Expanded product narrative & feature showcase |
| Studio Canvas (`/studio`) | `implemented/tested` | Active visual workflow editor |
| Workflows Directory (`/workflows`) | `implemented/tested` | Grid/list view with filter & search |
| Executions Telemetry (`/executions`)| `implemented/tested` | Historical executions & step viewer |
| Credentials Vault (`/credentials`) | `implemented/tested` | Encrypted credential connections |
| Templates Marketplace (`/templates`)| `implemented/tested` | Blueprint catalog |
| Integrations Catalog (`/integrations`)| `implemented/tested`| Connector directory |
| Auth Suite (`/auth/*`) | `implemented/tested` | Login, Register, Forgot/Reset Password, Callback |
| Onboarding Wizard (`/onboarding`) | `implemented/tested` | 8-step persisted onboarding flow |
| Developer Hub (`/developers`) | `implemented/tested` | Documentation, Quickstarts, Webhook HMAC guide |
| API Keys Console (`/developers/api-keys`)| `implemented/tested`| Scoped token provisioning |
| TestLab Simulator (`/testlab`) | `implemented/tested` | Chaos & failure injection workbench |
| AI Studio (`/ai-studio`) | `implemented/tested` | Multi-model prompt arena & pgvector RAG |
| Legal Pages (`/terms`, `/privacy`, etc.)| `implemented/tested`| Indian DPDP Act 2023 & GDPR compliance |
| Standalone API Playground | `deprecated` | Removed per Product Decision; unified in canvas |

---

## 2. Priority Phased Roadmap

### P0 — Must-Have Foundation (Current Release)
- In-canvas HTTP Request tester inside node inspector (Configure, Auth, Map, Test, Response, Advanced).
- Remove standalone `/developers/api-playground` route and align Developer Hub as documentation.
- Front page section harmonization with real platform capabilities.
- Live PostgreSQL RLS and AES-256-GCM envelope encryption verification.

### P1 — Operational Depth (Next Release)
- Reusable subworkflows with pinned versioning.
- Workflow-level error handlers and dedicated `core.error_trigger`.
- Incomplete runs queue with resume/retry capabilities.
- Human-in-the-loop approvals (`WAITING_FOR_HUMAN` state).
- Certified Indian business connectors (Razorpay, Zoho, WhatsApp Business Cloud).

### P2 — Enterprise Scale (Future Gate)
- Dedicated Temporal worker fleet migration for unbounded execution.
- Isolated gVisor/microVM worker sandboxes for untrusted custom code.
- Environment promotion: Development → Staging → Production with Git sync.
- SSO (SAML 2.0 / OIDC) and SIEM audit export.
