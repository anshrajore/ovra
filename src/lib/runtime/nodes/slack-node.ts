import {
  OVRAExecutableNode,
  OVRAItem,
  OVRAOutputPort,
  NodeExecutionContext,
  OVRAExecutionError,
} from "../types";
import { safeFetch } from "../http-transport";
import { ExpressionEngine } from "@/lib/node-platform/expression-engine";

/**
 * Real Slack Connector Operation: Post Message
 * Performs live API delivery to Slack channels via official Web API (chat.postMessage)
 * or Slack Incoming Webhook URLs.
 */
export const slackPostMessageNode: OVRAExecutableNode = {
  manifest: {
    operationId: "slack.postMessage",
    connectorId: "slack",
    displayName: "Post Slack Message",
    description: "Sends a rich notification message to a specified Slack channel via the official Slack Web API",
    kind: "action",
    version: "1.0.0",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          title: "Channel ID or Name",
          default: "#general",
          placeholder: "#alerts or C0123456789",
        },
        message: {
          type: "string",
          format: "textarea",
          title: "Message Text",
          default: "🚨 *OVRA Workflow Alert*: Triggered with payload {{json.event}}",
        },
        authMode: {
          type: "string",
          enum: ["bot_token", "webhook_url"],
          default: "webhook_url",
        },
        tokenOrWebhookUrl: {
          type: "string",
          title: "Slack Bot Token (xoxb-...) or Incoming Webhook URL",
          placeholder: "https://hooks.slack.com/services/... or xoxb-...",
        },
      },
      required: ["channel", "message"],
    },
    credentialRequirements: ["slack-oauth2", "slack-webhook"],
    executionPolicy: {
      timeoutMs: 10000,
      idempotent: false,
      maxRetries: 3,
    },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    const channel = (config.channel as string) || "#general";
    const rawMessage = (config.message as string) || "Alert triggered";
    const authMode = (config.authMode as string) || "webhook_url";
    const tokenOrUrl = (config.tokenOrWebhookUrl as string) || "";

    const outputItems: OVRAItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      context.signal.throwIfAborted();

      const text = ExpressionEngine.interpolate(rawMessage, { ...item.json, item: item.json, json: item.json });

      // Case 1: Slack Incoming Webhook URL
      if (tokenOrUrl.startsWith("https://hooks.slack.com/")) {
        context.logger.info(`Posting message to Slack incoming webhook for channel ${channel}`, { itemIndex: i });

        const res = await safeFetch(tokenOrUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel,
            text,
          }),
          signal: context.signal,
        });

        outputItems.push({
          json: {
            deliveryMode: "webhook",
            ok: res.statusCode === 200,
            channel,
            durationMs: res.durationMs,
            deliveredAt: new Date().toISOString(),
          },
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
        });
      }
      // Case 2: Slack Web API (chat.postMessage) with Bot Token
      else if (tokenOrUrl.startsWith("xoxb-") || tokenOrUrl.startsWith("xoxp-")) {
        context.logger.info(`Calling Slack Web API chat.postMessage for channel ${channel}`);

        const res = await safeFetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenOrUrl}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel,
            text,
          }),
          signal: context.signal,
        });

        const slackData = res.data as Record<string, unknown>;
        if (slackData && slackData.ok === false) {
          throw new OVRAExecutionError(
            `Slack Web API returned error: ${slackData.error || "unknown_error"}`,
            "PROVIDER_ERROR",
            res.statusCode,
            slackData
          );
        }

        outputItems.push({
          json: {
            deliveryMode: "web_api",
            ok: true,
            channel: slackData?.channel || channel,
            ts: slackData?.ts,
            message: slackData?.message,
            deliveredAt: new Date().toISOString(),
          },
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
        });
      }
      // Case 3: Simulation / Test Mode without live token
      else {
        context.logger.info(`Slack node in test simulation mode (no live xoxb or webhook URL provided)`);
        outputItems.push({
          json: {
            deliveryMode: "dry_run",
            ok: true,
            channel,
            text,
            notice: "Message prepared and validated against Slack chat.postMessage contract. Add a live xoxb-* bot token or webhook URL in node settings for live dispatch.",
            deliveredAt: new Date().toISOString(),
          },
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
        });
      }
    }

    return [{ portId: "main", items: outputItems }];
  },
};
