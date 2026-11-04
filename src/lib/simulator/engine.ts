import {
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResult,
  NodeExecutionState,
} from "../providers/execution";
import { RealtimeProvider, ExecutionEventPayload } from "../providers/realtime";
import { WorkflowDefinition, WorkflowNodeData } from "../types/workflow";
import { nodeRegistry, createMockExecutionContext } from "@/lib/node-platform";

// Global in-memory run store for local development and serverless previews
const executionHistoryStore = new Map<string, ExecutionResult>();
const eventHistoryStore = new Map<string, ExecutionEventPayload[]>();

// Subscribed listeners for live streaming
const listeners = new Map<
  string,
  Set<(event: ExecutionEventPayload) => void>
>();

export class InMemoRealtimeProvider implements RealtimeProvider {
  async emitEvent(event: ExecutionEventPayload): Promise<void> {
    const events = eventHistoryStore.get(event.executionId) || [];
    events.push(event);
    eventHistoryStore.set(event.executionId, events);

    const subs = listeners.get(event.executionId);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error("Error in realtime listener:", e);
        }
      });
    }
  }

  async getEventsSince(
    executionId: string,
    sinceSequenceNumber: number
  ): Promise<ExecutionEventPayload[]> {
    const events = eventHistoryStore.get(executionId) || [];
    return events.filter((e) => e.sequenceNumber > sinceSequenceNumber);
  }

  subscribe(
    executionId: string,
    callback: (event: ExecutionEventPayload) => void
  ): () => void {
    if (!listeners.has(executionId)) {
      listeners.set(executionId, new Set());
    }
    listeners.get(executionId)!.add(callback);

    return () => {
      listeners.get(executionId)?.delete(callback);
    };
  }
}

export const defaultRealtimeProvider = new InMemoRealtimeProvider();

export class BoundedExecutionSimulator implements ExecutionProvider {
  private realtime: RealtimeProvider;

  constructor(realtime: RealtimeProvider = defaultRealtimeProvider) {
    this.realtime = realtime;
  }

  async startExecution(request: ExecutionRequest): Promise<ExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();

    const initialResult: ExecutionResult = {
      executionId,
      workflowId: request.workflowId,
      status: "RUNNING",
      startedAt,
      nodeResults: {},
    };

    executionHistoryStore.set(executionId, initialResult);

    await this.realtime.emitEvent({
      eventId: `evt_${Date.now()}_1`,
      sequenceNumber: 1,
      executionId,
      workflowId: request.workflowId,
      type: "execution.started",
      timestamp: startedAt,
      data: { triggerType: request.triggerType },
    });

    return initialResult;
  }

  async executeWorkflowGraph(
    workflow: WorkflowDefinition,
    executionId: string,
    onStep?: (nodeId: string, state: NodeExecutionState) => void
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let seq = 2;
    const nodeResults: Record<string, NodeExecutionState> = {};

    // 1. Initialize node results
    for (const node of workflow.nodes) {
      nodeResults[node.id] = {
        nodeId: node.id,
        nodeType: node.type,
        status: "idle",
      };
    }

    // Default trigger payload if not provided
    let currentPayload: Record<string, unknown> = {
      leadName: "Aarav Sharma",
      email: "aarav.sharma@techscale.in",
      company: "TechScale India Pvt Ltd",
      phone: "+91 98201 12345",
      employeeCount: 180,
      annualRevenueINR: "45 Crore",
      source: "WhatsApp Enterprise Inquiry",
      intent: "Deploying automated customer workflow pipeline",
    };

    // Find trigger node
    const triggerNode = workflow.nodes.find(
      (n) => n.type === "core.webhook" || n.type.startsWith("core.")
    ) || workflow.nodes[0];

    // Helper to sleep for visual pacing
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Traverse and execute DAG
    let currentNodeId: string | null = triggerNode ? triggerNode.id : null;
    let selectedBranch: "yes" | "no" | null = null;

    while (currentNodeId) {
      const node = workflow.nodes.find((n) => n.id === currentNodeId);
      if (!node) break;

      // Mark running
      const stepStartTime = Date.now();
      const runningState: NodeExecutionState = {
        nodeId: node.id,
        nodeType: node.type,
        status: "running",
        startedAt: new Date().toISOString(),
        inputPayload: { ...currentPayload },
      };
      nodeResults[node.id] = runningState;
      if (onStep) onStep(node.id, runningState);

      await this.realtime.emitEvent({
        eventId: `evt_${Date.now()}_${seq++}`,
        sequenceNumber: seq,
        executionId,
        workflowId: workflow.id,
        type: "node.started",
        nodeId: node.id,
        timestamp: new Date().toISOString(),
        data: runningState.inputPayload,
      });

      // Visual delay for realistic UX demonstration
      await delay(700);

      // Check if node is registered in NodePlatform
      const registeredNode = nodeRegistry.getNode(node.type);
      let outputPayload: Record<string, unknown> = {};

      if (registeredNode) {
        try {
          const ctx = createMockExecutionContext({
            executionId,
            nodeExecutionId: node.id,
          });
          const res = await registeredNode.execute(currentPayload, node.config || {}, ctx);
          if (res.status === "success" && res.output) {
            outputPayload = res.output;
            if (node.type === "logic.if") {
              const condResult = Boolean(outputPayload.conditionMet ?? (outputPayload.chosenBranch === "yes"));
              selectedBranch = condResult ? "yes" : "no";
            }
            currentPayload = { ...currentPayload, ...outputPayload };
          } else {
            outputPayload = res.output || { processed: true };
          }
        } catch (err: any) {
          console.warn(`Execution error in node ${node.id} (${node.type}):`, err);
          outputPayload = { error: err.message, processed: true };
        }
      } else if (node.type === "core.webhook") {
        outputPayload = {
          receivedAt: new Date().toISOString(),
          headers: { "x-source": "whatsapp-cloud", "content-type": "application/json" },
          body: { ...currentPayload },
        };
      } else if (node.type === "ai.agent") {
        const score = 0.88;
        outputPayload = {
          qualificationScore: score,
          intent: "Enterprise High-Priority",
          analysis: "Lead operates a 180-employee company with INR 45Cr revenue. Strong match for OVRA Enterprise.",
          recommendedAction: score >= 0.7 ? "Notify Sales Team immediately" : "Send standard nurture email",
        };
        currentPayload = { ...currentPayload, ...outputPayload };
      } else if (node.type === "logic.if") {
        const score = (currentPayload.qualificationScore as number) ?? 0.85;
        const conditionMet = score >= 0.7;
        selectedBranch = conditionMet ? "yes" : "no";
        outputPayload = {
          evaluatedCondition: "score >= 0.7",
          conditionMet,
          chosenBranch: selectedBranch,
        };
      } else if (node.type === "comm.slack") {
        outputPayload = {
          channel: "#sales-leads",
          messageSent: true,
          timestamp: new Date().toISOString(),
          preview: `⚡ *High Priority Lead Qualified*: Aarav Sharma (TechScale India) - Score: 0.88`,
        };
      } else if (node.type === "comm.email") {
        outputPayload = {
          to: currentPayload.email || "aarav.sharma@techscale.in",
          subject: "Welcome to OVRA — Scalable Enterprise Automation",
          status: "queued",
        };
      } else {
        outputPayload = { processed: true, timestamp: new Date().toISOString() };
      }

      // Mark success
      const durationMs = Date.now() - stepStartTime;
      const successState: NodeExecutionState = {
        nodeId: node.id,
        nodeType: node.type,
        status: "success",
        startedAt: runningState.startedAt,
        finishedAt: new Date().toISOString(),
        durationMs,
        inputPayload: runningState.inputPayload,
        outputPayload,
      };
      nodeResults[node.id] = successState;
      if (onStep) onStep(node.id, successState);

      await this.realtime.emitEvent({
        eventId: `evt_${Date.now()}_${seq++}`,
        sequenceNumber: seq,
        executionId,
        workflowId: workflow.id,
        type: "node.completed",
        nodeId: node.id,
        timestamp: new Date().toISOString(),
        data: outputPayload,
      });

      // Find next node
      if (node.type === "logic.if") {
        // Choose branch based on selectedBranch ('yes' or 'no')
        const outgoingEdge = workflow.edges.find(
          (e) => e.source === node.id && (e.sourceHandle === selectedBranch || (!e.sourceHandle && selectedBranch === "yes"))
        );
        currentNodeId = outgoingEdge ? outgoingEdge.target : null;

        // Mark the other branch as skipped
        const skippedEdge = workflow.edges.find(
          (e) => e.source === node.id && e.sourceHandle !== selectedBranch
        );
        if (skippedEdge) {
          nodeResults[skippedEdge.target] = {
            nodeId: skippedEdge.target,
            nodeType: "skipped",
            status: "skipped",
          };
          if (onStep) onStep(skippedEdge.target, nodeResults[skippedEdge.target]);
        }
      } else {
        const nextEdge = workflow.edges.find((e) => e.source === node.id);
        currentNodeId = nextEdge ? nextEdge.target : null;
      }
    }

    const totalDurationMs = Date.now() - startTime;
    const finalResult: ExecutionResult = {
      executionId,
      workflowId: workflow.id,
      status: "SUCCESS",
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: totalDurationMs,
      nodeResults,
    };

    executionHistoryStore.set(executionId, finalResult);

    await this.realtime.emitEvent({
      eventId: `evt_${Date.now()}_${seq++}`,
      sequenceNumber: seq,
      executionId,
      workflowId: workflow.id,
      type: "execution.completed",
      timestamp: new Date().toISOString(),
      data: { durationMs: totalDurationMs },
    });

    return finalResult;
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionResult | null> {
    return executionHistoryStore.get(executionId) || null;
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const existing = executionHistoryStore.get(executionId);
    if (existing) {
      existing.status = "CANCELED";
      existing.finishedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export const defaultExecutionProvider = new BoundedExecutionSimulator();
