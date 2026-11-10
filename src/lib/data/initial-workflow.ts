import { WorkflowDefinition } from "../types/workflow";

export const initialWorkflow: WorkflowDefinition = {
  id: "wf_blank",
  name: "Untitled Automation",
  description: "Blank canvas workflow",
  status: "draft",
  version: 1,
  workspaceId: "ws_team_workspace",
  projectId: "proj_enterprise_core",
  lastSavedAt: "Just now",
  nodes: [],
  edges: [],
};

