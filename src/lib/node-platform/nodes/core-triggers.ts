import { defineNode, defineConnector } from "../sdk";
import { nodeRegistry } from "../registry";

// 1. Core Webhook Connector
export const webhookConnector = defineConnector({
  id: "webhook",
  name: "Webhook Trigger",
  description: "Receive inbound HTTP requests and trigger workflows",
  category: "triggers",
  icon: "webhook",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

export const webhookNode = defineNode(
  {
    id: "core.webhook",
    version: "1.0.0",
    connector: "webhook",
    operationId: "receiveWebhook",
    name: "Inbound Webhook",
    description: "Triggers when an external service sends an HTTP POST, GET, or PUT request",
    category: "triggers",
    kind: "trigger",
    inputsSchema: {},
    outputsSchema: {
      type: "object",
      properties: {
        body: { type: "object", description: "Parsed JSON request body" },
        headers: { type: "object", description: "Inbound HTTP headers" },
        query: { type: "object", description: "URL query parameters" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          title: "HTTP Method",
          enum: ["POST", "GET", "PUT"],
          default: "POST",
        },
        path: {
          type: "string",
          title: "Webhook Endpoint Path",
          default: "/api/v1/webhooks/default",
        },
        authType: {
          type: "string",
          title: "Authentication",
          enum: ["none", "bearer", "hmac_sha256"],
          default: "none",
        },
      },
      required: ["method", "path"],
    },
    execution: {
      timeoutMs: 10000,
      idempotent: true,
    },
  },
  async (input, config) => {
    return {
      status: "success",
      output: {
        body: (input as any)?.body || input || { message: "Webhook triggered successfully" },
        receivedAt: new Date().toISOString(),
        config,
      },
    };
  }
);

// 2. Manual Trigger
export const manualTriggerConnector = defineConnector({
  id: "manual-trigger",
  name: "Manual Canvas Trigger",
  description: "Trigger workflow manually with test inputs from the canvas",
  category: "triggers",
  icon: "play",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

export const manualTriggerNode = defineNode(
  {
    id: "core.manual_trigger",
    version: "1.0.0",
    connector: "manual-trigger",
    operationId: "manualRun",
    name: "Manual Trigger",
    description: "Triggers on user click or manual API invocation with custom test payload",
    category: "triggers",
    kind: "trigger",
    inputsSchema: {},
    outputsSchema: {
      type: "object",
      properties: {
        triggeredBy: { type: "string" },
        timestamp: { type: "string" },
        payload: { type: "object" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        mockPayload: {
          type: "object",
          title: "Initial Test Payload (JSON)",
          default: { source: "manual_studio_test", active: true },
        },
      },
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input, config, context) => {
    return {
      status: "success",
      output: {
        triggeredBy: context.workspaceId,
        timestamp: new Date().toISOString(),
        payload: (config as any)?.mockPayload || { test: true },
      },
    };
  }
);

// 3. Schedule / Cron Trigger
export const scheduleConnector = defineConnector({
  id: "schedule",
  name: "Schedule & Cron",
  description: "Periodic and cron-based automated execution",
  category: "triggers",
  icon: "clock",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

export const scheduleNode = defineNode(
  {
    id: "core.schedule",
    version: "1.0.0",
    connector: "schedule",
    operationId: "cronSchedule",
    name: "Schedule Trigger",
    description: "Triggers recurringly based on a specified interval or cron expression",
    category: "triggers",
    kind: "trigger",
    inputsSchema: {},
    outputsSchema: {
      type: "object",
      properties: {
        scheduledTime: { type: "string" },
        cronExpression: { type: "string" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        cron: {
          type: "string",
          title: "Cron Expression",
          default: "0 9 * * 1-5",
          description: "Standard 5-part cron syntax (e.g. Every weekday at 9:00 AM)",
        },
        timezone: {
          type: "string",
          title: "Timezone",
          default: "Asia/Kolkata",
          enum: ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"],
        },
      },
      required: ["cron"],
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (_, config) => {
    return {
      status: "success",
      output: {
        scheduledTime: new Date().toISOString(),
        cronExpression: (config as any)?.cron || "0 9 * * 1-5",
      },
    };
  }
);
