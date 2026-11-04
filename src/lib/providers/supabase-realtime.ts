/**
 * Supabase Realtime Provider
 * Broadcasts events over Supabase Realtime Channels with Monotonic Sequence
 * Numbering and REST Replay Cursor.
 */

import { RealtimeProvider, ExecutionEventPayload } from "./realtime";
import { getSupabaseBrowserClient } from "../supabase/client";
import { getSupabaseAdminClient } from "../supabase/admin";
import { db } from "../db";
import { executionEvents } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";

class SupabaseRealtimeProviderImpl implements RealtimeProvider {
  // In-memory cache for fast REST cursor queries and offline mode
  private eventCache = new Map<string, ExecutionEventPayload[]>();
  private localListeners = new Map<string, Set<(event: ExecutionEventPayload) => void>>();
  private sequenceCounters = new Map<string, number>();

  /**
   * Get next monotonic sequence number for an execution
   */
  public getNextSequenceNumber(executionId: string): number {
    const current = this.sequenceCounters.get(executionId) || 0;
    const next = current + 1;
    this.sequenceCounters.set(executionId, next);
    return next;
  }

  /**
   * Emit an execution event over broadcast and record to store
   */
  public async emitEvent(event: ExecutionEventPayload): Promise<void> {
    const list = this.eventCache.get(event.executionId) || [];
    list.push(event);
    this.eventCache.set(event.executionId, list);

    // 1. Notify local subscribers
    const listeners = this.localListeners.get(event.executionId);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(event);
        } catch (err) {
          console.error("Local realtime subscriber error:", err);
        }
      });
    }

    // 2. Broadcast via Supabase Realtime (Server or Client)
    const admin = getSupabaseAdminClient();
    if (admin) {
      try {
        const channel = admin.channel(`execution:${event.executionId}`);
        await channel.send({
          type: "broadcast",
          event: "execution_event",
          payload: event,
        });
      } catch (err) {
        // Fallback to local
      }
    }

    // 3. Persist to DB execution_events if available
    try {
      if (db) {
        await db.insert(executionEvents).values({
          workspaceId: ((event.data as any)?.workspaceId as any) || "00000000-0000-0000-0000-000000000000",
          executionId: event.executionId as any,
          sequenceNumber: event.sequenceNumber,
          eventType: event.type,
          payload: { nodeId: event.nodeId, ...(event.data || {}) },
          createdAt: new Date(event.timestamp),
        });
      }
    } catch {
      // In offline / mock dev mode, in-memory cache handles queries
    }
  }

  /**
   * Fetch all events since a given sequence number (REST Replay Cursor)
   */
  public async getEventsSince(
    executionId: string,
    sinceSequenceNumber: number
  ): Promise<ExecutionEventPayload[]> {
    // 1. Check in-memory cache first
    const cached = this.eventCache.get(executionId);
    if (cached && cached.length > 0) {
      return cached.filter((e) => e.sequenceNumber > sinceSequenceNumber);
    }

    // 2. Query from database
    try {
      if (db) {
        const rows = await db
          .select()
          .from(executionEvents)
          .where(
            and(
              eq(executionEvents.executionId, executionId as any),
              gt(executionEvents.sequenceNumber, sinceSequenceNumber)
            )
          )
          .orderBy(executionEvents.sequenceNumber);

        return rows.map((r) => ({
          eventId: r.id,
          sequenceNumber: r.sequenceNumber,
          executionId: r.executionId,
          workflowId: "",
          type: r.eventType as any,
          nodeId: (r.payload as any)?.nodeId || undefined,
          timestamp: r.createdAt.toISOString(),
          data: (r.payload as Record<string, unknown>) || undefined,
        }));
      }
    } catch {
      return [];
    }
    return [];
  }

  /**
   * Subscribe to execution events via Realtime channel and local emitter
   */
  public subscribe(
    executionId: string,
    callback: (event: ExecutionEventPayload) => void
  ): () => void {
    // 1. Add local listener
    if (!this.localListeners.has(executionId)) {
      this.localListeners.set(executionId, new Set());
    }
    this.localListeners.get(executionId)!.add(callback);

    // 2. Add Supabase Realtime channel listener if in browser
    let sbChannel: any = null;
    if (typeof window !== "undefined") {
      const browserClient = getSupabaseBrowserClient();
      sbChannel = browserClient
        .channel(`execution:${executionId}`)
        .on("broadcast", { event: "execution_event" }, (payload: any) => {
          if (payload?.payload) {
            callback(payload.payload);
          }
        })
        .subscribe();
    }

    return () => {
      this.localListeners.get(executionId)?.delete(callback);
      if (sbChannel) {
        sbChannel.unsubscribe();
      }
    };
  }
}

export const supabaseRealtimeProvider = new SupabaseRealtimeProviderImpl();
