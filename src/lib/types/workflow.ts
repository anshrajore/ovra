export type NodeType =
  | "core.webhook"
  | "ai.agent"
  | "logic.if"
  | "comm.slack"
  | "comm.email"
  | "comm.whatsapp"
  | "finance.razorpay"
  | "db.postgres"
  | "google.sheets";

export interface WorkflowNodeData {
  id: string;
  type: NodeType;
  label: string;
  subtitle: string;
  icon?: string;
  status?: "idle" | "running" | "success" | "failed" | "skipped";
  config?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  executionDurationMs?: number;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  status: "active" | "draft" | "archived";
  version: number;
  workspaceId: string;
  projectId?: string;
  lastSavedAt: string;
  nodes: WorkflowNodeData[];
  edges: WorkflowConnection[];
}
