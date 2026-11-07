"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  Database,
  ArrowRight,
  Play,
  Layers,
  Sliders,
  Send,
  Loader2,
  FileText,
  Plus,
  CheckCircle2,
  Brain,
  Shield,
  Zap,
} from "lucide-react";

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<"workbench" | "arena" | "rag">("workbench");

  // Workbench state
  const [model, setModel] = useState("gemini-2.5-flash");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an expert enterprise automation and incident triaging intelligence agent. Analyze system telemetry, calculate risk scores, and orchestrate automated remediations."
  );
  const [userPrompt, setUserPrompt] = useState(
    "Production cluster incident #INC-9482: Latency spike to 1,420ms on Stripe Webhook Consumer, error rate 4.8%, database pool at 96% saturation. Classify severity and recommend remediation."
  );
  const [temperature, setTemperature] = useState(0.2);
  const [workbenchLoading, setWorkbenchLoading] = useState(false);
  const [workbenchOutput, setWorkbenchOutput] = useState<string | null>(null);

  // Arena state
  const [arenaLoading, setArenaLoading] = useState(false);
  const [arenaOutputs, setArenaOutputs] = useState<{
    gemini?: { text: string; latency: number; tokens: number };
    claude?: { text: string; latency: number; tokens: number };
    gpt?: { text: string; latency: number; tokens: number };
  } | null>(null);

  // RAG state
  const [knowledgeSources, setKnowledgeSources] = useState([
    { id: "src_1", name: "Enterprise_SLA_and_Security_Protocols_2026.pdf", chunks: 142, status: "Indexed (pgvector)", size: "2.4 MB" },
    { id: "src_2", name: "SOC2_Compliance_and_Incident_Playbook.md", chunks: 38, status: "Indexed (pgvector)", size: "480 KB" },
    { id: "src_3", name: "Stripe_and_Billing_Architecture_Guide.json", chunks: 215, status: "Indexed (pgvector)", size: "4.1 MB" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);

  const handleTestWorkbench = () => {
    setWorkbenchLoading(true);
    setWorkbenchOutput(null);

    setTimeout(() => {
      setWorkbenchOutput(
        JSON.stringify(
          {
            priority: "P1_CRITICAL_INCIDENT",
            riskScore: 0.92,
            incidentAssessment: "Connection pool exhaustion causing webhook backpressure and latency degradation across payment queues.",
            immediateActions: [
              "Trigger auto-scaler node to add 4 replica pods.",
              "Temporarily divert non-critical batch jobs to Dead Letter Queue.",
              "Notify on-call platform engineers via Slack (#incidents-war-room).",
              "Lease ephemeral read-replica connection pool."
            ],
            traceMetadata: {
              model: model,
              latencyMs: 180,
              inputTokens: 78,
              outputTokens: 92,
              estimatedCostUSD: "$0.0002",
            },
          },
          null,
          2
        )
      );
      setWorkbenchLoading(false);
    }, 600);
  };

  const handleRunArena = () => {
    setArenaLoading(true);
    setArenaOutputs(null);

    setTimeout(() => {
      setArenaOutputs({
        gemini: {
          text: "P1 Incident. Database saturation >95% threatens webhook drop. Scale replicas and divert async jobs immediately.",
          latency: 180,
          tokens: 44,
        },
        claude: {
          text: "Critical Priority: Connection starvation on payment ingestion pipeline. Execute auto-scaling and throttle non-essential cron queries.",
          latency: 290,
          tokens: 52,
        },
        gpt: {
          text: "Severity 1: Connection pool bottleneck. Activate read replicas, isolate batch consumers, and alert primary SRE responder.",
          latency: 260,
          tokens: 46,
        },
      });
      setArenaLoading(false);
    }, 750);
  };

  const handleSearchRag = () => {
    if (!searchQuery.trim()) return;
    setSearchResults([
      "[Chunk #42 - Cosine: 0.892] Protocol 4.2: In high-concurrency payment outages where webhook lag exceeds 500ms, enable idempotent replay buffer.",
      "[Chunk #18 - Cosine: 0.841] Protocol 2.1: Database Connection Saturation: Auto-divert background batch tasks to dead-letter queue when active pool exceeds 90%.",
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all border border-white/10"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Back to Studio Canvas</span>
          </Link>
          <span className="text-white/30 text-xs">/</span>
          <span className="text-xs font-mono text-white/50">AI Studio</span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2342FF] font-bold uppercase tracking-wider mb-2">
              <Brain className="w-4 h-4 text-[#2342FF]" />
              <span>Multi-Model AI Infrastructure</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              OVRA AI Studio
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Multi-model prompt engineering, side-by-side LLM battle arena, and pgvector RAG knowledge indexing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-[#2342FF] hover:bg-[#1A35DB] text-white font-bold text-xs shadow-lg shadow-[#2342FF]/30 flex items-center gap-1.5 transition-all"
            >
              <span>Attach to Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 max-w-md">
          <button
            onClick={() => setActiveTab("workbench")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "workbench"
                ? "bg-[#2342FF] text-white shadow-md shadow-[#2342FF]/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Workbench</span>
          </button>
          <button
            onClick={() => setActiveTab("arena")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "arena"
                ? "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Model Arena</span>
          </button>
          <button
            onClick={() => setActiveTab("rag")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "rag"
                ? "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>pgvector RAG</span>
          </button>
        </div>

        {/* TAB 1: WORKBENCH */}
        {activeTab === "workbench" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Config Panel (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Foundation Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                >
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra-fast, lowest cost)</option>
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep complex reasoning)</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">System Prompt / Agent Persona</label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-200 outline-none focus:border-amber-400 leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">User Prompt / Dynamic Payload</label>
                <textarea
                  rows={4}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-200 outline-none focus:border-amber-400 leading-relaxed font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTestWorkbench}
                  disabled={workbenchLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {workbenchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Execute Agent Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Output Panel (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Synthesized Agent Output</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">JSON Schema Enforced</span>
                </div>

                <div className="p-4 rounded-xl bg-black/70 border border-white/5 font-mono text-xs min-h-[300px] overflow-auto">
                  {workbenchLoading ? (
                    <div className="flex items-center justify-center h-48 text-gray-500 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                      <span>Calling AI Gateway...</span>
                    </div>
                  ) : workbenchOutput ? (
                    <pre className="text-amber-300 whitespace-pre-wrap">{workbenchOutput}</pre>
                  ) : (
                    <div className="text-gray-600 italic">Click &quot;Execute Agent Prompt&quot; to test model response...</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Human-in-the-loop approval policy: Inactive (Auto-proceed)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARENA */}
        {activeTab === "arena" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Side-by-Side Model Evaluation</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Benchmark output latency, tokens, and response quality across leading LLM providers.</p>
                </div>
                <button
                  onClick={handleRunArena}
                  disabled={arenaLoading}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {arenaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                  <span>{arenaLoading ? "Evaluating..." : "Run Multi-Model Arena"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Gemini Card */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-amber-400">Google Gemini 2.5 Pro</span>
                      {arenaOutputs?.gemini && (
                        <span className="text-[10px] font-mono text-emerald-400">{arenaOutputs.gemini.latency}ms</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed min-h-[90px]">
                      {arenaOutputs?.gemini?.text || "Awaiting evaluation run..."}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-500 font-mono">Tokens: {arenaOutputs?.gemini?.tokens || 0}</div>
                </div>

                {/* Claude Card */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-purple-400">Claude 3.5 Sonnet</span>
                      {arenaOutputs?.claude && (
                        <span className="text-[10px] font-mono text-emerald-400">{arenaOutputs.claude.latency}ms</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed min-h-[90px]">
                      {arenaOutputs?.claude?.text || "Awaiting evaluation run..."}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-500 font-mono">Tokens: {arenaOutputs?.claude?.tokens || 0}</div>
                </div>

                {/* GPT Card */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-400">OpenAI GPT-4o</span>
                      {arenaOutputs?.gpt && (
                        <span className="text-[10px] font-mono text-emerald-400">{arenaOutputs.gpt.latency}ms</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed min-h-[90px]">
                      {arenaOutputs?.gpt?.text || "Awaiting evaluation run..."}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-500 font-mono">Tokens: {arenaOutputs?.gpt?.tokens || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RAG */}
        {activeTab === "rag" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">pgvector Knowledge Base Sources</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Vector embeddings are computed via Supabase pgvector cosine distance indices.</p>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Knowledge Source</span>
                </button>
              </div>

              {/* Source List */}
              <div className="space-y-2">
                {knowledgeSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold text-xs text-white">{src.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                          {src.chunks} chunks • {src.size}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {src.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Similarity Query Tester */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="text-xs font-bold text-white">Semantic Similarity Search Tester</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. What is the emergency escalation rule for SpO2 below 90%?"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSearchRag}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
                  >
                    Query Vectors
                  </button>
                </div>

                {searchResults && (
                  <div className="space-y-2 pt-2">
                    {searchResults.map((res, i) => (
                      <div key={i} className="p-3 rounded-lg bg-black/40 border border-amber-400/20 text-xs text-amber-200/90 leading-relaxed font-mono">
                        {res}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
