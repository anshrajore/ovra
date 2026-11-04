/**
 * @ovra/node-testkit
 * In-memory test harness for validating nodes and running contract tests
 */

import {
  OVRANodeDefinition,
  OVRAExecutionContext,
  NodeExecutionResult,
  CredentialLease,
} from "../contracts";

export function createMockExecutionContext(options?: {
  workspaceId?: string;
  executionId?: string;
  nodeExecutionId?: string;
  credentialsMap?: Record<string, Record<string, string>>;
}): OVRAExecutionContext {
  const credentialsMap = options?.credentialsMap || {};

  return {
    workspaceId: options?.workspaceId || "ws_test",
    executionId: options?.executionId || `exec_test_${Date.now()}`,
    nodeExecutionId: options?.nodeExecutionId || `node_exec_${Date.now()}`,
    workflowVersionId: "wf_ver_1",
    signal: new AbortController().signal,
    credentials: {
      async get(connectionId: string): Promise<CredentialLease> {
        const decrypted = credentialsMap[connectionId] || {
          apiKey: "test_mock_api_key_12345",
          token: "test_mock_token_abcde",
        };
        return {
          credentialId: connectionId,
          decryptedData: decrypted,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        };
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
    storage: {
      async putPayload(key: string, data: unknown) {
        return { ref: `storage://test/${key}`, sizeBytes: JSON.stringify(data).length };
      },
      async getPayload() {
        return null;
      },
    },
    rateLimiter: {
      async acquire() {
        return true;
      },
    },
  };
}

export async function testNodeExecution(
  nodeOrType: OVRANodeDefinition | string,
  input: unknown,
  config: unknown,
  context?: Partial<OVRAExecutionContext>
): Promise<NodeExecutionResult & { success: boolean; logs: string[] }> {
  const logs: string[] = [];
  const mockCtx = {
    ...createMockExecutionContext(),
    logger: {
      info: (m: string) => logs.push(`[INFO] ${m}`),
      warn: (m: string) => logs.push(`[WARN] ${m}`),
      error: (m: string) => logs.push(`[ERROR] ${m}`),
    },
    ...context,
  };

  let nodeDef: OVRANodeDefinition | undefined;
  if (typeof nodeOrType === "string") {
    // Dynamic import to avoid circular dependency
    const { nodeRegistry } = await import("../registry");
    nodeDef = nodeRegistry.getNode(nodeOrType);
    if (!nodeDef) {
      return {
        status: "failed",
        success: false,
        error: `Node definition not found for type: ${nodeOrType}`,
        durationMs: 0,
        logs,
      };
    }
  } else {
    nodeDef = nodeOrType;
  }

  const startTime = Date.now();
  try {
    const result = await nodeDef.execute(input, config, mockCtx as OVRAExecutionContext);
    const success = result.status === "success";
    return {
      ...result,
      success,
      durationMs: Date.now() - startTime,
      logs,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    logs.push(`[FATAL] ${errorMsg}`);
    return {
      status: "failed",
      success: false,
      error: errorMsg,
      durationMs: Date.now() - startTime,
      logs,
    };
  }
}
