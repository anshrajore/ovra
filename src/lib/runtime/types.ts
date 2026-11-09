/**
 * @ovra/runtime
 * Production Node Engine Contracts & Item Envelope Specifications
 */

export interface OVRAFileRef {
  ref: string; // Storage path or URI
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
}

export interface OVRAItem {
  json: Record<string, unknown>;
  binary?: Record<string, OVRAFileRef>;
  pairedItem?: {
    nodeId: string;
    itemIndex: number;
  };
  metadata?: {
    sourceNodeId?: string;
    sourceExecutionId?: string;
    timestamp?: string;
    schemaVersion?: string;
  };
}

export interface OVRAOutputPort {
  portId: string; // 'main', 'true', 'false', 'error'
  items: OVRAItem[];
}

export interface CredentialLease {
  credentialId: string;
  data: Record<string, string>;
  expiresAt: string;
}

export interface NodeExecutionContext {
  workspaceId: string;
  executionId: string;
  nodeId: string;
  signal: AbortSignal;
  credentials: {
    getLease(connectionId: string): Promise<CredentialLease>;
  };
  logger: {
    info(msg: string, meta?: Record<string, unknown>): void;
    warn(msg: string, meta?: Record<string, unknown>): void;
    error(msg: string, err?: unknown): void;
  };
  rateLimiter?: {
    acquire(bucket: string, cost?: number): Promise<boolean>;
  };
}

export interface OVRAOperationManifest {
  operationId: string; // e.g., 'messages.send'
  connectorId: string; // e.g., 'slack'
  displayName: string;
  description: string;
  kind: "trigger" | "action" | "transform" | "control";
  version: string;
  inputsSchema: Record<string, unknown>;
  outputsSchema: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  credentialRequirements?: string[];
  executionPolicy: {
    timeoutMs: number;
    idempotent: boolean;
    maxRetries?: number;
    maxOutputBytes?: number;
  };
}

export interface OVRAExecutableNode {
  manifest: OVRAOperationManifest;
  execute(
    items: OVRAItem[],
    config: Record<string, unknown>,
    context: NodeExecutionContext
  ): Promise<OVRAOutputPort[]>;
}

export class OVRAExecutionError extends Error {
  constructor(
    message: string,
    public code:
      | "AUTH_EXPIRED"
      | "INVALID_CREDENTIAL"
      | "RATE_LIMIT_EXHAUSTED"
      | "SSRF_BLOCKED"
      | "TIMEOUT"
      | "VALIDATION_FAILED"
      | "PROVIDER_ERROR"
      | "OUTCOME_UNKNOWN",
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "OVRAExecutionError";
  }
}
