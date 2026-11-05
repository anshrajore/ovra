import { NextResponse } from "next/server";
import { nodeRegistry, defineConnector, defineNode } from "@/lib/node-platform";

function isSafeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname === "169.254.169.254" ||
      hostname.startsWith("127.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.startsWith("fe80:")
    ) {
      return false;
    }
    if (hostname.startsWith("172.")) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let spec: any = null;

    if (body.specUrl) {
      // Validate URL to prevent SSRF against internal resources
      if (!isSafeUrl(body.specUrl)) {
        return NextResponse.json(
          { success: false, error: "Access to private or local network hosts is restricted." },
          { status: 400 }
        );
      }

      const res = await fetch(body.specUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch OpenAPI spec: HTTP ${res.status}` },
          { status: 400 }
        );
      }
      spec = await res.json();
    } else if (body.rawJson) {
      spec = typeof body.rawJson === "string" ? JSON.parse(body.rawJson) : body.rawJson;
    } else {
      return NextResponse.json(
        { success: false, error: "Please provide either 'specUrl' or 'rawJson'." },
        { status: 400 }
      );
    }

    if (!spec.openapi && !spec.swagger) {
      return NextResponse.json(
        { success: false, error: "Invalid OpenAPI specification: missing openapi or swagger version declaration." },
        { status: 400 }
      );
    }

    const title = spec.info?.title || "Custom API";
    const connectorId = title.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const baseUrl = spec.servers?.[0]?.url || "https://api.example.com";

    // 1. Register Connector
    const connector = defineConnector({
      id: connectorId,
      name: title,
      description: spec.info?.description || `Imported OpenAPI Connector for ${title}`,
      category: "utilities",
      icon: "globe",
      authType: "api_key",
      authConfigSchema: {},
    });
    nodeRegistry.registerConnector(connector);

    // 2. Register operations from paths
    let registeredCount = 0;
    const paths = spec.paths || {};

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methods as Record<string, any>)) {
        if (!["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())) {
          continue;
        }

        const opId = op.operationId || `${method}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const nodeType = `${connectorId}.${opId}`;

        const nodeDef = defineNode({
          manifest: {
            id: nodeType,
            version: "1.0.0",
            name: op.summary || `${method.toUpperCase()} ${path}`,
            description: op.description || `Call ${method.toUpperCase()} ${path}`,
            category: "utilities",
            kind: "action",
            connector: connectorId,
            operationId: opId,
            inputsSchema: { type: "object" },
            outputsSchema: { type: "object" },
            configSchema: {
              type: "object",
              properties: {
                path: { type: "string", title: "API Path", default: path },
                method: { type: "string", title: "HTTP Method", default: method.toUpperCase() },
              },
            },
            execution: {
              timeoutMs: 15000,
            },
          },
          execute: async (input: any, config: any) => {
            const targetUrl = `${baseUrl.replace(/\/$/, "")}${path}`;
            if (!isSafeUrl(targetUrl)) {
              throw new Error("SSRF Protection: Access to private or local network hosts is restricted.");
            }
            const res = await fetch(targetUrl, {
              method: method.toUpperCase(),
              headers: {
                "Content-Type": "application/json",
                ...((input?.headers as Record<string, string>) || {}),
              },
              body: method.toUpperCase() !== "GET" ? JSON.stringify(input?.body || input) : undefined,
              signal: AbortSignal.timeout(15000),
            });
            const data = await res.json().catch(() => ({}));
            return {
              status: res.ok ? "success" : "failed",
              output: { status: res.status, data },
            };
          },
        });

        nodeRegistry.registerNode(nodeDef);
        registeredCount++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        connectorId,
        connectorName: title,
        operationsRegistered: registeredCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to parse and import OpenAPI specification" },
      { status: 500 }
    );
  }
}
