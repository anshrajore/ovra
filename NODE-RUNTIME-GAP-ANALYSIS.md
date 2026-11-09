# OVRA — Node Runtime Gap Analysis
**Date:** 7 November 2026  
**Focus:** Comparing OVRA's current execution engine against n8n-grade node runtime standards.

---

## 1. Summary of Architectural Divergence

| Architectural Layer | n8n Production Architecture | OVRA Current Implementation | Required Engineering Remedy |
|---|---|---|---|
| **Data Flow Envelope** | `INodeExecutionData[]` with `json: IDataObject`, `binary?: IBinaryKeyData`, `pairedItem?: IPairedItemData` | Single unstructured dictionary `Record<string, unknown>` merged across steps | Introduce typed `OVRAItem` envelope containing `json`, `binary`, `pairedItem`, and `metadata`. |
| **Output Ports** | Multi-index array `INodeExecutionData[][]` supporting named ports (`main`, `true`, `false`, `error`) | Single `outputPayload` dictionary with string property `branch: "yes"` | Introduce `OVRAOutputPort[]` with explicit `portId` and route downstream edges matching source port handle. |
| **Batching & Cardinality** | Nodes can accept $N$ items and emit $M$ items (split, aggregate, filter) | 1:1 single object mutation | Loop execution over `items.map()`, allowing nodes to emit 0 items (filter), 1 item (aggregate), or $N$ items (split). |
| **Item Lineage** | Output items preserve pointers to input index (`pairedItem: { item: 0 }`) | No lineage tracking | Output items store `{ nodeId, itemIndex }` for visual step debugging. |
| **Credential Scoping** | Ephemeral, least-privilege token injection via Server Broker | Direct string retrieval from node configuration | Node config references `credentialConnectionId`; runtime requests scoped lease from broker. |
| **Binary Assets** | S3/filesystem storage references with mime-type and byte lengths | Inlined strings | Offload binaries >64 KiB to Supabase Storage with signed ephemeral read URLs. |
| **Error Handling** | Node error modes: `stopWorkflow`, `continueRegularOutput`, `continueErrorOutput` | In-memory try/catch returning `{ error: err.message, processed: true }` | Structured `OVRAExecutionError` with classified codes (`AUTH_EXPIRED`, `RATE_LIMIT_EXHAUSTED`, `SSRF_BLOCKED`). |

---

## 2. Execution Engine Deep Dive

### Current Flaws in `src/lib/simulator/engine.ts`
1. **Hardcoded Demo Scoring:**
   ```ts
   // Line 211 in engine.ts
   const score = (currentPayload.qualificationScore as number) ?? 0.85;
   const conditionMet = score >= 0.7;
   selectedBranch = conditionMet ? "yes" : "no";
   ```
   This pattern breaks as soon as a user builds an arbitrary workflow that does not define a `qualificationScore`. Real DAG engines evaluate node expressions dynamically without knowing the domain of the workflow.

2. **Edge Traversal Blindness:**
   In React Flow, an IF node has two output handles: `true` (or `yes`) and `false` (or `no`). Edges have a `sourceHandle` attribute (`"true"` / `"false"`). The current engine ignores edge `sourceHandle` matching and relies on `selectedBranch = "yes"`.

---

## 3. Implementation Target: The Real Runtime Interface

```ts
export interface OVRAItem {
  json: Record<string, unknown>;
  binary?: Record<string, OVRAFileRef>;
  pairedItem?: { nodeId: string; itemIndex: number };
  metadata?: { sourceNodeId?: string; sourceExecutionId?: string; timestamp?: string };
}

export interface OVRAOutputPort {
  portId: string; // 'main', 'true', 'false', 'error'
  items: OVRAItem[];
}

export interface NodeExecutionContext {
  workspaceId: string;
  executionId: string;
  nodeId: string;
  signal: AbortSignal;
  credentials: {
    getLease(connectionId: string): Promise<CredentialLease>;
  };
  logger: {
    info(msg: string, meta?: unknown): void;
    warn(msg: string, meta?: unknown): void;
    error(msg: string, err?: unknown): void;
  };
}
```
