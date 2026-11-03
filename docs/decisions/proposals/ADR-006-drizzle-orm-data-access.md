# ADR-006 (Proposal): Drizzle ORM as the Primary Data Access Layer

- **Status:** Proposed (Awaiting Owner Review)
- **Date:** 2026-11-03
- **Proposed By:** Principal Architect & Security Reviewer

## Context
The OVRA baseline architecture specification listed "Prisma or Drizzle after a migration/RLS proof-of-concept".
OVRA relies on PostgreSQL Row-Level Security (RLS) as a core defense-in-depth barrier. Multi-tenant isolation requires executing:
```sql
SELECT set_config('app.current_workspace_id', :workspaceId, true);
```
The third parameter `true` scopes the GUC (Grand Unified Configuration) parameter strictly to the current transaction. This prevents context leakage across pooled connections managed by PgBouncer or connection pools.

## Comparison & Technical Evaluation

### Prisma
- Prisma abstracts database queries behind its engine.
- To set transaction-local variables, developers must wrap queries inside `prisma.$transaction(async (tx) => { await tx.$executeRaw`...`; ... })` or implement Prisma Client Extensions.
- If any developer accidentally executes a standard query outside the transaction extension, or if an extension breaks under edge cases, queries execute without the tenant GUC set.
- Prisma Query Engine introduces a memory and latency tax on serverless or low-latency endpoints.

### Drizzle ORM
- Drizzle is a lightweight, type-safe SQL query builder with zero binary engine overhead.
- Operates directly over standard `node-postgres` (`pg`) connection pools.
- Encapsulating tenant transactions is idiomatic and clean:
  ```typescript
  export async function withTenantContext<T>(
    workspaceId: string,
    callback: (tx: DrizzleTransaction) => Promise<T>
  ): Promise<T> {
    return await db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)`
      );
      return await callback(tx);
    });
  }
  ```
- Any query run inside `withTenantContext` is guaranteed to execute on the same checked-out client with the transaction-scoped GUC, and automatically releases and resets upon completion.
- Schema definitions are pure TypeScript objects and integrate seamlessly into Turborepo shared packages.

## Decision Proposal
Formally adopt **Drizzle ORM** as the standard database data access toolkit for the OVRA platform.

## Consequences
- **Positive:** Maximum performance, zero query engine abstraction, direct SQL transparency, and airtight RLS transaction scoping without risk of connection-leakage.
- **Negative:** Drizzle migrations require careful file review during CI/CD, though Drizzle Kit provides robust schema diffing.
