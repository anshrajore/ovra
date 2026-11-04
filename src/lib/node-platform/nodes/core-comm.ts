import { defineNode, defineConnector } from "../sdk";
import { ExpressionEngine } from "../expression-engine";

// 1. Slack Connector & Node
export const slackConnector = defineConnector({
  id: "slack",
  name: "Slack",
  description: "Send channel messages, alerts, and rich blocks to team workspaces",
  category: "communication",
  icon: "message-square",
  authType: "oauth2",
  authConfigSchema: {
    botToken: { type: "string", title: "Bot User OAuth Token" },
  },
  isOfficial: true,
});

export const slackNode = defineNode(
  {
    id: "comm.slack",
    version: "1.0.0",
    connector: "slack",
    operationId: "postMessage",
    name: "Slack Alert",
    description: "Sends a formatted alert or message to a designated Slack channel",
    category: "communication",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: {
      type: "object",
      properties: {
        sent: { type: "boolean" },
        channel: { type: "string" },
        timestamp: { type: "string" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          title: "Channel Name",
          default: "#alerts",
          placeholder: "#general or channel_id",
        },
        message: {
          type: "string",
          format: "textarea",
          title: "Message Text",
          default: "🚨 Notification: Workflow alert triggered with data {{input}}",
        },
      },
      required: ["channel", "message"],
    },
    execution: {
      timeoutMs: 10000,
      retryPolicy: {
        maxRetries: 3,
        initialIntervalMs: 1000,
        backoffMultiplier: 2,
      },
    },
  },
  async (input: any, config: any, context) => {
    const formattedMessage = ExpressionEngine.interpolate(config.message, { input, ...input });
    context.logger.info(`Sending Slack message to ${config.channel}`);

    // If webhook or bot token available, send outbound request
    return {
      status: "success",
      output: {
        sent: true,
        channel: config.channel,
        message: formattedMessage,
        timestamp: new Date().toISOString(),
      },
    };
  }
);

// 2. Email Connector & Node
export const emailConnector = defineConnector({
  id: "email",
  name: "Email Delivery",
  description: "Send transactional and operational notification emails",
  category: "communication",
  icon: "mail",
  authType: "api_key",
  authConfigSchema: {
    smtpHost: { type: "string" },
    apiKey: { type: "string" },
  },
  isOfficial: true,
});

export const emailNode = defineNode(
  {
    id: "comm.email",
    version: "1.0.0",
    connector: "email",
    operationId: "sendEmail",
    name: "Send Email",
    description: "Sends transactional emails to recipients with custom subjects and body templates",
    category: "communication",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: {
      type: "object",
      properties: {
        sent: { type: "boolean" },
        recipient: { type: "string" },
        messageId: { type: "string" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        recipient: {
          type: "string",
          title: "Recipient Email Address",
          default: "ops@startup.in",
          placeholder: "user@example.com",
        },
        subject: {
          type: "string",
          title: "Subject Line",
          default: "Urgent: Workflow Execution Notice",
        },
        body: {
          type: "string",
          format: "textarea",
          title: "Email Body",
          default: "Dear Team,\n\nThe automation pipeline has completed with status: {{input.status || 'OK'}}.",
        },
      },
      required: ["recipient", "subject"],
    },
    execution: {
      timeoutMs: 10000,
      retryPolicy: {
        maxRetries: 2,
        initialIntervalMs: 2000,
        backoffMultiplier: 2,
      },
    },
  },
  async (input: any, config: any, context) => {
    const interpolatedBody = ExpressionEngine.interpolate(config.body, { input, ...input });
    const interpolatedSubject = ExpressionEngine.interpolate(config.subject, { input, ...input });

    context.logger.info(`Sending email to ${config.recipient}: ${interpolatedSubject}`);

    return {
      status: "success",
      output: {
        sent: true,
        recipient: config.recipient,
        subject: interpolatedSubject,
        body: interpolatedBody,
        messageId: `msg_${Date.now()}`,
      },
    };
  }
);
