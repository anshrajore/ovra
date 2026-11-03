import { WorkflowDefinition } from "../types/workflow";

export const initialWorkflow: WorkflowDefinition = {
  id: "wf_lead_qualification",
  name: "Lead Qualification Flow",
  description: "Automatically processes inbound leads, scores with AI Agent, and routes to Slack or Email.",
  status: "active",
  version: 1,
  workspaceId: "ws_team_workspace",
  projectId: "proj_sanjeevanix",
  lastSavedAt: "2 min ago",
  nodes: [
    {
      id: "node_webhook",
      type: "core.webhook",
      label: "Webhook",
      subtitle: "New lead received",
      status: "idle",
      config: {
        method: "POST",
        path: "/api/v1/webhooks/leads-inbound",
      },
    },
    {
      id: "node_ai_agent",
      type: "ai.agent",
      label: "AI Agent",
      subtitle: "Qualify the lead",
      status: "idle",
      config: {
        model: "gemini-1.5-pro",
        prompt: "Analyze the lead's company size, revenue, and inquiry message. Compute qualification score between 0.0 and 1.0.",
        threshold: 0.7,
      },
    },
    {
      id: "node_if_logic",
      type: "logic.if",
      label: "IF",
      subtitle: "Score >= 0.7",
      status: "idle",
      config: {
        condition: "$nodes.node_ai_agent.output.qualificationScore >= 0.7",
      },
    },
    {
      id: "node_slack",
      type: "comm.slack",
      label: "Slack",
      subtitle: "Notify Sales Team",
      status: "idle",
      config: {
        channel: "#sales-leads",
        notifyUsers: ["@sales-leads-bot", "@account-exec"],
      },
    },
    {
      id: "node_email",
      type: "comm.email",
      label: "Email",
      subtitle: "Send Nurture Email",
      status: "idle",
      config: {
        template: "nurture-series-welcome",
        sender: "team@ovra.in",
      },
    },
  ],
  edges: [
    {
      id: "edge_webhook_to_ai",
      source: "node_webhook",
      target: "node_ai_agent",
    },
    {
      id: "edge_ai_to_if",
      source: "node_ai_agent",
      target: "node_if_logic",
    },
    {
      id: "edge_if_to_slack",
      source: "node_if_logic",
      sourceHandle: "yes",
      target: "node_slack",
      label: "Yes",
    },
    {
      id: "edge_if_to_email",
      source: "node_if_logic",
      sourceHandle: "no",
      target: "node_email",
      label: "No",
    },
  ],
};
