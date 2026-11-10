"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  CreditCard,
  MessageSquare,
  Mail,
  Database,
  Layers,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";
import { WorkflowDefinition } from "@/lib/types/workflow";

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: "fintech" | "ai_agents" | "ecommerce" | "devops";
  nodeCount: number;
  featured?: boolean;
  tags: string[];
  workflow: WorkflowDefinition;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "tpl_lead_qualification",
    title: "Inbound Lead Qualification & Routing",
    description: "Automatically processes inbound leads, scores with AI Agent, and routes high-value prospects to Slack and nurture emails.",
    category: "ai_agents",
    nodeCount: 5,
    featured: true,
    tags: ["Inbound Leads", "Gemini AI", "Slack", "Email Delivery", "Routing"],
    workflow: {
      id: "",
      name: "Lead Qualification & Routing",
      description: "Automatically processes inbound leads, scores with AI Agent, and routes to Slack or Email.",
      status: "draft",
      version: 1,
      workspaceId: "",
      lastSavedAt: "Template imported",
      nodes: [
        {
          id: "node_webhook",
          type: "core.webhook",
          label: "Webhook",
          subtitle: "New lead received",
          status: "idle",
          config: {
            method: "POST",
            path: "/api/v1/webhooks/leads-inbound",
          },
        },
        {
          id: "node_ai_agent",
          type: "ai.agent",
          label: "AI Agent",
          subtitle: "Qualify the lead",
          status: "idle",
          config: {
            model: "gemini-1.5-pro",
            prompt: "Analyze the lead's company size, revenue, and inquiry message. Compute qualification score between 0.0 and 1.0.",
            threshold: 0.7,
          },
        },
        {
          id: "node_if_logic",
          type: "logic.if",
          label: "IF",
          subtitle: "Score >= 0.7",
          status: "idle",
          config: {
            condition: "$nodes.node_ai_agent.output.qualificationScore >= 0.7",
          },
        },
        {
          id: "node_slack",
          type: "comm.slack",
          label: "Slack",
          subtitle: "Notify Sales Team",
          status: "idle",
          config: {
            channel: "#sales-leads",
            notifyUsers: ["@sales-leads-bot", "@account-exec"],
          },
        },
        {
          id: "node_email",
          type: "comm.email",
          label: "Email",
          subtitle: "Send Nurture Email",
          status: "idle",
          config: {
            template: "nurture-series-welcome",
            sender: "team@ovra.in",
          },
        },
      ],
      edges: [
        {
          id: "edge_webhook_to_ai",
          source: "node_webhook",
          target: "node_ai_agent",
        },
        {
          id: "edge_ai_to_if",
          source: "node_ai_agent",
          target: "node_if_logic",
        },
        {
          id: "edge_if_to_slack",
          source: "node_if_logic",
          sourceHandle: "yes",
          target: "node_slack",
          label: "Yes",
        },
        {
          id: "edge_if_to_email",
          source: "node_if_logic",
          sourceHandle: "no",
          target: "node_email",
          label: "No",
        },
      ],
    },
  },
  {
    id: "tpl_razorpay_fraud",
    title: "Razorpay Payment Fraud Triage",
    description: "Evaluates inbound payment events with Gemini 2.5 Pro, flags risky transactions, and alerts the ops team on Slack.",
    category: "fintech",
    nodeCount: 4,
    featured: true,
    tags: ["Razorpay", "Gemini AI", "Slack", "Risk Scoring"],
    workflow: {
      id: "",
      name: "Razorpay Payment Fraud Triage",
      description: "Evaluates inbound payment events with Gemini 2.5 Pro and alerts on Slack.",
      status: "draft",
      version: 1,
      workspaceId: "",
      lastSavedAt: "Template imported",
      nodes: [
        {
          id: "node_trigger",
          type: "core.webhook",
          label: "Razorpay Webhook",
          subtitle: "payment.failed or captured",
          status: "idle",
          config: { method: "POST", path: "/api/v1/webhooks/razorpay" },
        },
        {
          id: "node_ai",
          type: "ai.agent",
          label: "Gemini 2.5 Risk Evaluator",
          subtitle: "Analyze buyer history & velocity",
          status: "idle",
          config: { model: "gemini-2.5-pro", temperature: 0.1 },
        },
        {
          id: "node_if",
          type: "logic.if",
          label: "Risk Score > 75",
          subtitle: "Branch on high risk flag",
          status: "idle",
          config: { field: "riskScore", operator: "greater_than", threshold: "75" },
        },
        {
          id: "node_slack",
          type: "comm.slack",
          label: "Slack #fraud-alerts",
          subtitle: "Notify security officer",
          status: "idle",
          config: { channel: "#fraud-alerts" },
        },
      ],
      edges: [
        { id: "e1", source: "node_trigger", target: "node_ai" },
        { id: "e2", source: "node_ai", target: "node_if" },
        { id: "e3", source: "node_if", target: "node_slack", label: "Yes" },
      ],
    },
  },
  {
    id: "tpl_whatsapp_delivery",
    title: "WhatsApp Order Status & Delivery Alert",
    description: "Listens for Shopify or WooCommerce shipment updates and dispatches personalized WhatsApp template messages via Cloud API.",
    category: "ecommerce",
    nodeCount: 3,
    featured: true,
    tags: ["WhatsApp", "E-Commerce", "Logistics", "Notifications"],
    workflow: {
      id: "",
      name: "WhatsApp Order Status Alert",
      description: "Dispatches personalized WhatsApp template messages for order delivery.",
      status: "draft",
      version: 1,
      workspaceId: "",
      lastSavedAt: "Template imported",
      nodes: [
        {
          id: "node_trigger",
          type: "core.webhook",
          label: "Shipment Event",
          subtitle: "Courier tracking update",
          status: "idle",
        },
        {
          id: "node_if",
          type: "logic.if",
          label: "Status === Out For Delivery",
          subtitle: "Verify final mile dispatch",
          status: "idle",
        },
        {
          id: "node_slack",
          type: "comm.email",
          label: "Send Customer Notice",
          subtitle: "WhatsApp / Email Dispatch",
          status: "idle",
        },
      ],
      edges: [
        { id: "e1", source: "node_trigger", target: "node_if" },
        { id: "e2", source: "node_if", target: "node_slack", label: "Yes" },
      ],
    },
  },
  {
    id: "tpl_ai_ticket_triage",
    title: "AI Support Ticket Auto-Response & Escalation",
    description: "Ingests Zendesk/Email tickets, categorizes intent using Claude or Gemini, drafts auto-replies, and routes VIP users to on-call.",
    category: "ai_agents",
    nodeCount: 4,
    tags: ["Support", "Claude", "NLP", "Ticketing"],
    workflow: {
      id: "",
      name: "AI Support Ticket Auto-Response",
      description: "Ingests tickets, categorizes intent, and auto-routes tickets.",
      status: "draft",
      version: 1,
      workspaceId: "",
      lastSavedAt: "Template imported",
      nodes: [
        {
          id: "node_trigger",
          type: "core.webhook",
          label: "New Ticket Received",
          subtitle: "Inbound customer inquiry",
          status: "idle",
        },
        {
          id: "node_ai",
          type: "ai.agent",
          label: "Intent & Sentiment Analyzer",
          subtitle: "Gemini 2.5 reasoning",
          status: "idle",
        },
        {
          id: "node_if",
          type: "logic.if",
          label: "Is High Priority?",
          subtitle: "Evaluate customer tier",
          status: "idle",
        },
        {
          id: "node_email",
          type: "comm.email",
          label: "Dispatch Auto-Draft",
          subtitle: "Send resolution guidance",
          status: "idle",
        },
      ],
      edges: [
        { id: "e1", source: "node_trigger", target: "node_ai" },
        { id: "e2", source: "node_ai", target: "node_if" },
        { id: "e3", source: "node_if", target: "node_email", label: "Yes" },
      ],
    },
  },
  {
    id: "tpl_postgres_audit",
    title: "PostgreSQL Database Mutation Audit Stream",
    description: "Monitors change data capture (CDC) row events, sanitizes sensitive columns, and streams audit records to data lake.",
    category: "devops",
    nodeCount: 3,
    tags: ["PostgreSQL", "CDC", "Security", "Audit Log"],
    workflow: {
      id: "",
      name: "PostgreSQL Database Mutation Audit",
      description: "Monitors change data capture events and writes immutable audit logs.",
      status: "draft",
      version: 1,
      workspaceId: "",
      lastSavedAt: "Template imported",
      nodes: [
        {
          id: "node_trigger",
          type: "core.webhook",
          label: "Postgres CDC Trigger",
          subtitle: "INSERT or UPDATE event",
          status: "idle",
        },
        {
          id: "node_if",
          type: "logic.if",
          label: "Table in Audited List",
          subtitle: "Filter production schemas",
          status: "idle",
        },
        {
          id: "node_slack",
          type: "comm.slack",
          label: "Slack #dev-audit",
          subtitle: "Post schema change alert",
          status: "idle",
        },
      ],
      edges: [
        { id: "e1", source: "node_trigger", target: "node_if" },
        { id: "e2", source: "node_if", target: "node_slack" },
      ],
    },
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const store = useAppStore();
  const activeWorkspace = store.getActiveWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      const matchesSearch =
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" ? true : tpl.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleUseTemplate = (tpl: TemplateItem) => {
    const newWf: WorkflowDefinition = {
      ...JSON.parse(JSON.stringify(tpl.workflow)),
      id: `wf_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      name: tpl.title,
      status: "draft",
      version: 1,
      lastSavedAt: "Template imported just now",
    };

    store.saveWorkflow(newWf);
    router.push(`/studio?id=${newWf.id}`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Templates Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="templates" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2342FF] transition-colors mb-2.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Studio Canvas
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                <LayoutGrid className="w-6 h-6 text-ovra-orange" />
                Template Marketplace
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Battle-tested automation recipes for modern engineering, AI agents, and India tech scale.
              </p>
            </div>

            {/* Filter & Category Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-ovra-border/60 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates by integration or use case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-ovra-orange transition-all"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "all", label: "All Templates" },
                  { id: "fintech", label: "FinTech & Payments" },
                  { id: "ecommerce", label: "E-Commerce" },
                  { id: "ai_agents", label: "AI Agents" },
                  { id: "devops", label: "DevOps & Cloud" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-white text-gray-950 font-semibold shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-3xl border border-ovra-border/70 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {tpl.featured && (
                          <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Popular
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-gray-400" />
                          {tpl.nodeCount} nodes
                        </span>
                      </div>

                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize">
                        {tpl.category.replace("_", " ")}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-gray-950 group-hover:text-ovra-orange transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {tpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-50 border border-gray-200/80 rounded-md text-[10px] font-medium text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Ready to deploy
                    </span>

                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className="px-4 py-2 bg-gray-950 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all group-hover:bg-ovra-orange"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
