"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  CreditCard,
  MessageSquare,
  Mail,
  Database,
  Phone,
  Shield,
  ArrowRight,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: "ai" | "payments" | "messaging" | "database";
  docsUrl: string;
  connectedType?: string;
}

const INTEGRATIONS_CATALOG: IntegrationItem[] = [
  {
    id: "gemini",
    name: "Google Gemini AI",
    description: "Multimodal intelligence engine (Gemini 2.5 Pro & Flash) for agentic reasoning and data extraction.",
    category: "ai",
    docsUrl: "https://ai.google.dev",
    connectedType: "gemini",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Industry leading GPT-4o language models, function calling, and vector embeddings.",
    category: "ai",
    docsUrl: "https://platform.openai.com",
    connectedType: "openai",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "India's payment gateway for UPI, cards, netbanking, automated refunds, and payment link generation.",
    category: "payments",
    docsUrl: "https://razorpay.com/docs",
    connectedType: "razorpay",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    description: "Direct official Meta Cloud API integration for transaction alerts and conversational support.",
    category: "messaging",
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
    connectedType: "whatsapp",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Post interactive notifications, slash commands, and security alerts to engineering channels.",
    category: "messaging",
    docsUrl: "https://api.slack.com",
    connectedType: "slack",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Connect to Supabase, Neon, AWS RDS, or self-hosted PostgreSQL for raw SQL queries and CDC.",
    category: "database",
    docsUrl: "https://www.postgresql.org/docs",
    connectedType: "postgres",
  },
  {
    id: "resend",
    name: "Resend Email",
    description: "Developer-first transactional email delivery with custom domain DKIM and open-rate telemetry.",
    category: "messaging",
    docsUrl: "https://resend.com/docs",
  },
  {
    id: "pinecone",
    name: "Pinecone Vector DB",
    description: "High-performance vector index for Retrieval-Augmented Generation (RAG) and semantic search.",
    category: "database",
    docsUrl: "https://www.pinecone.io/docs",
  },
];

export default function IntegrationsPage() {
  const store = useAppStore();
  const credentials = store.getCredentials();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filteredIntegrations = useMemo(() => {
    return INTEGRATIONS_CATALOG.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = category === "all" ? true : item.category === category;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, category]);

  const isConnected = (type?: string) => {
    if (!type) return false;
    return credentials.some((c) => c.integrationType === type);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Integrations Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="integrations" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-ovra-orange" />
                Integrations Directory
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Plug-and-play connectors for AI foundations, Indian payments, messaging, and cloud databases.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-ovra-border/60 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-ovra-orange transition-all"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                {[
                  { id: "all", label: "All" },
                  { id: "ai", label: "AI Models" },
                  { id: "payments", label: "Payments" },
                  { id: "messaging", label: "Messaging" },
                  { id: "database", label: "Databases" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      category === cat.id
                        ? "bg-white text-gray-950 font-semibold shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((item) => {
                const connected = isConnected(item.connectedType);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-ovra-border/70 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-800">
                          {getIntegrationIcon(item.id)}
                        </div>

                        {connected ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Connected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">
                            Not Configured
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-gray-950">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <a
                        href={item.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium"
                      >
                        Docs
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <Link
                        href="/credentials"
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                          connected
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            : "bg-ovra-orange hover:bg-ovra-orange-dark text-white shadow-2xs"
                        }`}
                      >
                        <span>{connected ? "Manage Key" : "Connect"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getIntegrationIcon(id: string) {
  if (id === "gemini") return <Sparkles className="w-5 h-5 text-purple-600" />;
  if (id === "openai") return <Sparkles className="w-5 h-5 text-emerald-600" />;
  if (id === "razorpay") return <CreditCard className="w-5 h-5 text-blue-600" />;
  if (id === "whatsapp") return <Phone className="w-5 h-5 text-emerald-500" />;
  if (id === "slack") return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
  if (id === "postgres") return <Database className="w-5 h-5 text-gray-700" />;
  if (id === "resend") return <Mail className="w-5 h-5 text-rose-500" />;
  return <Shield className="w-5 h-5 text-gray-600" />;
}
