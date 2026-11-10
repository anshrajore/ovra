# In-Canvas AI Assistant Drawer & Draft Patch Specification

**Milestone:** 2.7  
**Architecture Layer:** Studio Canvas & AI Workflow Copilot  
**Status:** Canonical Reference

---

## 1. Architectural Principles

1. **Non-Destructive Sidecar:**
   - The AI Assistant is an in-canvas collapsible drawer docked to the right of the canvas (`w-[420px]`).
   - It NEVER navigates away from `/studio`.
   - Opening, closing, or interacting with the assistant does NOT pause, mutate, or abort active workflow executions.
2. **Draft Patch Isolation:**
   - Active executions bind to an immutable version snapshot (`v{N}`).
   - AI generation operates solely on the local draft revision (`WorkflowPatch`).
   - Generated changes are previewed as a diff (Nodes Added, Nodes Modified, Nodes Removed, Edges Changed).
   - Changes are only applied to the canvas upon explicit user approval ("Apply Patch").

---

## 2. WorkflowPatch Schema

```ts
export interface WorkflowPatch {
  patchId: string;
  baseVersion: number;
  workflowId: string;
  summary: string;
  operations: {
    addNodes?: WorkflowNodeData[];
    removeNodeIds?: string[];
    updateNodes?: Array<{ id: string; changes: Partial<WorkflowNodeData> }>;
    addEdges?: WorkflowConnection[];
    removeEdgeIds?: string[];
  };
  rationale: string;
  createdAt: string;
}
```

---

## 3. UI State Isolation Matrix

| Action | Impact on Execution | Impact on Canvas Draft |
|---|---|---|
| Open AI Drawer | Zero (passive UI open) | Zero (retains current nodes) |
| Type prompt / Generate | Zero (pure LLM call) | Zero (draft remains untouched) |
| Preview Diff | Zero (visual overlay only) | Zero (pending user decision) |
| Reject Patch | Zero | Zero (discards patch) |
| Apply Patch | Zero (execution uses v{N}) | Creates new local draft revision |
| Run Test | Executes patched draft | Sets execution status to RUNNING |
