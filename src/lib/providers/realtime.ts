/**
 * Core interface for live execution streaming and event push.
 * Initial implementation: Server-Sent Events / In-Memory Replay Bus with REST cursor
 * Production implementation: NATS JetStream / Redis PubSub WebSocket Gateway
 */

export interface ExecutionEventPayload {
  eventId: string;
  sequenceNumber: number;
  executionId: string;
  workflowId: string;
  type:
    | "execution.started"
    | "node.started"
    | "node.completed"
    | "node.failed"
    | "node.skipped"
    | "execution.completed"
    | "execution.failed";
  nodeId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface RealtimeProvider {
  emitEvent(event: ExecutionEventPayload): Promise<void>;
  getEventsSince(
    executionId: string,
    sinceSequenceNumber: number
  ): Promise<ExecutionEventPayload[]>;
  subscribe(
    executionId: string,
    callback: (event: ExecutionEventPayload) => void
  ): () => void;
}

export { supabaseRealtimeProvider } from "./supabase-realtime";

