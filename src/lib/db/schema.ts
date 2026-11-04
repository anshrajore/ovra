import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  billingTier: text("billing_tier").default("starter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").default("team").notNull(), // 'personal', 'startup', 'company', 'team'
  environment: text("environment").default("production").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").default("editor").notNull(), // 'owner', 'admin', 'editor', 'operator', 'viewer'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const workspaceInvitations = pgTable("workspace_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  role: text("role").default("editor").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'revoked'
  invitedBy: uuid("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const workspaceActivity = pgTable("workspace_activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  action: text("action").notNull(), // e.g. 'created_workflow', 'published_version', 'executed_workflow'
  targetType: text("target_type").notNull(), // 'workflow', 'member', 'workspace', 'credential'
  targetTitle: text("target_title").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
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
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowVersions = pgTable("workflow_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .references(() => workflows.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("version_number").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedBy: text("published_by"),
  graphDefinition: jsonb("graph_definition").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowComments = pgTable("workflow_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .references(() => workflows.id, { onDelete: "cascade" })
    .notNull(),
  nodeId: text("node_id"),
  userId: uuid("user_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const executions = pgTable("executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  workflowId: uuid("workflow_id")
    .references(() => workflows.id, { onDelete: "cascade" })
    .notNull(),
  workflowName: text("workflow_name"),
  workflowVersionId: uuid("workflow_version_id"),
  status: text("status").default("QUEUED").notNull(), // 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED'
  triggerType: text("trigger_type").default("manual").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
  durationMs: integer("duration_ms"),
});

export const executionNodes = pgTable("execution_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  executionId: uuid("execution_id")
    .references(() => executions.id, { onDelete: "cascade" })
    .notNull(),
  nodeId: text("node_id").notNull(),
  nodeType: text("node_type").notNull(),
  nodeLabel: text("node_label"),
  status: text("status").notNull(), // 'running', 'success', 'failed', 'skipped'
  inputPayload: jsonb("input_payload"),
  outputPayload: jsonb("output_payload"),
  durationMs: integer("duration_ms"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const executionEvents = pgTable("execution_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  executionId: uuid("execution_id")
    .references(() => executions.id, { onDelete: "cascade" })
    .notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  integrationType: text("integration_type").notNull(),
  maskedKey: text("masked_key").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastTestedAt: timestamp("last_tested_at"),
});
