/**
 * @ovra/runtime
 * Production Node Engine Contracts & Item Envelope Specifications (v2.5)
 */

export interface OVRAFileRef {
  ref: string; // Storage path or URI, e.g. 'storage://workspaces/ws_1/payloads/data.json'
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
  url?: string; // Ephemeral signed download URL
}

export interface OVRAPairedItemRef {
  nodeId: string;
  itemIndex: number;
  portId?: string;
}

export interface OVRAItem {
  json: Record<string, unknown>;
  binary?: Record<string, OVRAFileRef>;
  // Multi-parent lineage: supports 1 parent for sequential nodes, N parents for Merge nodes
  pairedItems?: OVRAPairedItemRef[];
  // Backwards compatibility for single-parent references
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

export type OVRAExecutionMode = "per_item" | "batch" | "execute_once";
export type OVRAOnErrorPolicy = "stop_workflow" | "continue_regular_output" | "continue_error_output";

export interface OVRARetryPolicy {
  maxRetries: number;
  initialIntervalMs: number;
  maxIntervalMs: number;
  backoffMultiplier: number;
  retryableCodes?: string[];
}

export interface OVRAOperationManifest {
  operationId: string; // e.g., 'messages.send'
  connectorId: string; // e.g., 'slack'
  displayName: string;
  description: string;
  kind: "trigger" | "action" | "transform" | "control";
  version: string;
  executionMode?: OVRAExecutionMode;
  inputsSchema: Record<string, unknown>;
  outputsSchema: Record<string, unknown>;
  configSchema: Record<string, unknown>;
  credentialRequirements?: string[];
  executionPolicy: {
    timeoutMs: number;
    idempotent: boolean;
    concurrencyLimit?: number;
    retryPolicy?: OVRARetryPolicy;
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
