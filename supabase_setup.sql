-- ============================================================================
-- OVRA COMPLETE PRODUCTION DATABASE DDL & RLS POLICIES
-- Run this script in Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SCHEMAS & TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"billing_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"timezone" text DEFAULT 'Asia/Kolkata',
	"locale" text DEFAULT 'en-IN',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid REFERENCES "organizations"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"type" text DEFAULT 'team' NOT NULL,
	"environment" text DEFAULT 'production' NOT NULL,
	"created_by_id" uuid REFERENCES "profiles"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL REFERENCES "workspace_roles"("id") ON DELETE cascade,
	"action" text NOT NULL,
	"resource" text DEFAULT '*' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE cascade,
	"role" text DEFAULT 'editor' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"email" text NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"token" text NOT NULL UNIQUE,
	"invited_by" uuid REFERENCES "profiles"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"user_id" uuid REFERENCES "profiles"("id"),
	"actor_name" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"target_name" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "connectors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"icon_url" text,
	"website_url" text,
	"docs_url" text,
	"auth_type" text NOT NULL,
	"is_official" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "connector_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connector_id" text NOT NULL REFERENCES "connectors"("id") ON DELETE cascade,
	"version" text NOT NULL,
	"auth_config_schema" jsonb NOT NULL,
	"metadata" jsonb,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "node_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"connector_id" text NOT NULL REFERENCES "connectors"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"kind" text NOT NULL,
	"inputs_schema" jsonb NOT NULL,
	"outputs_schema" jsonb NOT NULL,
	"config_schema" jsonb NOT NULL,
	"ui_schema" jsonb,
	"is_deprecated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "node_operations" (
	"id" text PRIMARY KEY NOT NULL,
	"node_definition_id" text NOT NULL REFERENCES "node_definitions"("id") ON DELETE cascade,
	"operation_id" text NOT NULL,
	"method" text,
	"path" text,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workspace_connector_installs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"connector_id" text NOT NULL REFERENCES "connectors"("id") ON DELETE cascade,
	"installed_by" uuid REFERENCES "profiles"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "node_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE cascade,
	"node_definition_id" text NOT NULL REFERENCES "node_definitions"("id") ON DELETE cascade,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "credential_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"connector_id" text NOT NULL REFERENCES "connectors"("id") ON DELETE cascade,
	"account_label" text NOT NULL,
	"auth_type" text NOT NULL,
	"masked_key" text NOT NULL,
	"encrypted_payload" text NOT NULL,
	"encryption_key_version" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by_id" uuid REFERENCES "profiles"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_tested_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "credential_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"credential_id" uuid NOT NULL REFERENCES "credential_connections"("id") ON DELETE cascade,
	"action" text NOT NULL,
	"execution_id" uuid,
	"node_id" text,
	"accessed_by" uuid REFERENCES "profiles"("id"),
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"project_id" uuid REFERENCES "projects"("id") ON DELETE set null,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"active_version" integer DEFAULT 1 NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_by" uuid REFERENCES "profiles"("id"),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflow_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL REFERENCES "workflows"("id") ON DELETE cascade,
	"version_number" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_by" text,
	"graph_definition" jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflow_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"workflow_id" uuid NOT NULL REFERENCES "workflows"("id") ON DELETE cascade,
	"trigger_type" text NOT NULL,
	"configuration" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflow_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"workflow_id" uuid NOT NULL REFERENCES "workflows"("id") ON DELETE cascade,
	"node_id" text,
	"user_id" uuid NOT NULL REFERENCES "profiles"("id"),
	"content" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"workflow_id" uuid NOT NULL REFERENCES "workflows"("id") ON DELETE cascade,
	"workflow_version_id" uuid REFERENCES "workflow_versions"("id"),
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"trigger_type" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"duration_ms" integer,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "node_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"execution_id" uuid NOT NULL REFERENCES "executions"("id") ON DELETE cascade,
	"node_id" text NOT NULL,
	"node_type" text NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"duration_ms" integer,
	"inputs" jsonb,
	"outputs" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "execution_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"execution_id" uuid NOT NULL REFERENCES "executions"("id") ON DELETE cascade,
	"sequence_number" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "execution_payload_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"execution_id" uuid NOT NULL REFERENCES "executions"("id") ON DELETE cascade,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"workflow_id" uuid NOT NULL REFERENCES "workflows"("id") ON DELETE cascade,
	"path" text NOT NULL,
	"method" text DEFAULT 'POST' NOT NULL,
	"secret_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trigger_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"connector_id" text NOT NULL,
	"target_webhook_id" uuid NOT NULL REFERENCES "webhook_endpoints"("id") ON DELETE cascade,
	"subscription_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_provider_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"provider" text NOT NULL,
	"baseUrl" text,
	"credential_id" uuid NOT NULL REFERENCES "credential_connections"("id") ON DELETE cascade,
	"model_allowlist" jsonb,
	"monthly_token_budget" integer,
	"current_month_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"execution_id" uuid,
	"node_id" text,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_tokens" integer NOT NULL,
	"completion_tokens" integer NOT NULL,
	"total_tokens" integer NOT NULL,
	"estimated_cost_usd" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "knowledge_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"source_uri" text,
	"sync_status" text DEFAULT 'idle' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"knowledge_source_id" uuid NOT NULL REFERENCES "knowledge_sources"("id") ON DELETE cascade,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE cascade,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"actor_id" uuid,
	"actor_type" text DEFAULT 'user' NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"diff_payload" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"metric" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "legal_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"version" text NOT NULL,
	"content_hash" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'signup_checkbox' NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"selected_path" text,
	"primary_goal" text,
	"completed_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS "idx_workflows_ws" ON "workflows" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_executions_ws_time" ON "executions" ("workspace_id", "started_at");
CREATE INDEX IF NOT EXISTS "idx_node_exec_ws" ON "node_executions" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_node_exec_execid" ON "node_executions" ("execution_id");
CREATE INDEX IF NOT EXISTS "idx_exec_events_ws" ON "execution_events" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_exec_events_exec_seq" ON "execution_events" ("execution_id", "sequence_number");
CREATE INDEX IF NOT EXISTS "idx_credentials_ws" ON "credential_connections" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_workspace_members_ws" ON "workspace_members" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_workspace_members_user" ON "workspace_members" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "uidx_workspace_user" ON "workspace_members" ("workspace_id", "user_id");

-- ============================================================================
-- 3. RLS HELPER FUNCTIONS
-- ============================================================================

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

CREATE OR REPLACE FUNCTION public.current_ovra_workspace()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('ovra.workspace_id', true), '')::uuid;
$$;

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
  IF current_ovra_workspace() IS NOT NULL AND current_ovra_workspace() != target_workspace_id THEN
    RETURN false;
  END IF;

  SELECT role INTO current_role
  FROM public.workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = public.current_ovra_user()
    AND status = 'active';

  IF current_role IS NULL THEN
    RETURN false;
  END IF;

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
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspaces_member_select') THEN
    CREATE POLICY workspaces_member_select ON public.workspaces
      FOR SELECT USING (public.is_workspace_member(id) OR created_by_id = public.current_ovra_user());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workflows_tenant_all') THEN
    CREATE POLICY workflows_tenant_all ON public.workflows
      FOR ALL USING (public.is_workspace_member(workspace_id, 'operator'))
      WITH CHECK (public.is_workspace_member(workspace_id, 'editor'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'executions_tenant_all') THEN
    CREATE POLICY executions_tenant_all ON public.executions
      FOR ALL USING (public.is_workspace_member(workspace_id, 'operator'))
      WITH CHECK (public.is_workspace_member(workspace_id, 'operator'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'credentials_tenant_select') THEN
    CREATE POLICY credentials_tenant_select ON public.credential_connections
      FOR SELECT USING (public.is_workspace_member(workspace_id, 'operator'));
  END IF;
END $$;
