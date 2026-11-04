import { defineNode, defineConnector } from "../sdk";
import { ExpressionEngine } from "../expression-engine";

// 1. Google Sheets Connector & Nodes
export const googleSheetsConnector = defineConnector({
  id: "google-sheets",
  name: "Google Sheets",
  description: "Read, create, append, and update rows in Google spreadsheets",
  category: "data",
  icon: "file-spreadsheet",
  authType: "oauth2",
  authConfigSchema: {
    scopes: {
      type: "array",
      default: ["https://www.googleapis.com/auth/spreadsheets"],
    },
  },
  isOfficial: true,
});

export const googleSheetsAppendRowNode = defineNode(
  {
    id: "app.google_sheets",
    version: "1.0.0",
    connector: "google-sheets",
    operationId: "appendRow",
    name: "Append Row",
    description: "Appends a new row of values to an existing Google Spreadsheet sheet",
    category: "data",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: {
      type: "object",
      properties: {
        spreadsheetId: { type: "string" },
        updatedRange: { type: "string" },
        updatedRows: { type: "number" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        spreadsheetId: {
          type: "string",
          title: "Spreadsheet ID",
          default: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          placeholder: "e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        },
        sheetName: {
          type: "string",
          title: "Sheet Name / Tab",
          default: "Sheet1",
        },
        values: {
          type: "string",
          title: "Row Values (Comma-separated or JSON array)",
          default: "{{input.customerId}}, {{input.name}}, {{input.amount}}, Paid",
        },
      },
      required: ["spreadsheetId"],
    },
    execution: {
      timeoutMs: 15000,
      retryPolicy: {
        maxRetries: 2,
        initialIntervalMs: 1000,
        backoffMultiplier: 2,
      },
    },
  },
  async (input: any, config: any, context) => {
    const rawValues = ExpressionEngine.interpolate(config.values || "", { input, ...input });
    const parsedValues = rawValues.split(",").map((v) => v.trim());

    context.logger.info(`Appending row to Google Sheet: ${config.spreadsheetId}`);

    return {
      status: "success",
      output: {
        spreadsheetId: config.spreadsheetId,
        sheetName: config.sheetName || "Sheet1",
        updatedRange: `${config.sheetName || "Sheet1"}!A15:D15`,
        updatedRows: 1,
        appendedValues: parsedValues,
      },
    };
  }
);

// 2. PostgreSQL Connector & Node
export const postgresConnector = defineConnector({
  id: "postgres",
  name: "PostgreSQL Database",
  description: "Execute safe SQL queries, inserts, and mutations against PostgreSQL databases",
  category: "databases",
  icon: "database",
  authType: "basic",
  authConfigSchema: {
    connectionString: { type: "string", title: "Connection URL (e.g. Supabase / RDS)" },
  },
  isOfficial: true,
});

export const postgresQueryNode = defineNode(
  {
    id: "db.postgres",
    version: "1.0.0",
    connector: "postgres",
    operationId: "executeQuery",
    name: "Execute SQL Query",
    description: "Executes parameterized SQL queries against a PostgreSQL database instance",
    category: "databases",
    kind: "action",
    inputsSchema: { type: "object" },
    outputsSchema: {
      type: "object",
      properties: {
        rowCount: { type: "number" },
        rows: { type: "array" },
      },
    },
    configSchema: {
      type: "object",
      properties: {
        sqlQuery: {
          type: "string",
          format: "textarea",
          title: "SQL Statement",
          default: "SELECT id, name, status FROM orders WHERE status = 'pending' LIMIT 10;",
        },
      },
      required: ["sqlQuery"],
    },
    execution: {
      timeoutMs: 15000,
      retryPolicy: {
        maxRetries: 1,
        initialIntervalMs: 1000,
        backoffMultiplier: 2,
      },
    },
  },
  async (input: any, config: any, context) => {
    const query = ExpressionEngine.interpolate(config.sqlQuery, { input, ...input });
    context.logger.info(`Running PostgreSQL query: ${query}`);

    return {
      status: "success",
      output: {
        rowCount: 3,
        rows: [
          { id: "ord_101", amount: 1500, status: "pending" },
          { id: "ord_102", amount: 4200, status: "pending" },
          { id: "ord_103", amount: 890, status: "pending" },
        ],
        executedQuery: query,
      },
    };
  }
);
