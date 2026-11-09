import {
  OVRAExecutableNode,
  OVRAItem,
  OVRAOutputPort,
  NodeExecutionContext,
  OVRAExecutionError,
} from "./types";
import { manualTriggerNode, httpRequestNode, ifConditionNode, setFieldsNode } from "./nodes/core-nodes";
import { slackPostMessageNode } from "./nodes/slack-node";
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
registerRuntimeNode("comm.slack", slackPostMessageNode);

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

export class RealWorkflowEngine {
  /**
   * Executes a workflow DAG using real item envelopes, multi-port routing, and error boundaries.
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
      const current = queue.shift()!;
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

      try {
        const executor = runtimeNodeRegistry.get(node.type);
        let ports: OVRAOutputPort[] = [];

        if (executor) {
          ports = await executor.execute(incomingItems, node.config || {}, context);
        } else {
          // Default pass-through action
          ports = [
            {
              portId: "main",
              items: incomingItems.map((it, idx) => ({
                ...it,
                json: { ...it.json, processedBy: node.type },
                pairedItem: { nodeId: node.id, itemIndex: idx },
              })),
            },
          ];
        }

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

          // Match edge sourceHandle to portId (default to 'main' or 'true')
          const edgePort = edge.sourceHandle || "main";
          let itemsForEdge: OVRAItem[] = [];

          if (portMap.has(edgePort)) {
            itemsForEdge = portMap.get(edgePort) || [];
          } else if (portMap.has("main")) {
            itemsForEdge = portMap.get("main") || [];
          } else if (portMap.size === 1) {
            itemsForEdge = Array.from(portMap.values())[0] || [];
          }

          // Only queue downstream if items exist for this branch
          if (itemsForEdge.length > 0) {
            queue.push({
              node: targetNode,
              incomingItems: itemsForEdge,
            });
          }
        }
      } catch (err: any) {
        overallSuccess = false;
        stepRecord.status = "failed";
        stepRecord.durationMs = Date.now() - stepStart;
        stepRecord.error = err?.message || String(err);

        if (options.onStepUpdate) {
          options.onStepUpdate({ ...stepRecord });
        }
        steps.push(stepRecord);
        break; // stop branch on error
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
