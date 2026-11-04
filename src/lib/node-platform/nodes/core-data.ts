import { defineNode, defineConnector } from "../sdk";
import { ExpressionEngine } from "../expression-engine";

export const dataConnector = defineConnector({
  id: "data-transformer",
  name: "Data Transformation",
  description: "Manipulate JSON, set variables, format schemas and parse structures",
  category: "data",
  icon: "layers",
  authType: "none",
  authConfigSchema: {},
  isOfficial: true,
});

// 1. Set Fields Node
export const setFieldsNode = defineNode(
  {
    id: "data.set_fields",
    version: "1.0.0",
    connector: "data-transformer",
    operationId: "setFields",
    name: "Set Fields",
    description: "Sets, overrides, or maps specific attributes in the workflow execution payload",
    category: "data",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: { type: "object" },
    configSchema: {
      type: "object",
      properties: {
        fields: {
          type: "object",
          title: "Key-Value Fields",
          default: {
            status: "PROCESSED",
            processedBy: "OVRA Platform",
          },
        },
      },
      required: ["fields"],
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input: any, config: any) => {
    const fieldsToSet = config.fields || {};
    const evaluated: Record<string, any> = {};

    for (const [key, val] of Object.entries(fieldsToSet)) {
      if (typeof val === "string") {
        evaluated[key] = ExpressionEngine.interpolate(val, { input, ...input });
      } else {
        evaluated[key] = val;
      }
    }

    return {
      status: "success",
      output: {
        ...(typeof input === "object" ? input : {}),
        ...evaluated,
      },
    };
  }
);

// 2. JSON Parser Node
export const jsonParserNode = defineNode(
  {
    id: "data.json_parser",
    version: "1.0.0",
    connector: "data-transformer",
    operationId: "parseJson",
    name: "JSON Parser",
    description: "Parses stringified JSON, validates schema structure, or stringifies objects",
    category: "data",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: { type: "object" },
    configSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          title: "Operation Mode",
          enum: ["parse_string", "stringify_object"],
          default: "parse_string",
        },
        targetField: {
          type: "string",
          title: "Field Path",
          default: "rawBody",
        },
      },
      required: ["mode", "targetField"],
    },
    execution: {
      timeoutMs: 5000,
      idempotent: true,
    },
  },
  async (input: any, config: any) => {
    const rawVal = ExpressionEngine.getPathValue(input, config.targetField) ?? input?.[config.targetField] ?? input;

    if (config.mode === "stringify_object") {
      return {
        status: "success",
        output: {
          resultString: typeof rawVal === "string" ? rawVal : JSON.stringify(rawVal),
        },
      };
    }

    try {
      const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
      return {
        status: "success",
        output: {
          parsed,
        },
      };
    } catch (err: any) {
      return {
        status: "failed",
        error: `JSON Parse failed: ${err.message}`,
      };
    }
  }
);
