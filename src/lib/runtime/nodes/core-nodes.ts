import {
  OVRAExecutableNode,
  OVRAItem,
  OVRAOutputPort,
  NodeExecutionContext,
  OVRAExecutionError,
  OVRAPairedItemRef,
} from "../types";
import { safeFetch } from "../http-transport";
import { ExpressionEngine } from "@/lib/node-platform/expression-engine";

/**
 * 1. Manual Trigger Node
 * Receives manual test execution data or provides default sample payload.
 */
export const manualTriggerNode: OVRAExecutableNode = {
  manifest: {
    operationId: "manual.trigger",
    connectorId: "manual",
    displayName: "Manual Trigger",
    description: "Starts a workflow execution with test fixtures or manually supplied JSON items",
    kind: "trigger",
    version: "1.0.0",
    executionMode: "execute_once",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        payload: {
          type: "string",
          title: "Initial Test JSON",
          default: '{\n  "event": "manual_test",\n  "leadScore": 88,\n  "company": "Enterprise Tech"\n}',
        },
      },
    },
    executionPolicy: { timeoutMs: 2000, idempotent: true },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    context.logger.info("Executing Manual Trigger");

    let configPayload: Record<string, unknown> = {};
    if (typeof config.payload === "string" && config.payload.trim()) {
      try {
        configPayload = JSON.parse(config.payload);
      } catch {
        // raw string fallback
      }
    } else if (config.payload && typeof config.payload === "object") {
      configPayload = config.payload as Record<string, unknown>;
    }

    let seedItems: OVRAItem[] = [];

    if (items && items.length > 0) {
      seedItems = items.map((it, idx) => ({
        ...it,
        json: {
          ...configPayload,
          ...it.json,
        },
        pairedItems: [{ nodeId: context.nodeId, itemIndex: idx }],
        pairedItem: { nodeId: context.nodeId, itemIndex: idx },
        metadata: {
          ...it.metadata,
          sourceNodeId: context.nodeId,
          sourceExecutionId: context.executionId,
          timestamp: new Date().toISOString(),
        },
      }));
    } else {
      seedItems = [
        {
          json: Object.keys(configPayload).length > 0 ? configPayload : { event: "manual_test", timestamp: new Date().toISOString() },
          pairedItems: [{ nodeId: context.nodeId, itemIndex: 0 }],
          pairedItem: { nodeId: context.nodeId, itemIndex: 0 },
          metadata: {
            sourceNodeId: context.nodeId,
            sourceExecutionId: context.executionId,
            timestamp: new Date().toISOString(),
          },
        },
      ];
    }

    return [{ portId: "main", items: seedItems }];
  },
};

/**
 * 2. HTTP Request Node
 * Executes real, SSRF-safe HTTP calls per item and preserves multi-parent lineage.
 */
export const httpRequestNode: OVRAExecutableNode = {
  manifest: {
    operationId: "http.request",
    connectorId: "http-client",
    displayName: "HTTP Request",
    description: "Makes authenticated HTTP requests to external APIs with SSRF protection",
    kind: "action",
    version: "1.0.0",
    executionMode: "per_item",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" },
        url: { type: "string", title: "Endpoint URL", default: "https://api.github.com/zen" },
        authType: { type: "string", enum: ["none", "bearer", "api_key"], default: "none" },
        authKey: { type: "string", title: "API Token / Bearer Key" },
        body: { type: "string", title: "JSON Body Template" },
      },
      required: ["method", "url"],
    },
    executionPolicy: {
      timeoutMs: 15000,
      idempotent: false,
      concurrencyLimit: 5,
      retryPolicy: {
        maxRetries: 3,
        initialIntervalMs: 300,
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
    const method = (config.method as any) || "GET";
    const rawUrl = (config.url as string) || "https://api.github.com/zen";

    const concurrency = httpRequestNode.manifest.executionPolicy.concurrencyLimit || 5;
    const outputItems = new Array<OVRAItem>(items.length);
    let nextIdx = 0;
    const workerCount = Math.min(concurrency, Math.max(1, items.length));

    const workers = Array.from({ length: workerCount }, async () => {
      while (nextIdx < items.length) {
        const i = nextIdx++;
        context.signal.throwIfAborted();
        const item = items[i];

        // Interpolate URL and body with item json
        const resolvedUrl = ExpressionEngine.interpolate(rawUrl, { ...item.json, item: item.json });
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (config.authType === "bearer" && config.authKey) {
          headers["Authorization"] = `Bearer ${config.authKey}`;
        } else if (config.authType === "api_key" && config.authKey) {
          headers["x-api-key"] = String(config.authKey);
        }

        let requestBody: string | undefined = undefined;
        if (method !== "GET" && method !== "DELETE" && config.body) {
          requestBody = ExpressionEngine.interpolate(String(config.body), { ...item.json, item: item.json });
        }

        context.logger.info(`Sending ${method} request to ${resolvedUrl}`, { itemIndex: i });

        const response = await safeFetch(resolvedUrl, {
          method,
          headers,
          body: requestBody,
          timeoutMs: 15000,
          signal: context.signal,
          retryPolicy: httpRequestNode.manifest.executionPolicy.retryPolicy,
        });

        const parentRefs: OVRAPairedItemRef[] = item.pairedItems && item.pairedItems.length > 0
          ? [...item.pairedItems, { nodeId: context.nodeId, itemIndex: i }]
          : [{ nodeId: context.nodeId, itemIndex: i }];

        outputItems[i] = {
          json: {
            statusCode: response.statusCode,
            statusText: response.statusText,
            data: response.data,
            durationMs: response.durationMs,
            attemptsMade: response.attemptsMade,
          },
          binary: response.fileRef ? { responsePayload: response.fileRef } : undefined,
          pairedItems: parentRefs,
          pairedItem: { nodeId: context.nodeId, itemIndex: i },
          metadata: {
            sourceNodeId: context.nodeId,
            sourceExecutionId: context.executionId,
            timestamp: new Date().toISOString(),
          },
        };
      }
    });

    await Promise.all(workers);

    return [{ portId: "main", items: outputItems }];
  },
};

/**
 * 3. IF Condition Node
 * Splits input items into 'true' and 'false' ports based on real condition evaluation.
 */
export const ifConditionNode: OVRAExecutableNode = {
  manifest: {
    operationId: "logic.if",
    connectorId: "logic",
    displayName: "IF Condition",
    description: "Evaluates a condition per item and branches execution to 'true' or 'false' output ports",
    kind: "control",
    version: "1.0.0",
    executionMode: "per_item",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        field: { type: "string", title: "Field to Test", default: "leadScore" },
        operator: {
          type: "string",
          enum: ["greater_than", "less_than", "equals", "not_equals", "contains", "is_empty", "is_not_empty"],
          default: "greater_than",
        },
        threshold: { type: "string", title: "Comparison Value", default: "70" },
      },
      required: ["field", "operator"],
    },
    executionPolicy: { timeoutMs: 5000, idempotent: true },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    const trueItems: OVRAItem[] = [];
    const falseItems: OVRAItem[] = [];

    const field = (config.field as string) || "leadScore";
    const operator = (config.operator as string) || "greater_than";
    const threshold = config.threshold !== undefined ? config.threshold : "70";

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const val = ExpressionEngine.getPathValue(item.json, field) ?? item.json[field];
      const isMet = ExpressionEngine.evaluateCondition(val, operator as any, threshold);

      const parentRefs: OVRAPairedItemRef[] = item.pairedItems && item.pairedItems.length > 0
        ? [...item.pairedItems, { nodeId: context.nodeId, itemIndex: i, portId: isMet ? "true" : "false" }]
        : [{ nodeId: context.nodeId, itemIndex: i, portId: isMet ? "true" : "false" }];

      const enrichedItem: OVRAItem = {
        ...item,
        json: {
          ...item.json,
          _conditionResult: {
            field,
            evaluatedValue: val,
            operator,
            threshold,
            passed: isMet,
          },
        },
        pairedItems: parentRefs,
        pairedItem: { nodeId: context.nodeId, itemIndex: i },
      };

      if (isMet) {
        trueItems.push(enrichedItem);
      } else {
        falseItems.push(enrichedItem);
      }
    }

    context.logger.info(`IF evaluated: ${trueItems.length} passed (true), ${falseItems.length} failed (false)`);

    return [
      { portId: "true", items: trueItems },
      { portId: "false", items: falseItems },
    ];
  },
};

/**
 * 4. Set Fields (Data Transformation) Node
 * Transforms, adds, or renames keys across all incoming items while preserving item lineage.
 */
export const setFieldsNode: OVRAExecutableNode = {
  manifest: {
    operationId: "data.set",
    connectorId: "transform",
    displayName: "Set Fields",
    description: "Sets or maps values on each incoming item using AST expression interpolation",
    kind: "transform",
    version: "1.0.0",
    executionMode: "per_item",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Target Key" },
              value: { type: "string", title: "Value or Expression" },
            },
          },
        },
      },
    },
    executionPolicy: { timeoutMs: 5000, idempotent: true },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    const fields = (config.fields as Array<{ name: string; value: string }>) || [
      { name: "status", value: "PROCESSED_BY_OVRA" },
      { name: "processedAt", value: "{{new Date().toISOString()}}" },
    ];

    const transformedItems: OVRAItem[] = items.map((item, idx) => {
      const updatedJson = { ...item.json };

      for (const f of fields) {
        if (!f.name) continue;
        const computedVal = ExpressionEngine.interpolate(f.value || "", { ...item.json, item: item.json });
        updatedJson[f.name] = computedVal;
      }

      const parentRefs: OVRAPairedItemRef[] = item.pairedItems && item.pairedItems.length > 0
        ? [...item.pairedItems, { nodeId: context.nodeId, itemIndex: idx }]
        : [{ nodeId: context.nodeId, itemIndex: idx }];

      return {
        ...item,
        json: updatedJson,
        pairedItems: parentRefs,
        pairedItem: { nodeId: context.nodeId, itemIndex: idx },
      };
    });

    return [{ portId: "main", items: transformedItems }];
  },
};

/**
 * 5. Merge Streams Node
 * Joins items from multiple incoming DAG branches and establishes multi-parent lineage.
 */
export const mergeStreamsNode: OVRAExecutableNode = {
  manifest: {
    operationId: "logic.merge",
    connectorId: "logic",
    displayName: "Merge Streams",
    description: "Combines items from multiple branches with multi-parent lineage preservation",
    kind: "control",
    version: "1.0.0",
    executionMode: "batch",
    inputsSchema: { type: "array" },
    outputsSchema: { type: "array" },
    configSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["append", "merge_by_key"],
          default: "append",
        },
        key: {
          type: "string",
          title: "Merge Key (if mode=merge_by_key)",
          default: "id",
        },
      },
    },
    executionPolicy: { timeoutMs: 5000, idempotent: true },
  },
  async execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]> {
    const mode = (config.mode as string) || "append";

    if (mode === "append") {
      const mergedItems: OVRAItem[] = items.map((it, idx) => ({
        ...it,
        pairedItems: it.pairedItems && it.pairedItems.length > 0
          ? [...it.pairedItems, { nodeId: context.nodeId, itemIndex: idx }]
          : [{ nodeId: context.nodeId, itemIndex: idx }],
        pairedItem: { nodeId: context.nodeId, itemIndex: idx },
      }));
      return [{ portId: "main", items: mergedItems }];
    }

    // Merge by key
    const mergeKey = (config.key as string) || "id";
    const itemMap = new Map<string, { json: Record<string, unknown>; pairedItems: OVRAPairedItemRef[] }>();

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const keyValue = String(it.json[mergeKey] || `row_${i}`);
      const existing = itemMap.get(keyValue);

      const currentParents = it.pairedItems || [{ nodeId: context.nodeId, itemIndex: i }];

      if (existing) {
        itemMap.set(keyValue, {
          json: { ...existing.json, ...it.json },
          pairedItems: [...existing.pairedItems, ...currentParents],
        });
      } else {
        itemMap.set(keyValue, {
          json: { ...it.json },
          pairedItems: [...currentParents],
        });
      }
    }

    const mergedItems: OVRAItem[] = Array.from(itemMap.values()).map((val, idx) => ({
      json: val.json,
      pairedItems: [...val.pairedItems, { nodeId: context.nodeId, itemIndex: idx }],
      pairedItem: { nodeId: context.nodeId, itemIndex: idx },
    }));

    return [{ portId: "main", items: mergedItems }];
  },
};
