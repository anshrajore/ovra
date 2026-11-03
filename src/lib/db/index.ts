import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Reusable SQL client for serverless environments
export const client = connectionString
  ? postgres(connectionString, { max: 10, idle_timeout: 20 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

/**
 * Execute a query within tenant-isolated Row-Level Security context.
 */
export async function withTenantContext<T>(
  workspaceId: string,
  callback: (tx: unknown) => Promise<T>
): Promise<T> {
  if (!db || !client) {
    // In local development or preview without DATABASE_URL, invoke directly
    return callback(null);
  }

  return await db.transaction(async (tx) => {
    // Set transaction-local GUC parameter for RLS using Drizzle's sql template tag
    await tx.execute(
      sql`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)`
    );
    return await callback(tx);
  });
}
