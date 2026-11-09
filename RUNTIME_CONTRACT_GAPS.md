# OVRA — Runtime Contract Gaps & Architectural Specification (v2.5)
**Date:** 9 November 2026  
**Auditor:** Principal Workflow Runtime Engineer  
**Reference Benchmark:** n8n `packages/core/src/execution-engine/workflow-execute.ts` & `INodeExecutionData`

---

## 1. Executive Gap Analysis

While OVRA 2.4 established the initial `OVRAItem` envelope and multi-port routing for core nodes (`HTTP`, `IF`, `Set`, `Slack`), several fundamental architectural capabilities are required to elevate OVRA to an n8n-class deterministic workflow execution engine.

---

## 2. Gap Breakdown & Architectural Solutions

### Gap 1: Multi-Parent Item Lineage (`pairedItem` limitation)
- **Current State in `src/lib/runtime/types.ts`:**
  ```ts
  export interface OVRAItem {
    pairedItem?: { nodeId: string; itemIndex: number };
  }
  ```
  This only tracks a single parent node.
- **The Failure Mode:** When a `Merge` node combines items from Branch A (e.g. Stripe Customer) and Branch B (e.g. CRM Account), each merged item has two parent lineage sources. Single-parent lineage truncates origin history, making downstream error diagnosis impossible.
- **The Required Remedy:**
  ```ts
  export interface OVRAPairedItemRef {
    nodeId: string;
    itemIndex: number;
    portId?: string;
  }
  export interface OVRAItem {
    json: Record<string, unknown>;
    binary?: Record<string, OVRAFileRef>;
    // Multi-parent lineage array
    pairedItems?: OVRAPairedItemRef[];
    metadata?: {
      sourceNodeId?: string;
      sourceExecutionId?: string;
      timestamp?: string;
      schemaVersion?: string;
    };
  }
  ```

### Gap 2: Node Execution Modes (Per-Item vs Batch vs Execute-Once)
- **Current State:** Core nodes run an ad-hoc `for (const item of items)` loop or process all items as a batch.
- **The Failure Mode:** Connectors have different API semantics:
  1. *Per-Item*: E.g. Send Slack Message for each lead. If item 3 fails (429 or invalid email), items 1, 2, 4 must still process or report granular per-item errors.
  2. *Batch*: E.g. Google Sheets `appendRows` bulk insert or database bulk insert accepts an array of rows in one API call.
  3. *Execute-Once*: E.g. Webhook Trigger or Global Token Generator executes once regardless of input.
- **The Required Remedy:**
  Declare `executionMode: 'per_item' | 'batch' | 'execute_once'` in `OVRAOperationManifest`. The runtime engine manages batch slicing, concurrency, and per-item error isolation automatically.

### Gap 3: Bounded Concurrency & Cancellation
- **Current State:** Requests execute sequentially in a `for` loop, causing excessive execution latency for large batches.
- **The Required Remedy:**
  Support configurable `concurrencyLimit: number` (e.g., 5 parallel requests) using `p-limit` or worker concurrency pool. Pass `AbortSignal` to all network and subworkflow calls, reacting instantly when a user clicks "Cancel Execution" or a timeout occurs.

### Gap 4: Configurable Node-Level Error Policies
- **Current State:** `src/lib/runtime/engine.ts` currently catches exceptions and stops the entire DAG (`overallSuccess = false; break;`).
- **The Failure Mode:** Users often want non-fatal errors to:
  1. *Continue Regular Output*: Emit an item with `{ _error: { message, code } }`.
  2. *Continue Error Output*: Route failed items to a dedicated `"error"` output port for fallback alerts (e.g. Slack on-call, PagerDuty).
  3. *Stop Workflow*: Default fail-fast behavior.
- **The Required Remedy:**
  Implement node configuration property `onError: 'stop_workflow' | 'continue_regular_output' | 'continue_error_output'`. When set to `continue_error_output`, failed items are directed to `portId: "error"`.

### Gap 5: Binary References & Storage Offloading (>64 KiB)
- **Current State:** `http-transport.ts` truncates text over 64 KiB with `_offloadNotice`.
- **The Required Remedy:**
  Instead of truncating, pipe large responses directly to Supabase Storage (S3-compatible bucket `execution-payloads`), returning an immutable `OVRAFileRef`:
  ```ts
  export interface OVRAFileRef {
    ref: string; // e.g., 'storage://workspaces/ws_1/exec_2/node_3/payload.json'
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
    url?: string; // Signed ephemeral download URL
  }
  ```

### Gap 6: Exponential Backoff Retry with Jitter
- **Current State:** Retry count declared in manifest, but retry execution loop is manual or absent in transport.
- **The Required Remedy:**
  Implement unified retry interceptor in `safeFetch` that honors `Retry-After` HTTP headers, applies full jitter exponential backoff (`delay = Math.min(maxDelay, baseDelay * 2 ** attempt + Math.random() * 100)`), and only retries classified transient errors (HTTP 429, 502, 503, 504, `ECONNRESET`).
