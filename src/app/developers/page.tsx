import Link from "next/link";
import {
  Code2,
  Terminal,
  KeyRound,
  Webhook,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Copy,
  Layers,
} from "lucide-react";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
              <Terminal className="w-4 h-4" />
              <span>OVRA Developer Platform</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              API Reference & Developer Hub
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Programmatically orchestrate DAGs, trigger node executions, inspect telemetry, and integrate custom microservice connectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/developers/api-playground"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>API Playground</span>
            </Link>
            <Link
              href="/developers/api-keys"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>API Keys</span>
            </Link>
            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs flex items-center gap-1 transition-all"
            >
              <span>Back to Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/developers/api-keys"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              API Keys & Scopes
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Provision scoped tokens (`ovra_live_...`, `ovra_test_...`) with fine-grained RBAC controls and automated key rotation.
            </p>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <span>Manage API Keys</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/developers/api-playground"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              Interactive API Playground
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Send live requests to `/api/v1/nodes`, `/api/v1/nodes/test`, and `/api/v1/executions` with instant JSON response inspection.
            </p>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <span>Launch Playground</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/developers/webhooks"
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Webhook className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
              Inbound Webhooks & HMAC
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Trigger DAG workflows with verified HTTP payloads using HMAC-SHA256 signatures and anti-replay timestamps.
            </p>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <span>Configure Webhooks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Quickstart Code Example */}
        <div className="p-6 rounded-2xl bg-[#121418] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Trigger Workflow Execution (cURL Quickstart)</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Endpoint: POST /api/v1/executions</span>
          </div>

          <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed">
{`curl -X POST https://ovra.io/api/v1/executions \\
  -H "Authorization: Bearer ovra_live_948f21ba99d28e71" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "wf_sanjeevanix_alert_01",
    "inputs": {
      "patientId": "P-9021",
      "heartRate": 142,
      "systolicBP": 178,
      "oxygenSaturation": 89
    }
  }'`}
          </pre>
        </div>

        {/* Architecture & Core Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Trust Security & Rate Limits</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every request is authenticated against workspace-scoped tokens and validated against PostgreSQL Row-Level Security. Default rate limits: 10,000 requests/minute per enterprise workspace.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Durable DAG Queue Scheduling</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Workflow executions are managed by an asynchronous task scheduler. Upstream node outputs are passed immutably into downstream dependencies, with payload offloading for outputs &gt;64 KiB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
