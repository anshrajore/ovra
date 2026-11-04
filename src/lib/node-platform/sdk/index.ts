/**
 * @ovra/node-sdk
 * Builder functions for creating type-safe nodes and declarative connectors
 */

import {
  NodeManifest,
  OVRANodeDefinition,
  OVRAExecutionContext,
  NodeExecutionResult,
  ConnectorManifest,
} from "../contracts";

export function defineNode(
  manifestOrConfig:
    | NodeManifest
    | {
        manifest: NodeManifest;
        execute: (
          input: any,
          config: any,
          context: OVRAExecutionContext
        ) => Promise<NodeExecutionResult>;
      },
  executeFn?: (
    input: any,
    config: any,
    context: OVRAExecutionContext
  ) => Promise<NodeExecutionResult>
): OVRANodeDefinition {
  if (executeFn) {
    return {
      manifest: manifestOrConfig as NodeManifest,
      execute: executeFn,
    };
  }

  const obj = manifestOrConfig as {
    manifest: NodeManifest;
    execute: (
      input: any,
      config: any,
      context: OVRAExecutionContext
    ) => Promise<NodeExecutionResult>;
  };

  return {
    manifest: obj.manifest,
    execute: obj.execute,
  };
}

export function defineConnector(manifest: ConnectorManifest): ConnectorManifest {
  return manifest;
}
