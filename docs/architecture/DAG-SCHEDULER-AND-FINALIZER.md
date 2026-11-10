# DAG Scheduler & Finalizer Specification

**Milestone:** 2.7  
**Architecture Layer:** DAG Engine & Error Policy Dispatcher  
**Status:** Canonical Reference

---

## 1. Scheduling Algorithm

The authoritative scheduler executes nodes in topological dependency order using an item-driven work queue:

1. **Pre-Execution Validation:**
   - Detect and reject cyclic loops outside explicit `logic.loop` constructs.
   - Verify all edge source/target nodes and ports exist in registry.
   - Create immutable snapshot of the workflow version.
2. **Topological Item Queue:**
   - Seed trigger node with initial `OVRAItem[]`.
   - Nodes only become ready when all required upstream dependencies have produced outputs.
   - For merge nodes (`logic.merge`), wait for all active parallel upstream branches before executing.
3. **Per-Node Execution & Error Boundary:**
   - Every node execution runs within a bounded timeout (`AbortController`).
   - If node execution fails:
     - Policy `continue_error_output`: Route structured error envelope `{ _error: ... }` to port `error`.
     - Policy `continue_regular_output`: Route `{ _error: ... }` to port `main`.
     - Policy `stop_workflow` (default): Mark node as `failed`, record error, abort downstream branches, and transition workflow to `FAILED`.

---

## 2. Finalization Invariant

A workflow run is considered finalized if and only if:
1. No node is `running`, `ready`, or `pending` on any active branch.
2. No retry timer (`RETRY_WAIT`) or external suspension (`WAITING`) is registered.
3. Every executed node has a definitive status: `success`, `failed`, or `skipped`.

### Outcome Precedence Matrix:
| Condition | Terminal State |
|---|---|
| Workflow deadline exceeded | `TIMED_OUT` |
| Abort signal triggered by user | `CANCELED` |
| Any unhandled fatal error | `FAILED` |
| Errors handled via error ports, all branches terminal | `SUCCEEDED_WITH_ERRORS` |
| All active branches completed successfully | `SUCCESS` / `SUCCEEDED` |
