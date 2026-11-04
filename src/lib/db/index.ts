import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

// Reusable SQL client for serverless environments
export const client = connectionString
  ? postgres(connectionString, { max: 10, idle_timeout: 20, connect_timeout: 2 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

/**
 * Execute a query within tenant-isolated Row-Level Security context.
 * Sets transaction-local variables `ovra.workspace_id` and `ovra.user_id`.
 */
export async function withTenantContext<T>(
  workspaceId: string,
  userId?: string,
  callback?: (tx: unknown) => Promise<T>
): Promise<T> {
  const cb = typeof userId === "function" ? userId : callback;
  const resolvedUserId = typeof userId === "string" ? userId : "";

  if (!db || !client || !cb) {
    // In local development or preview without direct DATABASE_URL, invoke fallback
    if (cb) return await cb(null);
    throw new Error("Database client not configured");
  }

  return await db.transaction(async (tx) => {
    // Set transaction-local GUC parameters for RLS
    await tx.execute(
      sql`SELECT set_config('ovra.workspace_id', ${workspaceId}, true)`
    );
    if (resolvedUserId) {
      await tx.execute(
        sql`SELECT set_config('ovra.user_id', ${resolvedUserId}, true)`
      );
    }
    return await cb(tx);
  });
}
