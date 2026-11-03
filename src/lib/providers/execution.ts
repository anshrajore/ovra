/**
 * Core interface for workflow execution.
 * Initial implementation: BoundedExecutionSimulator (Vercel-friendly)
 * Production implementation: Temporal Workflow Client
 */

export interface ExecutionRequest {
  workflowId: string;
  workflowVersionId: string;
  triggerType: "manual" | "webhook" | "schedule";
  triggerPayload?: Record<string, unknown>;
  workspaceId: string;
  organizationId: string;
}

export interface ExecutionResult {
  executionId: string;
  workflowId: string;
  status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELED";
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  nodeResults: Record<string, NodeExecutionState>;
  error?: string;
}

export interface NodeExecutionState {
  nodeId: string;
  nodeType: string;
  status: "idle" | "running" | "success" | "failed" | "skipped";
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionProvider {
  startExecution(request: ExecutionRequest): Promise<ExecutionResult>;
  getExecutionStatus(executionId: string): Promise<ExecutionResult | null>;
  cancelExecution(executionId: string): Promise<boolean>;
}
