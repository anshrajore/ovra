import { defineNode, defineConnector } from "../sdk";
import { ExpressionEngine } from "../expression-engine";

export const logicConnector = defineConnector({
  id: "logic",
  name: "Logic & Flow Control",
  description: "Conditional routing, loops, branching and merging",
  category: "logic",
  icon: "git-branch",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

// 1. IF Condition Node
export const ifNode = defineNode(
  {
    id: "logic.if",
    version: "1.0.0",
    connector: "logic",
    operationId: "condition",
    name: "IF Condition",
    description: "Evaluates a condition and branches execution to 'Yes' (True) or 'No' (False)",
    category: "logic",
    kind: "logic",
    inputsSchema: {
      type: "object",
      properties: {
        value: { type: "any" },
      },
    },
    outputsSchema: {
      type: "object",
      properties: {
        conditionMet: { type: "boolean" },
        evaluatedValue: { type: "any" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        field: {
          type: "string",
          title: "Field / Path to Evaluate",
          default: "riskScore",
          description: "e.g. outputs.riskScore or amount",
        },
        operator: {
          type: "string",
          title: "Comparison Operator",
          enum: [
            "greater_than",
            "less_than",
            "equals",
            "not_equals",
            "contains",
            "is_empty",
            "is_not_empty",
          ],
          default: "greater_than",
        },
        threshold: {
          type: "string",
          title: "Target Comparison Value",
          default: "75",
        },
      },
      required: ["field", "operator"],
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input: any, config: any) => {
    const leftVal = ExpressionEngine.getPathValue(input, config.field) ?? input?.[config.field] ?? input;
    const isMet = ExpressionEngine.evaluateCondition(
      leftVal,
      config.operator || "greater_than",
      config.threshold
    );

    return {
      status: "success",
      output: {
        conditionMet: isMet,
        evaluatedValue: leftVal,
        branch: isMet ? "Yes" : "No",
      },
    };
  }
);

// 2. Switch Node
export const switchNode = defineNode(
  {
    id: "logic.switch",
    version: "1.0.0",
    connector: "logic",
    operationId: "switchCase",
    name: "Switch / Router",
    description: "Routes workflow into multiple branches based on exact matching values",
    category: "logic",
    kind: "logic",
    inputsSchema: {
      type: "object",
      properties: {
        value: { type: "any" },
      },
    },
    outputsSchema: {
      type: "object",
      properties: {
        matchedCase: { type: "string" },
        payload: { type: "any" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        field: {
          type: "string",
          title: "Property to Match",
          default: "status",
        },
        cases: {
          type: "array",
          title: "Case Values",
          default: ["pending", "completed", "failed"],
        },
      },
      required: ["field"],
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input: any, config: any) => {
    const val = ExpressionEngine.getPathValue(input, config.field) ?? input?.[config.field];
    const strVal = String(val);
    const cases = Array.isArray(config.cases) ? config.cases : [];
    const matched = cases.includes(strVal) ? strVal : "default";

    return {
      status: "success",
      output: {
        matchedCase: matched,
        payload: input,
      },
    };
  }
);

// 3. Merge Node
export const mergeNode = defineNode(
  {
    id: "logic.merge",
    version: "1.0.0",
    connector: "logic",
    operationId: "mergeBranches",
    name: "Merge Branches",
    description: "Joins data from multiple upstream workflow branches into a single stream",
    category: "logic",
    kind: "flow",
    inputsSchema: {
      type: "object",
      properties: {
        branchA: { type: "object" },
        branchB: { type: "object" },
      },
    },
    outputsSchema: {
      type: "object",
      properties: {
        merged: { type: "object" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        mergeMode: {
          type: "string",
          title: "Merge Strategy",
          enum: ["combine_keys", "append_array", "pass_first_arrival"],
          default: "combine_keys",
        },
      },
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input: any) => {
    return {
      status: "success",
      output: {
        merged: typeof input === "object" ? { ...input } : { data: input },
      },
    };
  }
);

// 4. Loop Node
export const loopNode = defineNode(
  {
    id: "logic.loop",
    version: "1.0.0",
    connector: "logic",
    operationId: "loopBatch",
    name: "Loop / For-Each",
    description: "Iterates through an array of items, running downstream operations per item",
    category: "logic",
    kind: "flow",
    inputsSchema: {
      type: "object",
      properties: {
        items: { type: "array" },
      },
    },
    outputsSchema: {
      type: "object",
      properties: {
        totalItems: { type: "number" },
        currentItem: { type: "any" },
        currentIndex: { type: "number" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        itemsPath: {
          type: "string",
          title: "Array Path",
          default: "items",
        },
        batchSize: {
          type: "number",
          title: "Batch Size (Concurrency Limit)",
          default: 10,
        },
      },
    },
    execution: {
      timeoutMs: 15000,
      idempotent: true,
    },
  },
  async (input: any, config: any) => {
    const rawItems = ExpressionEngine.getPathValue(input, config.itemsPath || "items") ?? input;
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    return {
      status: "success",
      output: {
        totalItems: items.length,
        items,
        processedCount: items.length,
      },
    };
  }
);
