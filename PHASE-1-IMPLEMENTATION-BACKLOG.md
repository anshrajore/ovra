# OVRA — Phase 1 Implementation Backlog: Runtime Contracts
**Date:** 9 November 2026  
**Target Milestone:** Universal Node Runtime Contract & Golden Test Suite  
**Status:** Ready for Execution (Pending Review Approval)

---

## 1. Phase 1 Engineering Goals
Elevate the current lightweight `OVRAItem` runtime into a full n8n-class deterministic workflow execution engine that supports:
1. Multi-parent item lineage (`pairedItems[]`).
2. Stable multi-port I/O with dedicated error ports (`main`, `true`, `false`, `error`).
3. Three execution modes: `per_item`, `batch`, `execute_once`.
4. Bounded concurrency and cancellation via `AbortSignal`.
5. Granular node error policies (`stop_workflow`, `continue_regular_output`, `continue_error_output`).
6. Retry with exponential backoff and randomized jitter.
7. Binary payload offloading (>64 KiB) to Supabase Storage with signed references.
8. Deterministic golden contract test suite.

---

## 2. Detailed Task Breakdown

### Task 1.1: Multi-Parent Item Lineage & Envelope Redesign
- **Target File:** `src/lib/runtime/types.ts`
- **Specification:**
  - Define `OVRAPairedItemRef`: `{ nodeId: string; itemIndex: number; portId?: string }`.
  - Update `OVRAItem`:
    - `json: Record<string, unknown>`
    - `binary?: Record<string, OVRAFileRef>`
    - `pairedItems: OVRAPairedItemRef[]` (supports 1 parent for serial nodes, $N$ parents for Merge/Join nodes).
    - `metadata: { sourceNodeId: string; sourceExecutionId: string; timestamp: string; schemaVersion: string }`.
- **Acceptance Criteria:** A merged item created from 2 branch items retains both parent references.

---

### Task 1.2: Multi-Port Output Contract & Error Ports
- **Target File:** `src/lib/runtime/types.ts` & `src/lib/runtime/engine.ts`
- **Specification:**
  - Standardize output ports:
    - Primary outputs: `portId: "main" | "true" | "false" | string`
    - Error output: `portId: "error"`
  - When a node fails and its configuration specifies `onError: "continue_error_output"`, the failed item is enriched with `{ _error: { code, message, statusCode, stack } }` and routed to `portId: "error"`.
- **Acceptance Criteria:** Edge matching traverses downstream nodes connected to `"error"` handle without failing the entire DAG.

---

### Task 1.3: Per-Item, Batch & Execute-Once Execution Modes
- **Target File:** `src/lib/runtime/types.ts` & `src/lib/runtime/nodes/core-nodes.ts`
- **Specification:**
  - Add `executionMode: 'per_item' | 'batch' | 'execute_once'` to `OVRAOperationManifest`.
  - If `per_item`: Runtime passes items one by one to `executeItem(item, config, context)` with item-level error isolation.
  - If `batch`: Runtime passes `items[]` directly to `executeBatch(items, config, context)`.
  - If `execute_once`: Runtime invokes operation once regardless of input items.
- **Acceptance Criteria:** A batch of 5 items with 1 invalid item processes the 4 valid items and records 1 isolated item error when `continue_regular_output` is configured.

---

### Task 1.4: Bounded Concurrency & Cancellation
- **Target File:** `src/lib/runtime/engine.ts`
- **Specification:**
  - Implement concurrent item execution pool with configurable concurrency limit (default: 5 concurrent workers per node).
  - Plumb `AbortController` and `context.signal` through all node execution loops.
  - Check `signal.throwIfAborted()` before and during HTTP/DB calls.
- **Acceptance Criteria:** Cancelling an execution immediately aborts in-flight fetch requests.

---

### Task 1.5: Retry with Exponential Backoff & Full Jitter
- **Target File:** `src/lib/runtime/http-transport.ts`
- **Specification:**
  - Implement retry interceptor honoring `maxRetries` (from manifest or node config).
  - Calculate backoff delay: `delay = Math.min(maxDelay, initialIntervalMs * (2 ** attempt) + Math.random() * 100)`.
  - Honor HTTP `Retry-After` header when provider returns 429.
  - Only retry classified transient errors (`RATE_LIMIT_EXHAUSTED`, `TIMEOUT`, HTTP 502/503/504). Never retry 400, 401, 403, 404.
- **Acceptance Criteria:** Mock 429 response is retried up to 3 times before throwing.

---

### Task 1.6: Payload Offloading (>64 KiB) to Storage
- **Target File:** `src/lib/runtime/http-transport.ts` & `src/lib/providers/supabase-storage.ts`
- **Specification:**
  - Inspect response body byte size.
  - If response size > 65,536 bytes (64 KiB):
    - Stream payload to Supabase Storage bucket `execution-payloads`.
    - Generate SHA-256 hash.
    - Set `binary[fileName] = { ref: "storage://...", fileName, mimeType, sizeBytes, sha256 }`.
    - Return truncated preview in `json` with pointer reference.
- **Acceptance Criteria:** A 2MB simulated payload is offloaded to storage without ballooning in-memory DAG state.

---

### Task 1.7: Golden Contract Test Suite
- **Target File:** `src/lib/runtime/__tests__/runtime-contracts.test.ts`
- **Specification:**
  - Test 1: Multi-parent lineage merge preservation.
  - Test 2: Multi-port routing (true/false/error).
  - Test 3: Per-item vs batch execution modes.
  - Test 4: Bounded concurrency and cancellation abort.
  - Test 5: Exponential backoff retry on 429.
  - Test 6: Payload offload threshold (>64 KiB).
- **Acceptance Criteria:** All contract tests pass cleanly with 100% assertions satisfied.
