export type NodeType =
  | "core.webhook"
  | "core.manual_trigger"
  | "core.schedule"
  | "core.http_request"
  | "ai.agent"
  | "ai.model"
  | "logic.if"
  | "logic.switch"
  | "logic.merge"
  | "logic.loop"
  | "data.set_fields"
  | "data.json_parser"
  | "comm.slack"
  | "comm.email"
  | "comm.whatsapp"
  | "finance.razorpay"
  | "db.postgres"
  | "google.sheets"
  | "app.google_sheets"
  | (string & {});

export interface WorkflowNodeData {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
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
