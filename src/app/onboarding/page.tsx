"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  Cpu,
  Layers,
  Shield,
  Zap,
  Globe,
  Database,
  Workflow,
  Play,
  CheckCircle2,
  KeyRound,
  ExternalLink,
} from "lucide-react";

interface OnboardingData {
  role: string;
  primaryGoal: string;
  workspaceName: string;
  workspaceSlug: string;
  region: string;
  templateId: string;
  credentialType: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [testRunStatus, setTestRunStatus] = useState<"idle" | "running" | "success">("idle");
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const [formData, setFormData] = useState<OnboardingData>({
    role: "developer",
    primaryGoal: "ai_orchestration",
    workspaceName: "My Workspace",
    workspaceSlug: "my-workspace",
    region: "ap-south-1",
    templateId: "enterprise_churn_alert",
    credentialType: "none",
  });

  const roles = [
    {
      id: "developer",
      title: "Backend / Platform Engineer",
      desc: "Building custom integrations, REST connectors, and mission-critical DAGs",
      icon: Code2,
    },
    {
      id: "ai_engineer",
      title: "AI / LLM Engineer",
      desc: "Orchestrating agent swarms, vector RAG pipelines, and prompt chains",
      icon: Cpu,
    },
    {
      id: "product_builder",
      title: "Product Builder / Ops",
      desc: "Automating internal workflows, CRM syncs, and operational alerts",
      icon: Layers,
    },
    {
      id: "enterprise",
      title: "Enterprise Architect",
      desc: "Governing security policies, audit trails, and multi-tenant isolation",
      icon: Shield,
    },
  ];

  const goals = [
    {
      id: "ai_orchestration",
      title: "Multi-Model AI Orchestration",
      desc: "Chain Gemini 2.5, Claude, and GPT-4o with dynamic context and human gates",
      badge: "Popular",
    },
    {
      id: "webhook_sync",
      title: "Inbound Webhooks & Data Pipelines",
      desc: "Listen for real-time events, transform payloads, and write to PostgreSQL",
      badge: "Fast Setup",
    },
    {
      id: "realtime_alerting",
      title: "Incident Alerting & SLA Escalation",
      desc: "Trigger high-priority alerts across Slack, WhatsApp, and transactional email",
      badge: "Ops Ready",
    },
    {
      id: "custom_connectors",
      title: "Custom OpenAPI & REST Connectors",
      desc: "Import Swagger schemas and build self-hosted private microservice nodes",
      badge: "Extensible",
    },
  ];

  const templates = [
    {
      id: "enterprise_churn_alert",
      name: "Enterprise Customer Churn AI Intervention",
      desc: "Ingests product telemetry & usage decline, executes AI churn probability scoring, and routes high-priority customer alerts via Slack and CRM.",
      nodesCount: 5,
    },
    {
      id: "ai_research_agent",
      name: "Autonomous AI Research & Synthesis",
      desc: "Queries external APIs, synthesizes results with Gemini 2.5 Pro, and stores citations in PostgreSQL knowledge base.",
      nodesCount: 6,
    },
    {
      id: "webhook_to_sheets",
      name: "High-Volume Webhook to Google Sheets",
      desc: "Buffered queue runner verifying HMAC signatures, pruning duplicates, and batch-appending rows.",
      nodesCount: 4,
    },
  ];

  const handleRunTest = () => {
    setTestRunStatus("running");
    setTestLogs(["[00:00.012] Initializing DAG execution context..."]);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        "[00:00.045] Node 1 (core.webhook): Inbound event verified with HMAC-SHA256 signature.",
      ]);
    }, 400);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        "[00:00.120] Node 2 (ai.model): Gemini 2.5 Flash executed. Risk score calculated: 0.88 (Critical).",
      ]);
    }, 900);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        "[00:00.210] Node 3 (logic.if): Expression {{outputs.riskScore > 0.8}} evaluated TRUE. Branching to alert channel.",
      ]);
    }, 1400);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        "[00:00.280] Node 4 (comm.slack): Telemetry alert dispatched to #critical-ops with trace ID ovra_tr_8392.",
        "[00:00.285] Execution completed successfully in 285ms. Status: COMPLETED.",
      ]);
      setTestRunStatus("success");
    }, 1800);
  };

  const handleFinish = () => {
    router.push("/studio");
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-black font-black">
            O
          </div>
          <span className="font-bold text-lg tracking-tight">OVRA Onboarding</span>
        </Link>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Step {currentStep} of 8</span>
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
          <button
            onClick={() => router.push("/studio")}
            className="text-gray-400 hover:text-white underline underline-offset-4"
          >
            Skip to Canvas
          </button>
        </div>
      </div>

      {/* Main Step Content */}
      <div className="max-w-3xl mx-auto w-full my-8">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome to OVRA
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
              India&apos;s sovereign workflow automation and AI orchestration engine.
              Let&apos;s configure your workspace, select your initial blueprint, and test your first node execution in under 2 minutes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-amber-400 font-bold text-sm mb-1">Decoupled Node Engine</div>
                <div className="text-xs text-gray-400">Pure schema contracts with zero eval execution and isolated worker runtimes.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-amber-400 font-bold text-sm mb-1">PostgreSQL RLS</div>
                <div className="text-xs text-gray-400">Tenant-isolated storage with AES-256-GCM envelope credential encryption.</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-amber-400 font-bold text-sm mb-1">Durable Queues</div>
                <div className="text-xs text-gray-400">High-throughput DAG task dispatching with automatic failure retries.</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Role */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What is your primary engineering focus?</h2>
              <p className="text-xs text-gray-400 mt-1">This tailors your default templates, node recommendations, and developer quickstarts.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-amber-400" : "text-gray-400"}`} />
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="font-bold text-sm text-white mb-1">{r.title}</div>
                    <div className="text-xs text-gray-400">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Goal */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">What are you looking to build first?</h2>
              <p className="text-xs text-gray-400 mt-1">Select the primary use case to pre-configure your studio canvas.</p>
            </div>
            <div className="space-y-3">
              {goals.map((g) => {
                const isSelected = formData.primaryGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryGoal: g.id })}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{g.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                          {g.badge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">{g.desc}</div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-amber-400 shrink-0 ml-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Workspace */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Setup your primary Workspace</h2>
              <p className="text-xs text-gray-400 mt-1">Workspaces provide cryptographic isolation for credentials, execution logs, and team members.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={formData.workspaceName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                    setFormData({ ...formData, workspaceName: name, workspaceSlug: slug });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Workspace Slug & URL</label>
                <div className="flex items-center rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 text-xs text-gray-400">
                  <span>ovra.io/w/</span>
                  <input
                    type="text"
                    value={formData.workspaceSlug}
                    onChange={(e) => setFormData({ ...formData, workspaceSlug: e.target.value })}
                    className="bg-transparent text-white outline-none ml-1 flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Primary Execution Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
                >
                  <option value="ap-south-1">Asia Pacific (Mumbai, India) — Ultra-Low Latency</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="eu-central-1">Europe (Frankfurt)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Template */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Select your starting template</h2>
              <p className="text-xs text-gray-400 mt-1">Pre-configured DAG workflows with foundation nodes and type-checked inputs.</p>
            </div>
            <div className="space-y-3">
              {templates.map((tpl) => {
                const isSelected = formData.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, templateId: tpl.id })}
                    className={`w-full p-5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{tpl.name}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">
                        {tpl.nodesCount} nodes
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{tpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Credential Vault */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Connect your first Credential (Optional)</h2>
              <p className="text-xs text-gray-400 mt-1">Secrets are encrypted using AES-256-GCM envelope encryption and never logged in plain text.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "google", name: "Google Sheets / Drive", type: "OAuth2", desc: "Automate spreadsheets and drive docs" },
                { id: "slack", name: "Slack Bot Token", type: "Bearer Token", desc: "Send interactive messages and alert notifications" },
                { id: "gemini", name: "Google Gemini 2.5 API Key", type: "API Key", desc: "Power LLM synthesis and classification nodes" },
                { id: "none", name: "I will add credentials later", type: "Skip", desc: "Proceed with local simulator and mock payloads" },
              ].map((c) => {
                const isSelected = formData.credentialType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, credentialType: c.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 text-white shadow-sm"
                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{c.name}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">{c.type}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">{c.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 7: Guided Test Run */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Run your first live DAG test</h2>
              <p className="text-xs text-gray-400 mt-1">Simulate queue scheduling, node input validation, and step output capture in real-time.</p>
            </div>

            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-300 font-semibold">OVRA Execution Engine Simulator</span>
                </div>
                <button
                  onClick={handleRunTest}
                  disabled={testRunStatus === "running"}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{testRunStatus === "running" ? "Running..." : "Trigger DAG Test"}</span>
                </button>
              </div>

              <div className="min-h-[140px] space-y-1.5 text-gray-400 max-h-48 overflow-y-auto">
                {testLogs.length === 0 ? (
                  <div className="text-gray-600 italic">Click &quot;Trigger DAG Test&quot; to execute the workflow pipeline...</div>
                ) : (
                  testLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes("COMPLETED")
                          ? "text-emerald-400 font-bold"
                          : log.includes("Critical")
                          ? "text-amber-300"
                          : "text-gray-300"
                      }
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Ready / Completion */}
        {currentStep === 8 && (
          <div className="text-center py-8 space-y-6">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black">Workspace Configured & Ready!</h2>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Your workspace <span className="text-amber-400 font-bold">{formData.workspaceName}</span> has been provisioned with tenant RLS isolation and the starter template.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>Open Workflow Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/developers"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <span>View Developer Portal</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-6 border-t border-white/10">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {currentStep < 8 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-bold transition-all"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
