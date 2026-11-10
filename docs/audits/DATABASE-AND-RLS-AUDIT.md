# OVRA Database & RLS Security Audit

**Audit Date:** 10 November 2026  
**Target Project:** Remote Supabase PostgreSQL (`ywfdgtsuyrqfazgimyqw`)  
**Schema File:** [`supabase_setup.sql`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/supabase_setup.sql)  
**ORM Schema:** [`src/lib/db/schema.ts`](file:///Users/anshrajore/.gemini/antigravity/scratch/ovra/src/lib/db/schema.ts)

---

## 1. Table Verification Summary (36 Tables)

All 36 tables exist and have RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) enabled in PostgreSQL:

1. `organizations` — Tenant boundary.
2. `workspaces` — Isolated project workspaces.
3. `workspace_members` — Member to workspace mapping with roles (`owner`, `admin`, `builder`, `viewer`).
4. `workspace_roles` — RBAC role definitions.
5. `workspace_permissions` — Granular capability flags.
6. `profiles` — User profile metadata attached to `auth.users`.
7. `projects` — Project grouping within workspaces.
8. `workflows` — Workflow DAG definitions with versioning.
9. `workflow_versions` — Immutable snapshots of published workflows.
10. `workflow_triggers` — Trigger subscriptions (webhook, schedule, event).
11. `node_definitions` — Official and custom node manifests.
12. `node_operations` — Operation metadata and schemas.
13. `connectors` — Connector registry entries.
14. `connector_versions` — Versioned connector bundles.
15. `workspace_connector_installs` — Enabled connectors per workspace.
16. `credential_connections` — Encrypted credential pointers.
17. `credential_audit` — Access logging for leased credentials.
18. `executions` — Workflow execution run records.
19. `node_executions` — Step-level execution state and duration.
20. `execution_events` — SSE telemetry event store.
21. `execution_payload_refs` — Offloaded storage references (>64 KiB).
22. `ai_provider_connections` — LLM API configurations.
23. `ai_usage_records` — Token tracking and cost telemetry.
24. `knowledge_sources` — RAG document source metadata.
25. `knowledge_chunks` — Vector chunks with `vector(1536)` embeddings.
26. `webhook_endpoints` — Inbound webhook endpoints.
27. `trigger_subscriptions` — Polling / webhook subscriptions.
28. `audit_logs` — Platform governance logs.
29. `workspace_activity` — Real-time event feed for team dashboard.
30. `workflow_comments` — Canvas collaboration comments.
31. `node_favorites` — User-pinned favorite nodes.
32. `user_onboarding` — 8-step wizard progress records.
33. `legal_acceptances` — Consent records (Terms, Privacy, DPDP).
34. `notifications` — In-app alerts and notifications.
35. `usage_records` — Aggregate execution minute and quota counters.
36. `workspace_invitations` — Pending team invitations.

---

## 2. Row Level Security (RLS) Policies

- **Tenant Isolation:**
  Workspaces, workflows, executions, and credentials enforce `auth.uid()` checks through `workspace_members`:
  ```sql
  CREATE POLICY "workspace_isolation" ON workflows
    FOR ALL USING (
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    );
  ```
- **Service Role Bypass Safety:**
  The server-side runner connects using scoped roles and never bypasses RLS in client-initiated requests.
- **Credential Storage Safety:**
  `credential_connections` stores encrypted tokens using AES-256-GCM. Raw plaintext tokens are never returned in public table queries.
