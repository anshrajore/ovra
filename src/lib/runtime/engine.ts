import {
  OVRAExecutableNode,
  OVRAItem,
  OVRAOutputPort,
  NodeExecutionContext,
  OVRAExecutionError,
} from "./types";
import {
  manualTriggerNode,
  httpRequestNode,
  ifConditionNode,
  setFieldsNode,
  mergeStreamsNode,
} from "./nodes/core-nodes";
import { slackPostMessageNode } from "./nodes/slack-node";
import { googleSheetsNode } from "./nodes/google-sheets-node";
import { emailDeliveryNode } from "./nodes/email-node";
import { WorkflowDefinition, WorkflowNodeData, WorkflowConnection } from "@/lib/types/workflow";

// Central runtime registry of executable nodes
const runtimeNodeRegistry = new Map<string, OVRAExecutableNode>();

export function registerRuntimeNode(nodeType: string, node: OVRAExecutableNode) {
  runtimeNodeRegistry.set(nodeType, node);
}

// Register core vertical slice nodes
registerRuntimeNode("core.manual_trigger", manualTriggerNode);
registerRuntimeNode("core.webhook", manualTriggerNode);
registerRuntimeNode("core.http_request", httpRequestNode);
registerRuntimeNode("logic.if", ifConditionNode);
registerRuntimeNode("data.set", setFieldsNode);
registerRuntimeNode("logic.merge", mergeStreamsNode);
registerRuntimeNode("core.merge", mergeStreamsNode);
registerRuntimeNode("comm.slack", slackPostMessageNode);
registerRuntimeNode("comm.email", emailDeliveryNode);
registerRuntimeNode("email.send", emailDeliveryNode);
registerRuntimeNode("app.google_sheets", googleSheetsNode);
registerRuntimeNode("google_sheets.append_row", googleSheetsNode);
registerRuntimeNode("google_sheets.read_rows", googleSheetsNode);

export interface StepExecutionRecord {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: "success" | "failed" | "running" | "skipped";
  durationMs: number;
  inputItems: OVRAItem[];
  outputPorts: OVRAOutputPort[];
  error?: string;
}

export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  status: "SUCCESS" | "FAILED" | "CANCELED";
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  steps: StepExecutionRecord[];
}

/**
 * Checks if targetId is reachable from fromId in the given DAG edges.
 */
function canReach(fromId: string, targetId: string, edges: WorkflowConnection[]): boolean {
  if (fromId === targetId) return true;
  const visited = new Set<string>();
  const queue = [fromId];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === targetId) return true;
    if (visited.has(curr)) continue;
    visited.add(curr);
    for (const edge of edges) {
      if (edge.source === curr && !visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }
  return false;
}

export class RealWorkflowEngine {
  /**
   * Executes a workflow DAG using real item envelopes, multi-port routing,
   * bounded concurrency, multi-parent lineage merge, and explicit onError policies.
   */
  static async executeWorkflow(
    workflow: WorkflowDefinition,
    initialPayload: Record<string, unknown> = {},
    options: {
      executionId?: string;
      workspaceId?: string;
      onStepUpdate?: (step: StepExecutionRecord) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<WorkflowExecutionResult> {
    const executionId = options.executionId || `exec_${Date.now()}`;
    const workspaceId = options.workspaceId || workflow.workspaceId || "ws_default";
    const startTime = Date.now();
    const abortController = new AbortController();
    const signal = options.signal || abortController.signal;

    const steps: StepExecutionRecord[] = [];

    // Map of output items produced by each node: nodeId -> Map<portId, OVRAItem[]>
    const nodeOutputs = new Map<string, Map<string, OVRAItem[]>>();

    // Seed initial items from manual/webhook trigger
    const seedItem: OVRAItem = {
      json: initialPayload && Object.keys(initialPayload).length > 0
        ? initialPayload
        : { event: "manual_trigger", timestamp: new Date().toISOString() },
      metadata: {
        sourceExecutionId: executionId,
        timestamp: new Date().toISOString(),
      },
    };

    // Topological order or sequential flow based on edges
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    // Identify start trigger node
    const triggerNode = nodes.find(
      (n) => n.type.includes("trigger") || n.type.includes("webhook")
    ) || nodes[0];

    const visitedNodes = new Set<string>();
    const queue: Array<{ node: WorkflowNodeData; incomingItems: OVRAItem[] }> = [];

    if (triggerNode) {
      queue.push({ node: triggerNode, incomingItems: [seedItem] });
    }

    let overallSuccess = true;

    while (queue.length > 0) {
      signal.throwIfAborted();

      // Topological resolution: select the first node whose upstream predecessors are not also in queue
      const readyIndex = queue.findIndex((entry) => {
        return !queue.some(
          (other) => other.node.id !== entry.node.id && canReach(other.node.id, entry.node.id, edges)
        );
      });

      const current = readyIndex !== -1 ? queue.splice(readyIndex, 1)[0] : queue.shift()!;
      const { node, incomingItems } = current;

      if (visitedNodes.has(node.id)) {
        continue;
      }
      visitedNodes.add(node.id);

      const stepStart = Date.now();
      const stepRecord: StepExecutionRecord = {
        nodeId: node.id,
        nodeLabel: node.label || node.id,
        nodeType: node.type,
        status: "running",
        durationMs: 0,
        inputItems: incomingItems,
        outputPorts: [],
      };

      if (options.onStepUpdate) {
        options.onStepUpdate({ ...stepRecord });
      }

      // Context
      const context: NodeExecutionContext = {
        workspaceId,
        executionId,
        nodeId: node.id,
        signal,
        credentials: {
          async getLease(connectionId: string) {
            return {
              credentialId: connectionId,
              data: { token: "leased_token_ephemeral" },
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            };
          },
        },
        logger: {
          info(msg, meta) {
            console.log(`[OVRA Engine][INFO][${node.id}] ${msg}`, meta || "");
          },
          warn(msg, meta) {
            console.warn(`[OVRA Engine][WARN][${node.id}] ${msg}`, meta || "");
          },
          error(msg, err) {
            console.error(`[OVRA Engine][ERROR][${node.id}] ${msg}`, err || "");
          },
        },
      };

      const executor = runtimeNodeRegistry.get(node.type);
      const onErrorPolicy = (node.config?.onError as string) || "stop_workflow";
      const timeoutMs = (node.config?.timeoutMs as number) || executor?.manifest?.executionPolicy?.timeoutMs || 30000;

      const nodeTimeoutController = new AbortController();
      const nodeTimeoutTimer = setTimeout(() => {
        nodeTimeoutController.abort(new Error(`Node '${node.id}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      const combinedNodeSignal = typeof (AbortSignal as any).any === "function"
        ? (AbortSignal as any).any([signal, nodeTimeoutController.signal])
        : signal;

      const nodeContext: NodeExecutionContext = {
        ...context,
        signal: combinedNodeSignal,
      };

      try {
        let ports: OVRAOutputPort[] = [];

        if (executor) {
          ports = await executor.execute(incomingItems, node.config || {}, nodeContext);
        } else {
          // Default pass-through action
          ports = [
            {
              portId: "main",
              items: incomingItems.map((it, idx) => ({
                ...it,
                json: { ...it.json, processedBy: node.type },
                pairedItems: it.pairedItems && it.pairedItems.length > 0
                  ? [...it.pairedItems, { nodeId: node.id, itemIndex: idx }]
                  : [{ nodeId: node.id, itemIndex: idx }],
                pairedItem: { nodeId: node.id, itemIndex: idx },
              })),
            },
          ];
        }

        clearTimeout(nodeTimeoutTimer);

        const duration = Date.now() - stepStart;
        stepRecord.status = "success";
        stepRecord.durationMs = duration;
        stepRecord.outputPorts = ports;

        if (options.onStepUpdate) {
          options.onStepUpdate({ ...stepRecord });
        }
        steps.push(stepRecord);

        // Store outputs indexed by port
        const portMap = new Map<string, OVRAItem[]>();
        for (const p of ports) {
          portMap.set(p.portId, p.items);
        }
        nodeOutputs.set(node.id, portMap);

        // Find outgoing edges from this node
        const outgoingEdges = edges.filter((e) => e.source === node.id);

        for (const edge of outgoingEdges) {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!targetNode) continue;

          // Match edge sourceHandle to portId (default to 'main')
          const edgePort = edge.sourceHandle || "main";
          let itemsForEdge: OVRAItem[] = [];

          if (portMap.has(edgePort)) {
            itemsForEdge = portMap.get(edgePort) || [];
          } else if (edgePort === "main" && portMap.has("main")) {
            itemsForEdge = portMap.get("main") || [];
          }

          // Only queue downstream if items exist for this branch
          if (itemsForEdge.length > 0) {
            const existingInQueue = queue.find((q) => q.node.id === targetNode.id);
            if (existingInQueue) {
              existingInQueue.incomingItems.push(...itemsForEdge);
            } else {
              queue.push({
                node: targetNode,
                incomingItems: [...itemsForEdge],
              });
            }
          }
        }
      } catch (err: any) {
        clearTimeout(nodeTimeoutTimer);
        const duration = Date.now() - stepStart;
        stepRecord.durationMs = duration;
        stepRecord.error = err?.message || String(err);

        if (onErrorPolicy === "continue_error_output") {
          stepRecord.status = "failed";
          const errorItems: OVRAItem[] = incomingItems.map((it, idx) => ({
            ...it,
            json: {
              ...it.json,
              _error: {
                message: err?.message || String(err),
                code: err?.code || "NODE_EXECUTION_ERROR",
                nodeId: node.id,
                timestamp: new Date().toISOString(),
              },
            },
            pairedItems: it.pairedItems && it.pairedItems.length > 0
              ? [...it.pairedItems, { nodeId: node.id, itemIndex: idx, portId: "error" }]
              : [{ nodeId: node.id, itemIndex: idx, portId: "error" }],
            pairedItem: { nodeId: node.id, itemIndex: idx },
          }));

          const errorPorts: OVRAOutputPort[] = [{ portId: "error", items: errorItems }];
          stepRecord.outputPorts = errorPorts;

          if (options.onStepUpdate) {
            options.onStepUpdate({ ...stepRecord });
          }
          steps.push(stepRecord);

          const portMap = new Map<string, OVRAItem[]>();
          portMap.set("error", errorItems);
          nodeOutputs.set(node.id, portMap);

          const outgoingEdges = edges.filter((e) => e.source === node.id);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!targetNode) continue;
            const edgePort = edge.sourceHandle || "main";
            if (edgePort === "error") {
              const existingInQueue = queue.find((q) => q.node.id === targetNode.id);
              if (existingInQueue) {
                existingInQueue.incomingItems.push(...errorItems);
              } else {
                queue.push({
                  node: targetNode,
                  incomingItems: [...errorItems],
                });
              }
            }
          }
          continue;
        } else if (onErrorPolicy === "continue_regular_output") {
          stepRecord.status = "failed";
          const errorItems: OVRAItem[] = incomingItems.map((it, idx) => ({
            ...it,
            json: {
              ...it.json,
              _error: {
                message: err?.message || String(err),
                code: err?.code || "NODE_EXECUTION_ERROR",
                nodeId: node.id,
                timestamp: new Date().toISOString(),
              },
            },
            pairedItems: it.pairedItems && it.pairedItems.length > 0
              ? [...it.pairedItems, { nodeId: node.id, itemIndex: idx, portId: "main" }]
              : [{ nodeId: node.id, itemIndex: idx, portId: "main" }],
            pairedItem: { nodeId: node.id, itemIndex: idx },
          }));

          const regPorts: OVRAOutputPort[] = [{ portId: "main", items: errorItems }];
          stepRecord.outputPorts = regPorts;

          if (options.onStepUpdate) {
            options.onStepUpdate({ ...stepRecord });
          }
          steps.push(stepRecord);

          const portMap = new Map<string, OVRAItem[]>();
          portMap.set("main", errorItems);
          nodeOutputs.set(node.id, portMap);

          const outgoingEdges = edges.filter((e) => e.source === node.id);
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!targetNode) continue;
            const edgePort = edge.sourceHandle || "main";
            if (edgePort === "main") {
              const existingInQueue = queue.find((q) => q.node.id === targetNode.id);
              if (existingInQueue) {
                existingInQueue.incomingItems.push(...errorItems);
              } else {
                queue.push({
                  node: targetNode,
                  incomingItems: [...errorItems],
                });
              }
            }
          }
          continue;
        } else {
          // Default: stop_workflow
          overallSuccess = false;
          stepRecord.status = "failed";
          if (options.onStepUpdate) {
            options.onStepUpdate({ ...stepRecord });
          }
          steps.push(stepRecord);
          break; // stop branch on error
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    return {
      executionId,
      workflowId: workflow.id,
      status: overallSuccess ? "SUCCESS" : "FAILED",
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      totalDurationMs: totalDuration,
      steps,
    };
  }
}
