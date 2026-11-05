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
    action: "Initialized workspace",
    targetType: "workspace",
    targetTitle: "Team Workspace",
    timestamp: "Just now",
  },
];

const initialCredentials: CredentialItem[] = [];

const initialExecutions: ExecutionRecord[] = [];

const initialWorkflowsList: WorkflowDefinition[] = [];

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
  private workflowVersions: Record<string, WorkflowVersionRecord[]> = {};
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
      if (c) {
        const parsed = JSON.parse(c);
        this.credentials = Array.isArray(parsed)
          ? parsed.filter((item: CredentialItem) => !["cred_slack", "cred_whatsapp", "cred_razorpay", "cred_gemini"].includes(item.id))
          : [];
      }

      const ex = localStorage.getItem("ovra_executions");
      if (ex) {
        const parsed = JSON.parse(ex);
        this.executions = Array.isArray(parsed)
          ? parsed.filter((item: ExecutionRecord) => !["exec_109281", "exec_109280", "exec_109279"].includes(item.id))
          : [];
      }

      const wf = localStorage.getItem("ovra_workflows");
      if (wf) {
        const parsed = JSON.parse(wf);
        this.workflows = Array.isArray(parsed)
          ? parsed.filter((item: WorkflowDefinition) => !["wf_lead_qualification", "wf_razorpay_order", "wf_churn_sentinel"].includes(item.id))
          : [];
      }

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
