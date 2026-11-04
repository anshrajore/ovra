/**
 * @ovra/node-runtime-contracts
 * Strict type contracts for the OVRA Node Platform & Execution Engine
 */

export interface CredentialLease {
  credentialId: string;
  decryptedData: Record<string, string>;
  expiresAt: string;
}

export interface ExecutionLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown): void;
}

export interface ExecutionStorage {
  putPayload(key: string, data: unknown): Promise<{ ref: string; sizeBytes: number }>;
  getPayload(ref: string): Promise<unknown>;
}

export interface RateLimiter {
  acquire(key: string, cost?: number): Promise<boolean>;
}

export interface OVRAExecutionContext {
  workspaceId: string;
  executionId: string;
  nodeExecutionId: string;
  workflowVersionId: string;
  signal: AbortSignal;
  credentials: {
    get(connectionId: string): Promise<CredentialLease>;
  };
  logger: ExecutionLogger;
  storage: ExecutionStorage;
  rateLimiter: RateLimiter;
}

export interface NodeRetryPolicy {
  maxRetries: number;
  initialIntervalMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface NodeManifest {
  id: string; // e.g., 'google-sheets.append-row'
  version: string; // e.g., '1.0.0'
  connector: string; // e.g., 'google-sheets'
  operationId: string; // e.g., 'appendRow'
  name: string; // e.g., 'Append Row'
  description: string;
  icon?: string;
  category:
    | "triggers"
    | "actions"
    | "logic"
    | "flow"
    | "data"
    | "databases"
    | "communication"
    | "ai"
    | "utilities"
    | "india_specific";
  kind: "trigger" | "action" | "logic" | "flow";
  inputsSchema: Record<string, unknown>; // JSON Schema
  outputsSchema: Record<string, unknown>; // JSON Schema
  configSchema: Record<string, unknown>; // JSON Schema
  uiSchema?: Record<string, unknown>;
  requiredCredentials?: string[]; // e.g., ['google-oauth2']
  requiredScopes?: string[];
  execution: {
    timeoutMs: number;
    retryPolicy?: NodeRetryPolicy;
    idempotent?: boolean;
  };
  testFixtures?: Array<{
    name: string;
    input: unknown;
    config: unknown;
    expectedOutput: unknown;
  }>;
}

export interface NodeExecutionResult {
  status: "success" | "failed" | "skipped" | "outcome_unknown";
  output?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

export interface OVRANodeDefinition {
  manifest: NodeManifest;
  execute(
    input: unknown,
    config: unknown,
    context: OVRAExecutionContext
  ): Promise<NodeExecutionResult>;
}

export interface ConnectorManifest {
  id: string; // e.g., 'google-sheets'
  name: string; // e.g., 'Google Sheets'
  description: string;
  category: NodeManifest["category"];
  icon: string;
  authType: "oauth2" | "api_key" | "bearer" | "basic" | "none";
  authConfigSchema: Record<string, unknown>;
  docsUrl?: string;
  isOfficial?: boolean;
}
