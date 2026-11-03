/**
 * Core interface for data persistence and tenant-isolated operations.
 * Initial implementation: Drizzle ORM + Managed PostgreSQL
 */

export interface DatabaseProvider {
  withTenant<T>(
    workspaceId: string,
    callback: (db: unknown) => Promise<T>
  ): Promise<T>;
  healthCheck(): Promise<boolean>;
}
