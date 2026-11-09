import {
  OVRAExecutableNode,
  OVRAItem,
  OVRAOutputPort,
  OVRAPairedItemRef,
  NodeExecutionContext,
  OVRAExecutionError,
} from "../types";
import { safeFetch } from "../http-transport";
import { ExpressionEngine } from "@/lib/node-platform/expression-engine";

/**
 * Real Email Delivery Node (Connector: email)
 * Dispatches real transactional and operational emails via Resend REST API (https://api.resend.com/emails)
 * or SendGrid REST API (https://api.sendgrid.com/v3/mail/send) with AST template interpolation.
 */
export const emailDeliveryNode: OVRAExecutableNode = {
  manifest: {
    operationId: "email.send",
    connectorId: "email",
    displayName: "Email Delivery",
    description: "Sends transactional or alert emails via Resend or SendGrid REST APIs",
    kind: "action",
    version: "1.0.0",
    executionMode: "per_item",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          title: "Recipient Email Address",
          default: "ops@startup.in",
          placeholder: "user@domain.com or {{email}}",
        },
        subject: {
          type: "string",
          title: "Subject Line",
          default: "OVRA Alert: Execution Notice for {{company || 'Workflow'}}",
        },
        body: {
          type: "string",
          format: "textarea",
          title: "Email Body (HTML or Plain Text)",
          default: "Hello {{name || 'Team'}},\n\nYour automation workflow has executed successfully with status: OK.\nTimestamp: {{timestamp || new Date().toISOString()}}",
        },
        from: {
          type: "string",
          title: "Sender Address",
          default: "OVRA Notifications <onboarding@resend.dev>",
          placeholder: "alerts@yourdomain.com",
        },
        provider: {
          type: "string",
          enum: ["resend", "sendgrid", "dry_run"],
          default: "resend",
          title: "Delivery Provider",
        },
        apiKey: {
          type: "string",
          title: "Provider API Key (Resend re_... or SendGrid SG...)",
          placeholder: "re_... or SG... (Optional if set in environment)",
        },
      },
      required: ["to", "subject", "body"],
    },
    credentialRequirements: ["resend-api-key", "sendgrid-api-key"],
    executionPolicy: {
      timeoutMs: 12000,
      idempotent: false,
      concurrencyLimit: 5,
      retryPolicy: {
        maxRetries: 2,
        initialIntervalMs: 500,
        maxIntervalMs: 4000,
        backoffMultiplier: 2,
      },
    },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    const provider = (config.provider as string) || "resend";
    const fromAddress = (config.from as string) || "OVRA Notifications <onboarding@resend.dev>";

    // Obtain API key
    let apiKey = typeof config.apiKey === "string" ? config.apiKey.trim() : "";
    if (!apiKey) {
      if (provider === "sendgrid") {
        apiKey = process.env.SENDGRID_API_KEY || "";
      } else {
        apiKey = process.env.RESEND_API_KEY || "";
      }
    }

    const outputItems: OVRAItem[] = [];

    for (let i = 0; i < items.length; i++) {
      context.signal.throwIfAborted();
      const item = items[i];

      const to = ExpressionEngine.interpolate(String(config.to || "ops@startup.in"), {
        ...item.json,
        item: item.json,
      }).trim();

      const subject = ExpressionEngine.interpolate(String(config.subject || "OVRA Notification"), {
        ...item.json,
        item: item.json,
      });

      const body = ExpressionEngine.interpolate(String(config.body || ""), {
        ...item.json,
        item: item.json,
      });

      context.logger.info(`Sending email via ${provider} to ${to}: "${subject}"`);

      const parentRefs: OVRAPairedItemRef[] = item.pairedItems && item.pairedItems.length > 0
        ? [...item.pairedItems, { nodeId: context.nodeId, itemIndex: i }]
        : [{ nodeId: context.nodeId, itemIndex: i }];

      // Live Resend API Dispatch
      if (provider === "resend" && apiKey && apiKey.startsWith("re_")) {
        const isHtml = body.includes("<") && body.includes(">");
        const res = await safeFetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            html: isHtml ? body : undefined,
            text: isHtml ? undefined : body,
          }),
          timeoutMs: 12000,
          signal: context.signal,
          retryPolicy: emailDeliveryNode.manifest.executionPolicy.retryPolicy,
        });

        if (res.statusCode >= 400) {
          throw new OVRAExecutionError(
            `Resend API error (${res.statusCode}): ${JSON.stringify(res.data)}`,
            "PROVIDER_ERROR",
            res.statusCode,
            res.data
          );
        }

        const resData = res.data as { id?: string };
        outputItems.push({
          json: {
            ok: true,
            provider: "resend",
            messageId: resData.id || `msg_${Date.now()}`,
            recipient: to,
            subject,
            deliveredAt: new Date().toISOString(),
          },
          pairedItems: parentRefs,
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
          metadata: {
            sourceNodeId: context.nodeId,
            sourceExecutionId: context.executionId,
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Live SendGrid API Dispatch
      else if (provider === "sendgrid" && apiKey && apiKey.startsWith("SG.")) {
        const isHtml = body.includes("<") && body.includes(">");
        const res = await safeFetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: fromAddress.includes("<") ? fromAddress.replace(/.*<([^>]+)>.*/, "$1") : fromAddress },
            subject,
            content: [{ type: isHtml ? "text/html" : "text/plain", value: body }],
          }),
          timeoutMs: 12000,
          signal: context.signal,
          retryPolicy: emailDeliveryNode.manifest.executionPolicy.retryPolicy,
        });

        if (res.statusCode >= 400) {
          throw new OVRAExecutionError(
            `SendGrid API error (${res.statusCode}): ${JSON.stringify(res.data)}`,
            "PROVIDER_ERROR",
            res.statusCode,
            res.data
          );
        }

        outputItems.push({
          json: {
            ok: true,
            provider: "sendgrid",
            messageId: `sg_${Date.now()}`,
            recipient: to,
            subject,
            deliveredAt: new Date().toISOString(),
          },
          pairedItems: parentRefs,
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
          metadata: {
            sourceNodeId: context.nodeId,
            sourceExecutionId: context.executionId,
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Test / Dry-Run Simulation Mode
      else {
        context.logger.info(`Email delivery simulated in test preview mode (no live RESEND_API_KEY provided)`);
        outputItems.push({
          json: {
            ok: true,
            deliveryMode: "dry_run",
            provider,
            recipient: to,
            subject,
            bodyPreview: body.slice(0, 200),
            messageId: `msg_dryrun_${Date.now()}_${i}`,
            notice: "Email formatted and validated. Set RESEND_API_KEY in .env.local or enter API Key in node settings for live inbox delivery.",
            deliveredAt: new Date().toISOString(),
          },
          pairedItems: parentRefs,
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
          metadata: {
            sourceNodeId: context.nodeId,
            sourceExecutionId: context.executionId,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [{ portId: "main", items: outputItems }];
  },
};
