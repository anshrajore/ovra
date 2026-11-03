import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

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
  environment: text("environment").default("production").notNull(),
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
  graphDefinition: jsonb("graph_definition").notNull(),
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
  encryptedData: text("encrypted_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
