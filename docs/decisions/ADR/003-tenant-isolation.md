# ADR-003: Multi-Tenant Data Isolation and Authorization

- **Status:** Accepted
- **Date:** 2026-11-03
- **Deciders:** OVRA Engineering / Architecture

## Context
In a multi-tenant enterprise automation platform, accidental data leaks between organizations or workspaces represent catastrophic security vulnerabilities. Software-only WHERE clauses are susceptible to developer error.

## Decision
OVRA implements **Defense-in-Depth Multi-Tenancy**:
1. **Hierarchical Tenancy:** `Organization` is the administrative/billing root; `Workspace` is the boundary for workflows, executions, and credentials.
2. **Mandatory Ownership Columns:** Every tenant-owned database record must contain an immutable `organization_id` and `workspace_id`.
3. **Application-Layer Authorization:** Every incoming API request validates user session, workspace membership, and RBAC permissions before querying data.
4. **Database-Layer Row-Level Security (RLS):** PostgreSQL RLS policies enforce isolation as an independent guardrail. The current tenant context (`app.current_workspace_id`) is set strictly within transaction-local configuration (`SELECT set_config('app.current_workspace_id', :id, true)`).
5. **Connection Pooling Safety:** Tenant context is never set at session level to prevent leakage across pooled database connections.

## Consequences
- **Positive:** Dual-layer protection prevents data exposure even if an application SQL query misses a tenant filter.
- **Negative:** Requires rigorous transaction management for every database query; ORM tooling must support transaction-local GUC parameters without connection leaking.
