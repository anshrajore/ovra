"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  ArrowLeft,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  env: "live" | "test";
  createdAt: string;
  lastUsed: string;
  scopes: string[];
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: "key_1",
      name: "Production Webhook Dispatcher",
      prefix: "ovra_live_83fa...e12a",
      env: "live",
      createdAt: "2026-10-28",
      lastUsed: "Just now",
      scopes: ["workflows:read", "executions:trigger"],
    },
    {
      id: "key_2",
      name: "CI/CD Test Runner",
      prefix: "ovra_test_419c...8bb0",
      env: "test",
      createdAt: "2026-11-01",
      lastUsed: "2 hours ago",
      scopes: ["workflows:read", "workflows:write", "executions:trigger"],
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"live" | "test">("live");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "workflows:read",
    "executions:trigger",
  ]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availableScopes = [
    { id: "workflows:read", label: "workflows:read", desc: "View workflows and version history" },
    { id: "workflows:write", label: "workflows:write", desc: "Create and update workflow DAGs" },
    { id: "executions:trigger", label: "executions:trigger", desc: "Start new workflow executions" },
    { id: "executions:read", label: "executions:read", desc: "Query execution status and telemetry" },
    { id: "credentials:read", label: "credentials:read", desc: "Read non-secret vault metadata" },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomSuffix = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const generatedKey = `ovra_${newKeyEnv}_${randomSuffix}`;

    const newKeyItem: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `ovra_${newKeyEnv}_${randomSuffix.slice(0, 4)}...${randomSuffix.slice(-4)}`,
      env: newKeyEnv,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      scopes: selectedScopes,
    };

    setKeys([newKeyItem, ...keys]);
    setCreatedSecret(generatedKey);
    setNewKeyName("");
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#2342FF] mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Developer Hub</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-[#2342FF]" />
              <span>API Keys & Access Tokens</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Secret API keys allow your backend servers to trigger workflows and query execution telemetry securely.
            </p>
          </div>

          <button
            onClick={() => {
              setCreatedSecret(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#2342FF] hover:bg-[#1A35DB] text-white font-bold text-xs shadow-lg shadow-[#2342FF]/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>

        {/* Secret Banner if newly created */}
        {createdSecret && (
          <div className="p-5 rounded-2xl bg-[#2342FF]/10 border border-[#2342FF]/30 text-blue-200 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <CheckCircle2 className="w-5 h-5 text-[#2342FF]" />
                <span>API Key Generated Successfully</span>
              </div>
              <button
                onClick={() => setCreatedSecret(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed">
              Please copy your secret key right now. For security reasons, you will not be able to view this key again.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/60 border border-[#2342FF]/30 font-mono text-xs text-white">
              <span className="flex-1 truncate">{createdSecret}</span>
              <button
                onClick={() => copyToClipboard(createdSecret)}
                className="px-3 py-1 rounded-lg bg-[#2342FF] hover:bg-[#1A35DB] text-white font-bold flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Keys Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Name & Prefix</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Scopes</th>
                <th className="py-3 px-4">Last Used</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{k.name}</div>
                    <div className="font-mono text-[11px] text-gray-400 mt-0.5">{k.prefix}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        k.env === "live"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {k.env}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{k.lastUsed}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-400">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            API Keys have full programmatic access within their assigned scopes. Never commit keys to version control or expose them in client-side code.
          </span>
        </div>
      </div>

      {/* Create Key Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15171C] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">Generate Secret API Key</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Key Name / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Production Dispatcher"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv("live")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newKeyEnv === "live"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    Live Environment
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv("test")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newKeyEnv === "test"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    Test Sandbox
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Permitted Scopes
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <label
                        key={scope.id}
                        className="flex items-start gap-2.5 p-2 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:border-white/10"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope.id]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                            }
                          }}
                          className="mt-0.5 rounded border-white/20 bg-[#0E0F12] text-amber-500 focus:ring-amber-400"
                        />
                        <div>
                          <div className="font-mono text-[11px] text-amber-300 font-semibold">
                            {scope.label}
                          </div>
                          <div className="text-[10px] text-gray-400">{scope.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
