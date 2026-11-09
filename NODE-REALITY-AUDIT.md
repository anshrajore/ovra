# OVRA — Node Platform Reality Audit (Phase 0)
**Date:** 7 November 2026  
**Auditor:** Principal Engineer & Antigravity Lead Architect  
**Repository Checked:** `https://github.com/anshrajore/ovra.git` (`main`)  
**Scope:** Exhaustive inspection of node definitions, configuration schemas, credential paths, executors, API calls, error handling, tests, and runtime execution paths.

---

## 1. Executive Summary & Classification Standard

Each node and operation in OVRA is classified strictly according to actual implementation evidence in the repository:

- **REAL**: Has a real executable implementation that makes real external network I/O or performs real deterministic transformations, handles real errors, validates input/output against schema, and has tests.
- **PARTIAL**: Has real execution code or schema, but lacks full item envelopes, multiple output ports, credential leases, or error classification.
- **MOCK**: Generates synthetic, simulated, or hardcoded mock payloads without executing actual external provider APIs.
- **STATIC**: Exists only as a metadata record, icon, catalogue entry, or UI definition without an executor function.
- **UNWIRED**: Has an executor function defined, but the runtime execution engine (`simulator/engine.ts` or canvas) bypasses it or substitutes hardcoded branching.
- **MISSING**: Documented or referenced in handover/docs, but no manifest or code exists in `src/`.

---

## 2. Node & Operation Inventory Audit

| Node ID | Connector | Operation ID | Kind | Current Status | Code Path | Real API Call? | Credential Broker Leased? | Tests Exist? | Finding Summary |
|---|---|---|---|---|---|---|---|---|---|
| `core.http_request` | `http-client` | `httpRequest` | `action` | **PARTIAL** | `src/lib/node-platform/nodes/core-http.ts` | **YES** (`fetch`) | ❌ (reads raw config key) | ❌ | Real SSRF check and `fetch()` call, but lacks `OVRAItem[]` envelope, item batching, and paired-item lineage. |
| `core.webhook` | `webhook` | `inboundWebhook` | `trigger` | **MOCK** | `src/lib/simulator/engine.ts:195` | ❌ | ❌ | ❌ | Hardcodes synthetic payload in simulator; API route `/api/v1/webhooks/[triggerId]` exists but is disconnected from live DAG execution. |
| `core.manual_trigger` | `manual` | `start` | `trigger` | **PARTIAL** | `src/lib/node-platform/nodes/core-triggers.ts` | N/A (Local) | N/A | ❌ | Passes input fixture, but lacks item envelope and batching. |
| `core.cron_trigger` | `scheduler` | `cronSchedule` | `trigger` | **MOCK** | `src/lib/node-platform/nodes/core-triggers.ts` | ❌ | ❌ | ❌ | Generates timestamp in-memory; no durable scheduler or missed-run policy exists. |
| `logic.if` | `logic` | `condition` | `control` | **UNWIRED** | `src/lib/node-platform/nodes/core-logic.ts:16` | N/A (Local) | N/A | ❌ | Manifest and AST comparison logic exist, but `simulator/engine.ts:210` hardcoded `score >= 0.7` instead of calling `ifNode.execute()`. |
| `logic.switch` | `logic` | `switchCase` | `control` | **UNWIRED** | `src/lib/node-platform/nodes/core-logic.ts:95` | N/A (Local) | N/A | ❌ | Registered in registry, but simulator does not route to multiple named output ports. |
| `logic.loop` | `logic` | `splitBatches` | `control` | **STATIC** | `src/lib/node-platform/nodes/core-logic.ts:175` | N/A (Local) | N/A | ❌ | Manifest defined; execute returns `{ batchCount: 1 }` without looping DAG nodes. |
| `logic.merge` | `logic` | `mergeStreams` | `control` | **STATIC** | `src/lib/node-platform/nodes/core-logic.ts:220` | N/A (Local) | N/A | ❌ | Stub returning merged payload; no wait-for-both or key-join synchronization. |
| `data.set` | `transform` | `editFields` | `transform` | **PARTIAL** | `src/lib/node-platform/nodes/core-data.ts:15` | N/A (Local) | N/A | ❌ | Interpolates keys using AST parser, but does not handle `OVRAItem` arrays or paired lineage. |
| `data.filter` | `transform` | `filterItems` | `transform` | **PARTIAL** | `src/lib/node-platform/nodes/core-data.ts:70` | N/A (Local) | N/A | ❌ | Simple array filter; lacks item lineage and port routing. |
| `comm.slack` | `slack` | `postMessage` | `action` | **MOCK** | `src/lib/node-platform/nodes/core-comm.ts:18` | ❌ | ❌ | ❌ | `execute()` logs message and returns `{ sent: true }` without making real Slack Web API call. |
| `comm.email` | `email` | `sendEmail` | `action` | **MOCK** | `src/lib/node-platform/nodes/core-comm.ts:88` | ❌ | ❌ | ❌ | Logs to console and returns `{ queued: true }`; Resend/SES transport not connected. |
| `ai.gemini_flash` | `google-ai` | `generate` | `ai` | **PARTIAL** | `src/lib/node-platform/nodes/core-ai.ts:15` | **YES** (if API key set) | ❌ (env fallback) | ❌ | Calls Google Generative AI SDK if `GEMINI_API_KEY` present; otherwise returns mock response. |
| `ai.agent` | `agent` | `autonomous` | `ai` | **MOCK** | `src/lib/simulator/engine.ts:201` | ❌ | ❌ | ❌ | Hardcoded `score: 0.88`, `intent: "Enterprise High-Priority"` in simulator. |
| `app.razorpay` | `razorpay` | `verifyPayment` | `action` | **PARTIAL** | `src/lib/node-platform/nodes/core-apps.ts:15` | **YES** (HMAC verify) | ❌ | Real crypto HMAC calculation, but lacks real Razorpay REST API calls (Orders/Refunds). |
| `app.stripe` | `stripe` | `createCustomer` | `action` | **STATIC** | `src/lib/node-platform/nodes/core-apps.ts:90` | ❌ | ❌ | ❌ | Only manifest and placeholder schema exist. |
| `app.google_sheets`| `google-sheets`| `appendRow` | `action` | **MISSING** | None | ❌ | ❌ | ❌ | Referenced in documentation; no code file exists in `src/lib/node-platform/nodes/`. |
| `app.github` | `github` | `createIssue` | `action` | **MISSING** | None | ❌ | ❌ | ❌ | Listed in integrations catalogue; no node executor exists. |

---

## 3. Runtime Architecture Reality

1. **DAG Execution Engine (`src/lib/simulator/engine.ts`):**
   - **Finding:** The runtime currently operates as an in-memory sequencer with artificial `await delay(700)` delays.
   - **Root Cause of Demo Feel:** Instead of passing standardized `OVRAItem` items through node output ports (`true`/`false`), the simulator inspects node labels/types and applies fallback hardcoded branching (`if node.type === "logic.if" => selectedBranch = "yes"`).
2. **Data Model:**
   - Single monolithic `currentPayload` dictionary is mutated and merged down the graph (`currentPayload = { ...currentPayload, ...outputPayload }`).
   - Multiple items, item splitting, batch iteration, and paired-item lineage do not exist in the current runtime.
3. **SSRF & HTTP Transport:**
   - `core-http.ts` contains a good initial IP blocklist (`isSafeUrl`), but DNS resolution rebinding defense and redirect re-checking are absent.

---

## 4. Required Action Items to Achieve Real Node Platform

1. **Retire hardcoded simulator logic:** Delete lines 195–234 in `src/lib/simulator/engine.ts` and route all node executions through versioned executors.
2. **Implement `OVRAItem` envelope & multiple output ports:** Support batching, item lineage, and port-based edge traversal.
3. **Build real Slack Web API executor:** Implement real `https://slack.com/api/chat.postMessage` HTTP call with bot token resolution and error handling.
4. **Implement real IF multi-port branching:** Route items to `true` or `false` ports dynamically based on condition evaluation.
