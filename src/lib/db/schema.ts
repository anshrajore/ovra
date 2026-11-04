import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  bigint,
} from "drizzle-orm/pg-core";

// ============================================================================
// 1. IDENTITY & PROFILES (Linked to Supabase auth.users)
// ============================================================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Matches auth.users.id
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  timezone: text("timezone").default("Asia/Kolkata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Backward-compatible alias for existing references
export const users = profiles;

// ============================================================================
// 2. ORGANIZATIONS & WORKSPACES
// ============================================================================

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  billingTier: text("billing_tier").default("starter").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  type: text("type").default("team").notNull(), // 'personal', 'startup', 'company', 'team'
  environment: text("environment").default("production").notNull(), // 'production', 'staging', 'development'
  createdById: uuid("created_by_id").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceRoles = pgTable("workspace_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(), // 'owner', 'admin', 'editor', 'operator', 'viewer'
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspacePermissions = pgTable("workspace_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id")
    .references(() => workspaceRoles.id, { onDelete: "cascade" })
    .notNull(),
  action: text("action").notNull(), // e.g., 'workflow.create', 'credential.read', 'execution.trigger'
  resource: text("resource").default("*").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").default("editor").notNull(), // 'owner', 'admin', 'editor', 'operator', 'viewer'
    status: text("status").default("active").notNull(), // 'active', 'invited', 'suspended'
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_workspace_members_user").on(t.userId),
    index("idx_workspace_members_ws").on(t.workspaceId),
    uniqueIndex("uidx_workspace_user").on(t.workspaceId, t.userId),
  ]
);

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    email: text("email").notNull(),
    role: text("role").default("editor").notNull(),
    token: text("token").notNull().unique(),
    status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'revoked', 'expired'
    invitedBy: uuid("invited_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("idx_invitations_ws").on(t.workspaceId)]
);

export const workspaceActivity = pgTable(
  "workspace_activity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => profiles.id),
    userName: text("user_name").notNull(),
    userAvatar: text("user_avatar"),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(), // 'workflow', 'member', 'workspace', 'credential'
    targetTitle: text("target_title").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_activity_ws_time").on(t.workspaceId, t.createdAt)]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_projects_ws").on(t.workspaceId)]
);

// ============================================================================
// 3. NODE PLATFORM (Connectors, Operations, Definitions & Installs)
// ============================================================================

export const connectors = pgTable("connectors", {
  id: text("id").primaryKey(), // e.g., 'google-sheets', 'slack', 'razorpay'
  name: text("name").notNull(),
  category: text("category").notNull(), // 'triggers', 'actions', 'logic', 'ai', 'database', 'communication'
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  websiteUrl: text("website_url"),
  docsUrl: text("docs_url"),
  authType: text("auth_type").notNull(), // 'oauth2', 'api_key', 'bearer', 'basic', 'none'
  isOfficial: boolean("is_official").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const connectorVersions = pgTable(
  "connector_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectorId: text("connector_id")
      .references(() => connectors.id, { onDelete: "cascade" })
      .notNull(),
    version: text("version").notNull(), // Semantic version, e.g. '1.0.0'
    authConfigSchema: jsonb("auth_config_schema").notNull(),
    metadata: jsonb("metadata"),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uidx_connector_version").on(t.connectorId, t.version)]
);

export const nodeDefinitions = pgTable("node_definitions", {
  id: text("id").primaryKey(), // e.g., 'core.webhook', 'google-sheets.append-row'
  connectorId: text("connector_id")
    .references(() => connectors.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  kind: text("kind").default("action").notNull(), // 'trigger', 'action', 'logic', 'flow'
  version: text("version").default("1.0.0").notNull(),
  inputsSchema: jsonb("inputs_schema").notNull(),
  outputsSchema: jsonb("outputs_schema").notNull(),
  configSchema: jsonb("config_schema").notNull(),
  uiSchema: jsonb("ui_schema"),
  executionPolicy: jsonb("execution_policy"), // { timeoutMs: 15000, retryable: true, idempotent: false }
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const nodeOperations = pgTable("node_operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeDefinitionId: text("node_definition_id")
    .references(() => nodeDefinitions.id, { onDelete: "cascade" })
    .notNull(),
  operationId: text("operation_id").notNull(), // e.g., 'appendRow', 'searchRows'
  httpMethod: text("http_method"), // 'GET', 'POST', 'PUT', 'DELETE'
  endpointTemplate: text("endpoint_template"),
  requestTransform: jsonb("request_transform"),
  responseTransform: jsonb("response_transform"),
});

export const workspaceConnectorInstalls = pgTable(
  "workspace_connector_installs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    connectorId: text("connector_id")
      .references(() => connectors.id, { onDelete: "cascade" })
      .notNull(),
    installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
    installedBy: uuid("installed_by").references(() => profiles.id),
  },
  (t) => [
    index("idx_installed_connectors_ws").on(t.workspaceId),
    uniqueIndex("uidx_ws_connector").on(t.workspaceId, t.connectorId),
  ]
);

export const nodeFavorites = pgTable(
  "node_favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    nodeDefinitionId: text("node_definition_id")
      .references(() => nodeDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("uidx_user_node_fav").on(t.workspaceId, t.userId, t.nodeDefinitionId)]
);

// ============================================================================
// 4. CREDENTIAL BROKER & VAULT
// ============================================================================

export const credentialConnections = pgTable(
  "credential_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    connectorId: text("connector_id")
      .references(() => connectors.id, { onDelete: "cascade" })
      .notNull(),
    accountLabel: text("account_label").notNull(),
    authType: text("auth_type").notNull(),
    maskedKey: text("masked_key").notNull(),
    encryptedPayload: text("encrypted_payload").notNull(), // AES-256-GCM ciphertext
    encryptionKeyVersion: integer("encryption_key_version").default(1).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  },
  (t) => [index("idx_credentials_ws").on(t.workspaceId)]
);

export const credentialAudit = pgTable(
  "credential_audit",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    credentialId: uuid("credential_id")
      .references(() => credentialConnections.id, { onDelete: "cascade" })
      .notNull(),
    action: text("action").notNull(), // 'leased', 'rotated', 'tested', 'revoked'
    executionId: uuid("execution_id"),
    nodeId: text("node_id"),
    accessedBy: uuid("accessed_by").references(() => profiles.id),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_cred_audit_ws_time").on(t.workspaceId, t.accessedAt)]
);

// Backward-compatible alias
export const credentials = credentialConnections;

// ============================================================================
// 5. WORKFLOWS, VERSIONS & TRIGGERS
// ============================================================================

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").default("draft").notNull(), // 'active', 'draft', 'archived'
    activeVersion: integer("active_version").default(1).notNull(),
    revision: integer("revision").default(1).notNull(), // Optimistic locking
    updatedBy: uuid("updated_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_workflows_ws").on(t.workspaceId)]
);

export const workflowVersions = pgTable(
  "workflow_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workflowId: uuid("workflow_id")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    versionNumber: integer("version_number").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedBy: text("published_by"),
    graphDefinition: jsonb("graph_definition").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_wf_versions_wfid").on(t.workflowId),
    uniqueIndex("uidx_wf_version").on(t.workflowId, t.versionNumber),
  ]
);

export const workflowTriggers = pgTable(
  "workflow_triggers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    workflowId: uuid("workflow_id")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    triggerType: text("trigger_type").notNull(), // 'webhook', 'schedule', 'app_event'
    triggerConfig: jsonb("trigger_config").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_wf_triggers_ws").on(t.workspaceId)]
);

export const workflowComments = pgTable(
  "workflow_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    workflowId: uuid("workflow_id")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    nodeId: text("node_id"),
    userId: uuid("user_id").references(() => profiles.id),
    authorName: text("author_name").notNull(),
    authorAvatar: text("author_avatar"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_wf_comments_wfid").on(t.workflowId)]
);

// ============================================================================
// 6. EXECUTION ENGINE (Executions, Nodes, Events & Payload Refs)
// ============================================================================

export const executions = pgTable(
  "executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    workflowId: uuid("workflow_id")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    workflowName: text("workflow_name"),
    workflowVersionId: uuid("workflow_version_id"),
    status: text("status").default("QUEUED").notNull(), // 'QUEUED', 'CLAIMED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'OUTCOME_UNKNOWN'
    triggerType: text("trigger_type").default("manual").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    error: text("error"),
  },
  (t) => [index("idx_executions_ws_time").on(t.workspaceId, t.startedAt)]
);

export const nodeExecutions = pgTable(
  "node_executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    executionId: uuid("execution_id")
      .references(() => executions.id, { onDelete: "cascade" })
      .notNull(),
    nodeId: text("node_id").notNull(),
    nodeType: text("node_type").notNull(),
    nodeLabel: text("node_label"),
    status: text("status").notNull(), // 'pending', 'claimed', 'running', 'success', 'failed', 'skipped', 'outcome_unknown'
    inputPayload: jsonb("input_payload"),
    outputPayload: jsonb("output_payload"),
    inputPayloadRef: text("input_payload_ref"), // Storage URL if >64KB
    outputPayloadRef: text("output_payload_ref"), // Storage URL if >64KB
    durationMs: integer("duration_ms"),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_node_exec_execid").on(t.executionId),
    index("idx_node_exec_ws").on(t.workspaceId),
  ]
);

// Backward-compatible alias
export const executionNodes = nodeExecutions;

export const executionEvents = pgTable(
  "execution_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    executionId: uuid("execution_id")
      .references(() => executions.id, { onDelete: "cascade" })
      .notNull(),
    sequenceNumber: integer("sequence_number").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_exec_events_exec_seq").on(t.executionId, t.sequenceNumber),
    index("idx_exec_events_ws").on(t.workspaceId),
  ]
);

export const executionPayloadRefs = pgTable(
  "execution_payload_refs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    executionId: uuid("execution_id")
      .references(() => executions.id, { onDelete: "cascade" })
      .notNull(),
    nodeExecutionId: uuid("node_execution_id"),
    storageBucket: text("storage_bucket").notNull(),
    storagePath: text("storage_path").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    sha256Checksum: text("sha256_checksum").notNull(),
    mimeType: text("mime_type").default("application/json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_payload_refs_ws").on(t.workspaceId)]
);

// ============================================================================
// 7. WEBHOOKS & SUBSCRIPTIONS
// ============================================================================

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    workflowId: uuid("workflow_id")
      .references(() => workflows.id, { onDelete: "cascade" })
      .notNull(),
    triggerId: text("trigger_id").notNull().unique(),
    secretHash: text("secret_hash"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_webhooks_ws").on(t.workspaceId)]
);

export const triggerSubscriptions = pgTable(
  "trigger_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    connectorId: text("connector_id").notNull(),
    externalSubscriptionId: text("external_subscription_id"),
    targetWebhookId: uuid("target_webhook_id")
      .references(() => webhookEndpoints.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_trigger_sub_ws").on(t.workspaceId)]
);

// ============================================================================
// 8. AI INFRASTRUCTURE & RAG
// ============================================================================

export const aiProviderConnections = pgTable(
  "ai_provider_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(), // 'gemini', 'openai', 'anthropic', 'custom'
    baseUrl: text("baseUrl"),
    credentialId: uuid("credential_id")
      .references(() => credentialConnections.id, { onDelete: "cascade" })
      .notNull(),
    modelAllowlist: jsonb("model_allowlist"), // e.g. ['gemini-2.5-pro', 'gpt-4o']
    monthlyTokenBudget: integer("monthly_token_budget"),
    currentMonthTokens: integer("current_month_tokens").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_ai_connections_ws").on(t.workspaceId)]
);

export const aiUsageRecords = pgTable(
  "ai_usage_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    executionId: uuid("execution_id"),
    nodeId: text("node_id"),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    promptTokens: integer("prompt_tokens").notNull(),
    completionTokens: integer("completion_tokens").notNull(),
    totalTokens: integer("total_tokens").notNull(),
    estimatedCostUsd: text("estimated_cost_usd"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_ai_usage_ws_time").on(t.workspaceId, t.createdAt)]
);

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    sourceType: text("source_type").notNull(), // 'file', 'website', 'api'
    status: text("status").default("ready").notNull(), // 'indexing', 'ready', 'failed'
    storagePath: text("storage_path"),
    chunkCount: integer("chunk_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_knowledge_sources_ws").on(t.workspaceId)]
);

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    knowledgeSourceId: uuid("knowledge_source_id")
      .references(() => knowledgeSources.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    embeddingVector: jsonb("embedding_vector"), // Stored as array, maps to pgvector in Postgres
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_knowledge_chunks_ws").on(t.workspaceId)]
);

// ============================================================================
// 9. AUDIT, NOTIFICATIONS & USAGE
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    actorId: uuid("actor_id"),
    actorType: text("actor_type").default("user").notNull(), // 'user', 'system', 'api_key'
    action: text("action").notNull(), // e.g. 'credential.created', 'workflow.published', 'member.removed'
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    diffPayload: jsonb("diff_payload"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_audit_logs_ws_time").on(t.workspaceId, t.createdAt)]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    linkUrl: text("link_url"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_notifications_user").on(t.userId)]
);

export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    executionCount: integer("execution_count").default(0).notNull(),
    executionDurationSeconds: integer("execution_duration_seconds").default(0).notNull(),
    storageBytesUsed: bigint("storage_bytes_used", { mode: "number" }).default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_usage_records_ws_period").on(t.workspaceId, t.periodStart)]
);
