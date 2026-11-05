import { defineNode, defineConnector } from "../sdk";
import { ExpressionEngine } from "../expression-engine";

export const httpConnector = defineConnector({
  id: "http-client",
  name: "HTTP / REST API",
  description: "Connect to any external REST API, webhook, or microservice endpoint",
  category: "utilities",
  icon: "globe",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

function isSafeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    // Only allow standard http and https protocols
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }
    const hostname = url.hostname.toLowerCase();

    // Block loopback, local IPs, and cloud metadata addresses for strict SSRF defense
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname === "169.254.169.254" || // AWS / GCP / Azure metadata endpoint
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("fe80:")
    ) {
      return false;
    }

    // Check full RFC 1918 172.16.0.0/12 range (172.16.x.x through 172.31.x.x)
    if (hostname.startsWith("172.")) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

export const httpRequestNode = defineNode(
  {
    id: "core.http_request",
    version: "1.0.0",
    connector: "http-client",
    operationId: "httpRequest",
    name: "HTTP Request",
    description: "Makes authenticated HTTP requests (GET, POST, PUT, DELETE) to any REST service",
    category: "utilities",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: {
      type: "object",
      properties: {
        statusCode: { type: "number" },
        data: { type: "any" },
        headers: { type: "object" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          title: "HTTP Method",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
          default: "GET",
        },
        url: {
          type: "string",
          title: "Request URL",
          default: "https://api.github.com/zen",
          placeholder: "https://api.service.com/v1/resource",
        },
        authType: {
          type: "string",
          title: "Authentication",
          enum: ["none", "bearer", "api_key_header"],
          default: "none",
        },
        authKey: {
          type: "string",
          title: "Token / Key (Optional)",
        },
        bodyTemplate: {
          type: "string",
          format: "textarea",
          title: "Request Body (JSON)",
          default: '{\n  "source": "OVRA Automation"\n}',
        },
      },
      required: ["method", "url"],
    },
    execution: {
      timeoutMs: 15000,
      idempotent: false,
    },
  },
  async (input: any, config: any, context) => {
    const rawUrl = ExpressionEngine.interpolate(config.url, { input, ...input });

    if (!isSafeUrl(rawUrl)) {
      return {
        status: "failed",
        error: `SSRF Violation: Forbidden outbound target hostname in URL '${rawUrl}'`,
      };
    }

    const headers: Record<string, string> = {
      "User-Agent": "OVRA-Automation-Engine/2.0",
      Accept: "application/json",
    };

    if (config.authType === "bearer" && config.authKey) {
      headers["Authorization"] = `Bearer ${config.authKey}`;
    } else if (config.authType === "api_key_header" && config.authKey) {
      headers["x-api-key"] = config.authKey;
    }

    let requestBody: string | undefined = undefined;
    if (["POST", "PUT", "PATCH"].includes(config.method) && config.bodyTemplate) {
      headers["Content-Type"] = "application/json";
      requestBody = ExpressionEngine.interpolate(config.bodyTemplate, { input, ...input });
    }

    context.logger.info(`Sending ${config.method} request to ${rawUrl}`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const resp = await fetch(rawUrl, {
        method: config.method,
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timer);

      let data: any;
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        data = await resp.text();
      }

      return {
        status: resp.ok ? "success" : "failed",
        output: {
          statusCode: resp.status,
          data,
          statusText: resp.statusText,
        },
        error: resp.ok ? undefined : `HTTP Request failed with status ${resp.status}: ${resp.statusText}`,
      };
    } catch (err: any) {
      return {
        status: "failed",
        error: `Network request error: ${err.message}`,
      };
    }
  }
);
