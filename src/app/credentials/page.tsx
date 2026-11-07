"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Plus,
  ShieldCheck,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Lock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CreditCard,
  Database,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";
import { CredentialItem } from "@/lib/store/app-store";

export default function CredentialsPage() {
  const store = useAppStore();
  const credentials = store.getCredentials();
  const activeWorkspace = store.getActiveWorkspace();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [credName, setCredName] = useState("");
  const [integrationType, setIntegrationType] = useState<CredentialItem["integrationType"]>("openai");
  const [secretKey, setSecretKey] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credName.trim() || !secretKey.trim()) return;

    store.addCredential(credName.trim(), integrationType, secretKey.trim());
    setIsAddModalOpen(false);
    setCredName("");
    setSecretKey("");
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    await store.testCredential(id);
    setTestingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Permanently delete credential "${name}"? Automations using this key may fail.`)) {
      store.deleteCredential(id);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Credentials Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="credentials" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button Breadcrumb */}
            <div className="flex items-center gap-2">
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2342FF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Studio Canvas</span>
              </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                  <KeyRound className="w-6 h-6 text-ovra-orange" />
                  API Credentials & Vault
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage encrypted API keys and OAuth tokens for integrations in{" "}
                  <span className="font-semibold text-gray-800">{activeWorkspace.name}</span>.
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-ovra-orange hover:bg-ovra-orange-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Credential
              </button>
            </div>

            {/* Security Notice Banner */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/60 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-ovra-orange shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 block">
                  Hardware Security Module (HSM) & KMS Encryption
                </span>
                <span className="text-gray-600 block mt-0.5">
                  All tokens are envelope-encrypted using AES-256-GCM. Plaintext secrets are never logged or exposed in client responses.
                </span>
              </div>
            </div>

            {/* Credentials Grid */}
            {credentials.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900">No credentials configured</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Add API keys for OpenAI, Razorpay, WhatsApp, or Slack to authorize workflow nodes.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-ovra-orange text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-ovra-orange-dark transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Connect First Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="bg-white rounded-2xl border border-ovra-border/70 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-800">
                            {getIntegrationIcon(cred.integrationType)}
                          </span>
                          <div>
                            <h3 className="text-xs font-bold text-gray-950">
                              {cred.name}
                            </h3>
                            <span className="text-[10px] text-gray-400 font-mono capitalize">
                              {cred.integrationType}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            cred.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      </div>

                      {/* Masked Secret Key */}
                      <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200/70 font-mono text-[11px] text-gray-700 flex items-center justify-between">
                        <span>{cred.maskedKey}</span>
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-400">
                        Tested: {cred.lastTestedAt || "Never"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestConnection(cred.id)}
                          disabled={testingId === cred.id}
                          className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-[11px] font-semibold text-gray-800 flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <RotateCw
                            className={`w-3 h-3 ${
                              testingId === cred.id ? "animate-spin text-ovra-orange" : ""
                            }`}
                          />
                          <span>{testingId === cred.id ? "Testing..." : "Test Connection"}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(cred.id, cred.name)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Credential Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-ovra-orange mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-950">Add Integration Credential</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Save an API key securely into your workspace vault.
              </p>
            </div>

            <form onSubmit={handleAddCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service / Provider
                </label>
                <select
                  value={integrationType}
                  onChange={(e) => setIntegrationType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                >
                  <option value="gemini">Google Gemini AI</option>
                  <option value="openai">OpenAI (GPT-4o / Codex)</option>
                  <option value="razorpay">Razorpay Payment Gateway</option>
                  <option value="whatsapp">WhatsApp Cloud API (Meta)</option>
                  <option value="slack">Slack Bot OAuth Token</option>
                  <option value="postgres">PostgreSQL Connection String</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Credential Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Razorpay API Key"
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Secret Key / Token
                </label>
                <input
                  type="password"
                  required
                  placeholder="Paste raw API key or token..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-ovra-orange hover:bg-ovra-orange-dark text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getIntegrationIcon(type: string) {
  if (type === "gemini") return <Sparkles className="w-4 h-4 text-purple-600" />;
  if (type === "openai") return <Sparkles className="w-4 h-4 text-emerald-600" />;
  if (type === "razorpay") return <CreditCard className="w-4 h-4 text-blue-600" />;
  if (type === "whatsapp") return <Phone className="w-4 h-4 text-emerald-500" />;
  if (type === "slack") return <MessageSquare className="w-4 h-4 text-[#4A154B]" />;
  return <Database className="w-4 h-4 text-gray-600" />;
}
