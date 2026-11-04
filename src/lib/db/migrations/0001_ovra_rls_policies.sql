-- ============================================================================
-- OVRA POSTGRESQL ROW LEVEL SECURITY (RLS) & TENANT ISOLATION POLICIES
-- ============================================================================

-- Helper: Retrieve verified active OVRA user UUID
CREATE OR REPLACE FUNCTION public.current_ovra_user()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('ovra.user_id', true), '')::uuid,
    auth.uid()
  );
$$;

-- Helper: Retrieve verified active OVRA workspace UUID
CREATE OR REPLACE FUNCTION public.current_ovra_workspace()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('ovra.workspace_id', true), '')::uuid;
$$;

-- Helper: Check if current user is an active member of workspace with optional minimum role
CREATE OR REPLACE FUNCTION public.is_workspace_member(
  target_workspace_id uuid,
  min_role text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  current_role text;
BEGIN
  -- 1. Check direct transaction-local workspace match if set
  IF current_ovra_workspace() IS NOT NULL AND current_ovra_workspace() != target_workspace_id THEN
    RETURN false;
  END IF;

  -- 2. Lookup role from workspace_members
  SELECT role INTO current_role
  FROM public.workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = public.current_ovra_user()
    AND status = 'active';

  IF current_role IS NULL THEN
    RETURN false;
  END IF;

  -- 3. Validate hierarchy if min_role specified
  IF min_role IS NULL THEN
    RETURN true;
  ELSIF min_role = 'owner' THEN
    RETURN current_role = 'owner';
  ELSIF min_role = 'admin' THEN
    RETURN current_role IN ('owner', 'admin');
  ELSIF min_role = 'editor' THEN
    RETURN current_role IN ('owner', 'admin', 'editor');
  ELSIF min_role = 'operator' THEN
    RETURN current_role IN ('owner', 'admin', 'editor', 'operator');
  ELSE
    RETURN true;
  END IF;
END;
$$;

-- ============================================================================
-- ENABLE RLS ON ALL TENANT-OWNED TABLES
-- ============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_connector_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_payload_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR WORKSPACES
-- ============================================================================

CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(id));

CREATE POLICY "workspaces_insert" ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK (created_by_id = public.current_ovra_user());

CREATE POLICY "workspaces_update" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(id, 'admin'))
  WITH CHECK (public.is_workspace_member(id, 'admin'));

CREATE POLICY "workspaces_delete" ON public.workspaces
  FOR DELETE TO authenticated
  USING (public.is_workspace_member(id, 'owner'));

-- ============================================================================
-- RLS POLICIES FOR WORKSPACE MEMBERS
-- ============================================================================

CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, 'admin'));

CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'admin'))
  WITH CHECK (public.is_workspace_member(workspace_id, 'admin'));

CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE TO authenticated
  USING (
    public.is_workspace_member(workspace_id, 'admin')
    AND role != 'owner'
  );

-- ============================================================================
-- RLS POLICIES FOR WORKFLOWS
-- ============================================================================

CREATE POLICY "workflows_select" ON public.workflows
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workflows_insert" ON public.workflows
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, 'editor'));

CREATE POLICY "workflows_update" ON public.workflows
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'editor'))
  WITH CHECK (public.is_workspace_member(workspace_id, 'editor'));

CREATE POLICY "workflows_delete" ON public.workflows
  FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'admin'));

-- ============================================================================
-- RLS POLICIES FOR CREDENTIAL CONNECTIONS
-- ============================================================================

CREATE POLICY "credentials_select" ON public.credential_connections
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, 'operator'));

CREATE POLICY "credentials_insert" ON public.credential_connections
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, 'editor'));

CREATE POLICY "credentials_update" ON public.credential_connections
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'admin'))
  WITH CHECK (public.is_workspace_member(workspace_id, 'admin'));

CREATE POLICY "credentials_delete" ON public.credential_connections
  FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'admin'));

-- ============================================================================
-- RLS POLICIES FOR EXECUTIONS & LOGS
-- ============================================================================

CREATE POLICY "executions_select" ON public.executions
  FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "executions_insert" ON public.executions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, 'operator'));

CREATE POLICY "executions_update" ON public.executions
  FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, 'operator'))
  WITH CHECK (public.is_workspace_member(workspace_id, 'operator'));
