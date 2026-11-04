"use client";

import { initialWorkflow } from "../data/initial-workflow";
import { WorkflowDefinition, WorkflowNodeData, WorkflowConnection } from "../types/workflow";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: "personal" | "startup" | "company" | "team";
  environment: "production" | "staging" | "development";
  role: "owner" | "admin" | "editor" | "operator" | "viewer";
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "admin" | "editor" | "operator" | "viewer";
  status: "active" | "invited";
  joinedAt: string;
}

export interface WorkspaceActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  targetType: "workflow" | "member" | "workspace" | "credential";
  targetTitle: string;
  timestamp: string;
}

export interface CredentialItem {
  id: string;
  name: string;
  integrationType: "slack" | "whatsapp" | "razorpay" | "openai" | "postgres" | "gemini";
  maskedKey: string;
  status: "active" | "testing" | "error";
  createdAt: string;
  lastTestedAt?: string;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "SUCCESS" | "RUNNING" | "FAILED" | "CANCELED";
  triggerType: "manual" | "webhook" | "schedule";
  startedAt: string;
  durationMs: number;
  nodeCount: number;
  steps: Array<{
    nodeId: string;
    nodeLabel: string;
    nodeType: string;
    status: "success" | "running" | "failed" | "skipped";
    durationMs?: number;
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    error?: string;
  }>;
}

export interface WorkflowVersionRecord {
  versionNumber: number;
  publishedAt: string;
  publishedBy: string;
  notes: string;
  definition: WorkflowDefinition;
}

// Initial Mock Seed Data
const initialUser: User = {
  id: "usr_ansh",
  name: "Ansh Rajore",
  email: "anshrajore1266@gmail.com",
  avatar: "A",
  role: "Platform Administrator",
};

const initialWorkspaces: Workspace[] = [
  {
    id: "ws_team_workspace",
    name: "Team Workspace",
    description: "Primary enterprise collaboration workspace",
    type: "team",
    environment: "production",
    role: "owner",
    createdAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "ws_nayamarg",
    name: "NayaMarg Engineering",
    description: "Core automation engine & API integrations",
    type: "company",
    environment: "production",
    role: "admin",
    createdAt: "2026-10-20T11:30:00Z",
  },
  {
    id: "ws_sanjeevanix",
    name: "SanjeevaniX Labs",
    description: "Health-tech & AI pipeline operations",
    type: "startup",
    environment: "staging",
    role: "editor",
    createdAt: "2026-10-28T14:15:00Z",
  },
  {
    id: "ws_personal",
    name: "Personal Sandbox",
    description: "Private developer experiments & custom nodes",
    type: "personal",
    environment: "development",
    role: "owner",
    createdAt: "2026-11-01T08:00:00Z",
  },
];

const initialMembers: WorkspaceMember[] = [
  {
    id: "usr_ansh",
    name: "Ansh Rajore",
    email: "anshrajore1266@gmail.com",
    avatar: "A",
    role: "owner",
    status: "active",
    joinedAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "usr_priya",
    name: "Priya Sharma",
    email: "priya.sharma@ovra.in",
    avatar: "P",
    role: "admin",
    status: "active",
    joinedAt: "2026-10-18T10:00:00Z",
  },
  {
    id: "usr_rahul",
    name: "Rahul Verma",
    email: "rahul.verma@partner.in",
    avatar: "R",
    role: "editor",
    status: "active",
    joinedAt: "2026-10-25T16:20:00Z",
  },
  {
    id: "usr_neha",
    name: "Neha Patel",
    email: "neha@enterprise.co.in",
    avatar: "N",
    role: "operator",
    status: "invited",
    joinedAt: "2026-11-02T12:00:00Z",
  },
];

const initialActivity: WorkspaceActivityItem[] = [
  {
    id: "act_1",
    userName: "Ansh Rajore",
    userAvatar: "A",
    action: "Published version 1 of",
    targetType: "workflow",
    targetTitle: "Lead Qualification Flow",
    timestamp: "10 mins ago",
  },
  {
    id: "act_2",
    userName: "Priya Sharma",
    userAvatar: "P",
    action: "Tested execution of",
    targetType: "workflow",
    targetTitle: "Razorpay Invoice Webhook",
    timestamp: "2 hours ago",
  },
  {
    id: "act_3",
    userName: "Ansh Rajore",
    userAvatar: "A",
    action: "Configured API credential for",
    targetType: "credential",
    targetTitle: "WhatsApp Business Cloud",
    timestamp: "1 day ago",
  },
  {
    id: "act_4",
    userName: "Rahul Verma",
    userAvatar: "R",
    action: "Joined the workspace as",
    targetType: "member",
    targetTitle: "Editor",
    timestamp: "3 days ago",
  },
];

const initialCredentials: CredentialItem[] = [
  {
    id: "cred_slack",
    name: "Slack Bot Token (Sales Alerts)",
    integrationType: "slack",
    maskedKey: "xoxb-9821••••••••••••",
    status: "active",
    createdAt: "2026-10-22T08:00:00Z",
    lastTestedAt: "Today at 10:15 AM",
  },
  {
    id: "cred_whatsapp",
    name: "WhatsApp Business Cloud API",
    integrationType: "whatsapp",
    maskedKey: "EAAJ7••••••••••••wZDZD",
    status: "active",
    createdAt: "2026-10-25T14:30:00Z",
    lastTestedAt: "Yesterday at 4:20 PM",
  },
  {
    id: "cred_razorpay",
    name: "Razorpay Live Webhook Secret",
    integrationType: "razorpay",
    maskedKey: "rzp_live_••••••••••••",
    status: "active",
    createdAt: "2026-10-30T11:00:00Z",
    lastTestedAt: "Oct 30, 2026",
  },
  {
    id: "cred_gemini",
    name: "Google Gemini AI Production Key",
    integrationType: "gemini",
    maskedKey: "AIzaSy••••••••••••3M4k",
    status: "active",
    createdAt: "2026-11-01T09:15:00Z",
    lastTestedAt: "Just now",
  },
];

const initialExecutions: ExecutionRecord[] = [
  {
    id: "exec_109281",
    workflowId: "wf_lead_qualification",
    workflowName: "Lead Qualification Flow",
    status: "SUCCESS",
    triggerType: "webhook",
    startedAt: "2026-11-04T10:45:00Z",
    durationMs: 1420,
    nodeCount: 4,
    steps: [
      {
        nodeId: "node_webhook",
        nodeLabel: "Webhook",
        nodeType: "core.webhook",
        status: "success",
        durationMs: 120,
        outputs: { leadName: "Aarav Sharma", email: "aarav@techscale.in", score: 0.88 },
      },
      {
        nodeId: "node_ai_agent",
        nodeLabel: "AI Agent",
        nodeType: "ai.agent",
        status: "success",
        durationMs: 780,
        outputs: { qualificationScore: 0.88, intent: "Enterprise" },
      },
      {
        nodeId: "node_if_logic",
        nodeLabel: "IF",
        nodeType: "logic.if",
        status: "success",
        durationMs: 25,
        outputs: { conditionMet: true, chosenBranch: "yes" },
      },
      {
        nodeId: "node_slack",
        nodeLabel: "Slack",
        nodeType: "comm.slack",
        status: "success",
        durationMs: 495,
        outputs: { messageSent: true, channel: "#sales-leads" },
      },
      {
        nodeId: "node_email",
        nodeLabel: "Email",
        nodeType: "comm.email",
        status: "skipped",
      },
    ],
  },
  {
    id: "exec_109280",
    workflowId: "wf_lead_qualification",
    workflowName: "Lead Qualification Flow",
    status: "SUCCESS",
    triggerType: "manual",
    startedAt: "2026-11-04T09:12:00Z",
    durationMs: 1380,
    nodeCount: 4,
    steps: [
      { nodeId: "node_webhook", nodeLabel: "Webhook", nodeType: "core.webhook", status: "success", durationMs: 100 },
      { nodeId: "node_ai_agent", nodeLabel: "AI Agent", nodeType: "ai.agent", status: "success", durationMs: 720 },
      { nodeId: "node_if_logic", nodeLabel: "IF", nodeType: "logic.if", status: "success", durationMs: 30 },
      { nodeId: "node_slack", nodeLabel: "Slack", nodeType: "comm.slack", status: "success", durationMs: 530 },
    ],
  },
  {
    id: "exec_109279",
    workflowId: "wf_lead_qualification",
    workflowName: "Lead Qualification Flow",
    status: "FAILED",
    triggerType: "webhook",
    startedAt: "2026-11-03T18:30:00Z",
    durationMs: 2100,
    nodeCount: 2,
    steps: [
      { nodeId: "node_webhook", nodeLabel: "Webhook", nodeType: "core.webhook", status: "success", durationMs: 110 },
      { nodeId: "node_ai_agent", nodeLabel: "AI Agent", nodeType: "ai.agent", status: "failed", durationMs: 1990, error: "AI Gateway rate limit exceeded. Retry scheduled." },
    ],
  },
];

const initialWorkflowsList: WorkflowDefinition[] = [
  initialWorkflow,
  {
    id: "wf_razorpay_order",
    name: "Razorpay Payment & Invoice Delivery",
    description: "Listens to payment.captured, generates GST invoice, and dispatches confirmation via WhatsApp.",
    status: "active",
    version: 2,
    workspaceId: "ws_team_workspace",
    projectId: "proj_sanjeevanix",
    lastSavedAt: "1 hour ago",
    nodes: [
      { id: "node_rzp", type: "finance.razorpay", label: "Razorpay", subtitle: "Payment Captured", status: "idle" },
      { id: "node_db", type: "db.postgres", label: "PostgreSQL", subtitle: "Record Transaction", status: "idle" },
      { id: "node_wa", type: "comm.whatsapp", label: "WhatsApp", subtitle: "Send Invoice PDF", status: "idle" },
    ],
    edges: [
      { id: "e1", source: "node_rzp", target: "node_db" },
      { id: "e2", source: "node_db", target: "node_wa" },
    ],
  },
  {
    id: "wf_churn_sentinel",
    name: "Customer Churn Sentinel",
    description: "Monitors NPS scores, flags dissatisfied accounts, and automatically books retention call.",
    status: "draft",
    version: 1,
    workspaceId: "ws_team_workspace",
    lastSavedAt: "Yesterday",
    nodes: [
      { id: "node_nps", type: "core.webhook", label: "NPS Survey", subtitle: "Score Ingested", status: "idle" },
      { id: "node_ai_churn", type: "ai.agent", label: "AI Agent", subtitle: "Sentiment Risk Analysis", status: "idle" },
      { id: "node_slack_alert", type: "comm.slack", label: "Slack", subtitle: "Alert Success Manager", status: "idle" },
    ],
    edges: [
      { id: "ec1", source: "node_nps", target: "node_ai_churn" },
      { id: "ec2", source: "node_ai_churn", target: "node_slack_alert" },
    ],
  },
];

// In-Memory & LocalStorage Synchronized Store Class
class AppStore {
  private user: User = initialUser;
  private workspaces: Workspace[] = initialWorkspaces;
  private activeWorkspaceId: string = "ws_team_workspace";
  private members: WorkspaceMember[] = initialMembers;
  private activities: WorkspaceActivityItem[] = initialActivity;
  private credentials: CredentialItem[] = initialCredentials;
  private executions: ExecutionRecord[] = initialExecutions;
  private workflows: WorkflowDefinition[] = initialWorkflowsList;
  private workflowVersions: Record<string, WorkflowVersionRecord[]> = {
    wf_lead_qualification: [
      {
        versionNumber: 1,
        publishedAt: "2026-11-03T14:00:00Z",
        publishedBy: "Ansh Rajore",
        notes: "Initial production release of Lead Qualification Flow",
        definition: initialWorkflow,
      },
    ],
  };
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    // Defer loading until after initial client mount to guarantee zero SSR hydration mismatches
  }

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;
    this.loadFromLocalStorage();
    this.notify();
  }

  private saveToLocalStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ovra_user", JSON.stringify(this.user));
      localStorage.setItem("ovra_workspaces", JSON.stringify(this.workspaces));
      localStorage.setItem("ovra_active_ws", this.activeWorkspaceId);
      localStorage.setItem("ovra_members", JSON.stringify(this.members));
      localStorage.setItem("ovra_activity", JSON.stringify(this.activities));
      localStorage.setItem("ovra_credentials", JSON.stringify(this.credentials));
      localStorage.setItem("ovra_executions", JSON.stringify(this.executions));
      localStorage.setItem("ovra_workflows", JSON.stringify(this.workflows));
      localStorage.setItem("ovra_versions", JSON.stringify(this.workflowVersions));
    } catch (e) {
      console.warn("Could not save store to localStorage:", e);
    }
  }

  private loadFromLocalStorage() {
    if (typeof window === "undefined") return;
    try {
      const u = localStorage.getItem("ovra_user");
      if (u) this.user = JSON.parse(u);

      const w = localStorage.getItem("ovra_workspaces");
      if (w) this.workspaces = JSON.parse(w);

      const aw = localStorage.getItem("ovra_active_ws");
      if (aw) this.activeWorkspaceId = aw;

      const m = localStorage.getItem("ovra_members");
      if (m) this.members = JSON.parse(m);

      const a = localStorage.getItem("ovra_activity");
      if (a) this.activities = JSON.parse(a);

      const c = localStorage.getItem("ovra_credentials");
      if (c) this.credentials = JSON.parse(c);

      const ex = localStorage.getItem("ovra_executions");
      if (ex) this.executions = JSON.parse(ex);

      const wf = localStorage.getItem("ovra_workflows");
      if (wf) this.workflows = JSON.parse(wf);

      const v = localStorage.getItem("ovra_versions");
      if (v) this.workflowVersions = JSON.parse(v);
    } catch (e) {
      console.warn("Could not load store from localStorage:", e);
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((cb) => cb());
  }

  // --- User & Profile ---
  public getUser(): User {
    return this.user;
  }

  public updateUser(partial: Partial<User>) {
    this.user = { ...this.user, ...partial };
    this.notify();
  }

  // --- Workspaces ---
  public getWorkspaces(): Workspace[] {
    return this.workspaces;
  }

  public getActiveWorkspace(): Workspace {
    return (
      this.workspaces.find((w) => w.id === this.activeWorkspaceId) ||
      this.workspaces[0]
    );
  }

  public setActiveWorkspace(id: string) {
    if (this.workspaces.some((w) => w.id === id)) {
      this.activeWorkspaceId = id;
      this.logActivity("Switched to workspace", "workspace", this.getActiveWorkspace().name);
      this.notify();
    }
  }

  public createWorkspace(name: string, description: string, type: Workspace["type"]): Workspace {
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      description,
      type,
      environment: "production",
      role: "owner",
      createdAt: new Date().toISOString(),
    };
    this.workspaces.push(newWs);
    this.activeWorkspaceId = newWs.id;
    this.logActivity("Created new workspace", "workspace", name);
    this.notify();
    return newWs;
  }

  public updateWorkspace(id: string, partial: Partial<Workspace>) {
    this.workspaces = this.workspaces.map((w) =>
      w.id === id ? { ...w, ...partial } : w
    );
    this.notify();
  }

  public deleteWorkspace(id: string) {
    if (this.workspaces.length <= 1) return; // Keep at least one
    this.workspaces = this.workspaces.filter((w) => w.id !== id);
    this.activeWorkspaceId = this.workspaces[0].id;
    this.notify();
  }

  // --- Members ---
  public getMembers(): WorkspaceMember[] {
    return this.members;
  }

  public inviteMember(email: string, role: WorkspaceMember["role"]) {
    const namePart = email.split("@")[0];
    const newMember: WorkspaceMember = {
      id: `usr_${Date.now()}`,
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      email,
      avatar: namePart.charAt(0).toUpperCase(),
      role,
      status: "invited",
      joinedAt: new Date().toISOString(),
    };
    this.members.push(newMember);
    this.logActivity(`Invited ${email} as`, "member", role);
    this.notify();
  }

  public updateMemberRole(id: string, role: WorkspaceMember["role"]) {
    this.members = this.members.map((m) =>
      m.id === id ? { ...m, role } : m
    );
    this.notify();
  }

  public removeMember(id: string) {
    this.members = this.members.filter((m) => m.id !== id);
    this.notify();
  }

  // --- Activity Log ---
  public getActivity(): WorkspaceActivityItem[] {
    return this.activities;
  }

  public logActivity(
    action: string,
    targetType: WorkspaceActivityItem["targetType"],
    targetTitle: string
  ) {
    const item: WorkspaceActivityItem = {
      id: `act_${Date.now()}`,
      userName: this.user.name,
      userAvatar: this.user.avatar,
      action,
      targetType,
      targetTitle,
      timestamp: "Just now",
    };
    this.activities.unshift(item);
    if (this.activities.length > 50) this.activities.pop();
    this.notify();
  }

  // --- Workflows ---
  public getWorkflows(): WorkflowDefinition[] {
    return this.workflows.filter((w) => w.workspaceId === this.activeWorkspaceId);
  }

  public getAllWorkflows(): WorkflowDefinition[] {
    return this.workflows;
  }

  public getWorkflowById(id: string): WorkflowDefinition | undefined {
    return this.workflows.find((w) => w.id === id);
  }

  public saveWorkflow(wf: WorkflowDefinition) {
    const index = this.workflows.findIndex((w) => w.id === wf.id);
    const updated = {
      ...wf,
      lastSavedAt: "Just now",
    };
    if (index >= 0) {
      this.workflows[index] = updated;
    } else {
      this.workflows.unshift(updated);
    }
    this.notify();
  }

  public createWorkflow(name: string, description?: string): WorkflowDefinition {
    const newWf: WorkflowDefinition = {
      id: `wf_${Date.now()}`,
      name: name || "Untitled Automation",
      description: description || "Custom workflow",
      status: "draft",
      version: 1,
      workspaceId: this.activeWorkspaceId,
      lastSavedAt: "Just now",
      nodes: [
        {
          id: "node_trigger",
          type: "core.webhook",
          label: "Webhook",
          subtitle: "Trigger on inbound HTTP request",
          status: "idle",
        },
      ],
      edges: [],
    };
    this.workflows.unshift(newWf);
    this.logActivity("Created new workflow", "workflow", newWf.name);
    this.notify();
    return newWf;
  }

  public duplicateWorkflow(id: string): WorkflowDefinition | undefined {
    const original = this.workflows.find((w) => w.id === id);
    if (!original) return;

    const cloned: WorkflowDefinition = {
      ...JSON.parse(JSON.stringify(original)),
      id: `wf_${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: "draft",
      version: 1,
      lastSavedAt: "Just now",
    };
    this.workflows.unshift(cloned);
    this.logActivity("Duplicated workflow", "workflow", cloned.name);
    this.notify();
    return cloned;
  }

  public deleteWorkflow(id: string) {
    const original = this.workflows.find((w) => w.id === id);
    if (original) {
      this.workflows = this.workflows.filter((w) => w.id !== id);
      this.logActivity("Deleted workflow", "workflow", original.name);
      this.notify();
    }
  }

  public publishWorkflowVersion(workflowId: string, notes?: string): number {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return 1;

    const newVersion = (wf.version || 1) + 1;
    wf.version = newVersion;
    wf.status = "active";
    wf.lastSavedAt = "Just now";

    if (!this.workflowVersions[workflowId]) {
      this.workflowVersions[workflowId] = [];
    }

    this.workflowVersions[workflowId].unshift({
      versionNumber: newVersion,
      publishedAt: new Date().toISOString(),
      publishedBy: this.user.name,
      notes: notes || `Published Version ${newVersion}`,
      definition: JSON.parse(JSON.stringify(wf)),
    });

    this.logActivity(`Published version ${newVersion} of`, "workflow", wf.name);
    this.notify();
    return newVersion;
  }

  public getWorkflowVersions(workflowId: string): WorkflowVersionRecord[] {
    return this.workflowVersions[workflowId] || [];
  }

  public restoreWorkflowVersion(workflowId: string, versionNumber: number): boolean {
    const versions = this.workflowVersions[workflowId];
    if (!versions) return false;
    const target = versions.find((v) => v.versionNumber === versionNumber);
    if (!target) return false;

    this.saveWorkflow({
      ...JSON.parse(JSON.stringify(target.definition)),
      lastSavedAt: "Restored just now",
    });
    this.logActivity(`Restored version ${versionNumber} of`, "workflow", target.definition.name);
    this.notify();
    return true;
  }

  // --- Executions ---
  public getExecutions(): ExecutionRecord[] {
    return this.executions;
  }

  public addExecutionRecord(record: ExecutionRecord) {
    this.executions.unshift(record);
    if (this.executions.length > 100) this.executions.pop();
    this.logActivity(`Executed workflow (${record.status})`, "workflow", record.workflowName);
    this.notify();
  }

  // --- Credentials ---
  public getCredentials(): CredentialItem[] {
    return this.credentials;
  }

  public addCredential(
    name: string,
    integrationType: CredentialItem["integrationType"],
    key: string
  ): CredentialItem {
    const masked = key.length > 8 ? `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}` : "••••••••";
    const item: CredentialItem = {
      id: `cred_${Date.now()}`,
      name,
      integrationType,
      maskedKey: masked,
      status: "active",
      createdAt: new Date().toISOString(),
      lastTestedAt: "Just now",
    };
    this.credentials.unshift(item);
    this.logActivity("Connected new API credential", "credential", name);
    this.notify();
    return item;
  }

  public deleteCredential(id: string) {
    this.credentials = this.credentials.filter((c) => c.id !== id);
    this.notify();
  }

  public testCredential(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const cred = this.credentials.find((c) => c.id === id);
      if (cred) {
        cred.status = "testing";
        this.notify();
        setTimeout(() => {
          cred.status = "active";
          cred.lastTestedAt = "Just now";
          this.notify();
          resolve(true);
        }, 800);
      } else {
        resolve(false);
      }
    });
  }
}

// Global Singleton Instance
export const appStore = new AppStore();
