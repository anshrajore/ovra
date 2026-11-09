# OVRA — Node & Operation Reality Matrix (v2.5 Audit)
**Date:** 9 November 2026  
**Auditor:** Principal Workflow Runtime Engineer  
**Standard:** Source-verified audit of `/src`. No documentation claim accepted without source code proof.

---

## 1. Classification Definitions
- **REAL**: Real executable implementation making actual external API calls or performing deterministic data manipulation, validating schemas, handling typed errors, and covered by contract tests.
- **PARTIAL**: Executable code exists, but lacks full item envelopes (`OVRAItem[]`), multi-output ports, credential broker leasing, or item-level lineage.
- **MOCK**: Returns hardcoded, simulated, or synthetic output without contacting external providers.
- **STATIC**: Manifest or UI card exists in catalogue, but executor is empty or unimplemented.
- **UNWIRED**: Node executor exists in repository, but the execution runner or canvas bypasses it with hardcoded logic.
- **BROKEN**: Runtime execution throws uncaught exceptions or fails basic invocation.
- **MISSING**: Referenced in documentation, templates, or integrations list, but zero code/manifest exists.

---

## 2. Comprehensive Node & Operation Matrix

| Connector | Resource | Operation ID | Node Kind | Status | Manifest Location | Executor Location | Auth Type | Dynamic Options? | Tested? | Evidence & Findings |
|---|---|---|---|---|---|---|---|---|---|---|
| **http-client** | request | `http.request` | action | **REAL** | `src/lib/runtime/nodes/core-nodes.ts:88` | `src/lib/runtime/nodes/core-nodes.ts:114` | Bearer, API Key, None | ❌ (Static fields) | **YES** (100% contract test) | SSRF-safe URL egress validation, header redaction, timeout with AbortSignal, per-item `OVRAItem` envelope output. |
| **manual** | trigger | `manual.trigger` | trigger | **REAL** | `src/lib/runtime/nodes/core-nodes.ts:16` | `src/lib/runtime/nodes/core-nodes.ts:39` | None | N/A | **YES** | Emits `OVRAItem[]` with `pairedItem` lineage index `0` and metadata timestamps. |
| **logic** | condition | `logic.if` | control | **REAL** | `src/lib/runtime/nodes/core-nodes.ts:182` | `src/lib/runtime/nodes/core-nodes.ts:209` | None | ❌ | **YES** | Multi-port routing (`port: "true"` vs `port: "false"`). Evaluates AST expressions per item, preserves lineage. |
| **transform** | fields | `data.set` | transform | **REAL** | `src/lib/runtime/nodes/core-nodes.ts:258` | `src/lib/runtime/nodes/core-nodes.ts:289` | None | ❌ | **YES** | Maps and sets fields using sandboxed AST expression engine per item. Preserves lineage. |
| **slack** | message | `slack.postMessage` | action | **REAL** | `src/lib/runtime/nodes/slack-node.ts:16` | `src/lib/runtime/nodes/slack-node.ts:55` | Bot Token (`xoxb-`), Webhook URL | ❌ | **YES** (Contract test) | Dispatches live HTTP requests to Slack Web API `chat.postMessage` or webhook URLs. Throws classified `OVRAExecutionError` on Slack API errors. Dry-run fallback when uncredentialed. |
| **webhook** | trigger | `core.webhook` | trigger | **PARTIAL** | `src/lib/node-platform/nodes/core-triggers.ts:15` | `src/lib/runtime/engine.ts:20` | HMAC-SHA256 | ❌ | Partial | Ingests payload via manual/webhook bridge; lacks durable activation/deactivation lifecycle and provider subscription registration. |
| **scheduler** | cron | `core.cron_trigger` | trigger | **MOCK** | `src/lib/node-platform/nodes/core-triggers.ts:80` | `src/lib/node-platform/nodes/core-triggers.ts:100` | None | ❌ | ❌ | Generates execution timestamp locally; lacks timezone evaluation, DST handling, missed-run catchup, and durable cron leases. |
| **logic** | router | `logic.switch` | control | **UNWIRED** | `src/lib/node-platform/nodes/core-logic.ts:95` | `src/lib/node-platform/nodes/core-logic.ts:135` | None | ❌ | ❌ | Manifest and case evaluation exist in legacy platform, but not yet converted to multi-port `OVRAOutputPort[]` in runtime. |
| **logic** | batch | `logic.loop` | control | **STATIC** | `src/lib/node-platform/nodes/core-logic.ts:175` | `src/lib/node-platform/nodes/core-logic.ts:195` | None | ❌ | ❌ | Stub returning `{ batchCount: 1 }`; does not actually split or iterate items across DAG loops. |
| **logic** | stream | `logic.merge` | control | **STATIC** | `src/lib/node-platform/nodes/core-logic.ts:220` | `src/lib/node-platform/nodes/core-logic.ts:240` | None | ❌ | ❌ | Merges dictionaries in-memory; lacks wait-for-both, key-join synchronization, or multi-parent item lineage. |
| **transform** | filter | `data.filter` | transform | **PARTIAL** | `src/lib/node-platform/nodes/core-data.ts:70` | `src/lib/node-platform/nodes/core-data.ts:95` | None | ❌ | ❌ | Evaluates condition on arrays, but does not use `OVRAItem` envelope. |
| **email** | message | `comm.email` | action | **MOCK** | `src/lib/node-platform/nodes/core-comm.ts:88` | `src/lib/node-platform/nodes/core-comm.ts:130` | API Key | ❌ | ❌ | Logs message to console and returns `{ queued: true }`; Resend/SES transport not connected. |
| **google-ai** | generate | `ai.gemini_flash` | ai | **PARTIAL** | `src/lib/node-platform/nodes/core-ai.ts:15` | `src/lib/node-platform/nodes/core-ai.ts:50` | API Key | ❌ | ❌ | Calls Google GenAI SDK if `GEMINI_API_KEY` exists in env; otherwise falls back to synthetic mock. |
| **razorpay** | payment | `app.razorpay` | action | **PARTIAL** | `src/lib/node-platform/nodes/core-apps.ts:15` | `src/lib/node-platform/nodes/core-apps.ts:50` | HMAC Secret | ❌ | ❌ | Real crypto HMAC calculation, but lacks real Razorpay REST API calls (Orders/Refunds). |
| **stripe** | customer | `app.stripe` | action | **STATIC** | `src/lib/node-platform/nodes/core-apps.ts:90` | `src/lib/node-platform/nodes/core-apps.ts:120` | Bearer Key | ❌ | ❌ | Empty placeholder returning mock customer ID without calling Stripe API. |
| **google-sheets** | spreadsheet | `sheets.list` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. Required as Milestone Benchmark. |
| **google-sheets** | spreadsheet | `sheets.get` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. |
| **google-sheets** | rows | `rows.read` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. |
| **google-sheets** | rows | `rows.append` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. |
| **google-sheets** | rows | `rows.update` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. |
| **google-sheets** | rows | `rows.search` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing. |
| **github** | issue | `github.createIssue` | action | **MISSING** | None | None | OAuth2 | ❌ | ❌ | Missing from runtime. |
| **postgres** | query | `db.query` | action | **MISSING** | None | None | Connection Profile | ❌ | ❌ | Missing from runtime. |

---

## 3. Summary Statistics
- **Total Registered Operations Audited:** 23
- **REAL:** 5 operations (HTTP Request, Manual Trigger, IF Condition, Set Fields, Slack Post Message)
- **PARTIAL:** 4 operations (Webhook, Filter, Gemini Flash, Razorpay HMAC)
- **MOCK:** 2 operations (Cron Trigger, Email Delivery)
- **STATIC:** 3 operations (Loop, Merge, Stripe)
- **UNWIRED:** 1 operation (Switch Router)
- **MISSING:** 8 operations (Google Sheets operations, GitHub, PostgreSQL)
