# Root Cause Analysis: Executions Stuck in RUNNING State

**Document Version:** 1.0  
**Date:** 10 November 2026  
**Auditor:** Antigravity (Workflow Runtime & Distributed Systems Architect)  
**Defect Classification:** Severity-1 (Core Execution Reliability)

---

## 1. Executive Summary

Workflows in OVRA frequently remained in a perpetual `RUNNING` state (or falsely reported `SUCCESS` despite node errors) due to architectural coupling between UI simulation loops and the absence of an authoritative server-side state machine.

Specifically, five compounding defects were identified across `src/lib/simulator/engine.ts`, `src/lib/runtime/engine.ts`, `src/app/api/v1/executions/route.ts`, and `src/components/studio/WorkflowCanvas.tsx`.

---

## 2. End-to-End Execution Trace & Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant Canvas as WorkflowCanvas.tsx
    participant API as /api/v1/executions
    participant Sim as BoundedExecutionSimulator
    participant Real as RealWorkflowEngine
    participant Realtime as InMemoRealtimeProvider

    User->>Canvas: Clicks "Test Run"
    Canvas->>Sim: executeWorkflowGraph(workflow, executionId)
    Sim->>Sim: executionHistoryStore.set(executionId, { status: "RUNNING" })
    Sim->>Realtime: emitEvent("execution.started")
    Sim->>Real: Node Executor throws Error (e.g. HTTP 500, Auth Denied)
    Real-->>Sim: Unhandled Exception / Rejection
    Note over Sim: BUG 1: try/catch catches error but marks node status="success"
    Note over Sim: BUG 2: loop finishes, finalResult hardcoded to status="SUCCESS"
    Sim->>Realtime: emitEvent("execution.completed") with SUCCESS
    Note over Canvas: If exception breaks loop early:
    Note over Canvas: BUG 3: "node.completed" is never emitted
    Note over Canvas: BUG 4: executionHistoryStore remains status="RUNNING" forever
    Canvas-->>User: Spinner runs indefinitely; nodes remain yellow/running
```

---

## 3. Specific Root Causes & Line References

### Root Cause 1: Swallowed Errors Marked as "success"
**Source File:** [`src/lib/simulator/engine.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/simulator/engine.ts#L273-L289)
```ts
// Lines 273-289
} catch (err: any) {
  console.warn(`[OVRA Engine] Execution caught error in ${node.id} (${node.type}):`, err);
  outputPayload = { error: err.message || String(err), status: "failed" };
}

// Mark success (UNCONDITIONALLY!)
const durationMs = Date.now() - stepStartTime;
const successState: NodeExecutionState = {
  nodeId: node.id,
  nodeType: node.type,
  status: "success", // <-- CRITICAL BUG: Always marks success
...
```
*Impact:* A failed node was recorded as successful, and the DAG engine attempted to feed error output payloads as valid data into downstream nodes, causing cascading errors or infinite loops.

### Root Cause 2: Hardcoded Final Execution Outcome
**Source File:** [`src/lib/simulator/engine.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/simulator/engine.ts#L331-L342)
```ts
// Lines 331-334
const finalResult: ExecutionResult = {
  executionId,
  workflowId: workflow.id,
  status: "SUCCESS", // <-- CRITICAL BUG: Hardcoded SUCCESS
  startedAt: new Date(startTime).toISOString(),
...
```
*Impact:* Even if fatal node failures occurred, the execution finalizer emitted an `execution.completed` event claiming `SUCCESS`, confusing telemetry and preventing retry triggers.

### Root Cause 3: API POST Without Background Scheduling
**Source File:** [`src/app/api/v1/executions/route.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/app/api/v1/executions/route.ts#L8-L19)
```ts
export async function POST(request: Request) {
  const result = await defaultExecutionProvider.startExecution({ ... });
  return NextResponse.json({ success: true, data: result });
}
```
*Impact:* `startExecution` merely created an in-memory record with `status: "RUNNING"` and returned HTTP 200. It never scheduled a worker or called `executeWorkflowGraph`. Any API client querying `GET /api/v1/executions?id=...` received `status: "RUNNING"` permanently.

### Root Cause 4: Real Engine Missing Failure Event Emission
**Source File:** [`src/lib/runtime/engine.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/runtime/engine.ts#L394-L402)
```ts
} else {
  // Default: stop_workflow
  overallSuccess = false;
  stepRecord.status = "failed";
  steps.push(stepRecord);
  break; // stops branch without notifying realtime subscriber of terminal failure
}
```
*Impact:* The loop exited without emitting an `execution.failed` event to subscribers. If the frontend was awaiting a terminal event to stop the loading spinner, the UI remained stuck in `running`.

### Root Cause 5: AI Studio Modal Overwriting Active State
**Source File:** [`src/components/studio/AIStudioModal.tsx`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/components/studio/AIStudioModal.tsx#L37-L65)
```ts
const generatedWorkflow: WorkflowDefinition = {
  id: `wf_${Date.now()}`, // Generated a brand new ID
  ...
};
onApplyWorkflow(generatedWorkflow); // Replaced current active workflow in store
```
*Impact:* If an execution was underway, applying an AI prompt destroyed the active canvas nodes, replaced the workflow ID, disconnected running step callbacks, and left the execution engine running in the background without UI representation.

---

## 4. Remediation Plan

1. **State Machine (`EXECUTION-STATE-MACHINE.md`):**
   - Introduce strict enum: `CREATED`, `QUEUED`, `RUNNING`, `RETRY_WAIT`, `WAITING`, `PAUSED`, `CANCEL_REQUESTED`, `SUCCEEDED`, `SUCCEEDED_WITH_ERRORS`, `FAILED`, `CANCELED`, `TIMED_OUT`, `INTERNAL_ERROR`.
   - Terminal states are strictly immutable.
2. **Authoritative Scheduler & Finalizer (`DAG-SCHEDULER-AND-FINALIZER.md`):**
   - Single authoritative runner where any unhandled node failure transitions the execution directly to `FAILED`.
   - Node status explicitly recorded as `"failed"`, not `"success"`.
   - Realtime event `execution.failed` emitted reliably with error payload.
3. **In-Canvas AI Assistant Drawer (`AI-ASSISTANT-DRAFT-PATCH.md`):**
   - Replace full-screen modal / page routing with a collapsible right-side drawer.
   - Generates non-destructive `WorkflowPatch` (diff) against the current draft revision.
   - Runs against immutable draft snapshot; active executions continue unaffected.
