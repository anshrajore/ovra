import Link from "next/link";
import { LandingNavbar } from "@/components/landing/Navbar";
import { Hero3DVisual } from "@/components/landing/Hero3DVisual";
import {
  Zap,
  Layers,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Play,
  ShieldCheck,
  Cpu,
  Database,
  Terminal,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Code2,
  Send,
  Sliders,
  Clock,
  ExternalLink,
  Shield,
  HelpCircle,
  FileCheck,
  Lock,
  Workflow,
  FlaskConical,
  KeyRound,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-[#FAF7F2] text-gray-950 flex flex-col overflow-x-hidden selection:bg-amber-100 selection:text-amber-950">
      {/* Hero Section */}
      <section className="w-full bg-[#FAF5EE] border-b border-black/5 flex flex-col justify-between">
          {/* Top Navigation */}
          <LandingNavbar />

          {/* Hero Section */}
          <div className="px-6 sm:px-10 md:px-14 lg:px-20 py-8 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-3 sm:mb-4">
                Decoupled Node Automation & AI Orchestration
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight text-gray-950 leading-[1.05] mb-5">
                Build, Automate and Scale with OVRA
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl font-normal leading-relaxed mb-8">
                The open workflow automation and AI orchestration platform to connect your tools,
                build intelligent workflows, and run automations at enterprise scale.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="/auth/register"
                  className="px-7 py-3.5 bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm md:text-base rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/studio"
                  className="px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm md:text-base rounded-full shadow-sm transition-all flex items-center gap-2"
                >
                  Launch Studio Canvas
                  <Play className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                </Link>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-200/80">
                <div className="flex flex-col gap-1.5">
                  <Zap className="w-4 h-4 text-gray-900" />
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Durable DAGs
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Layers className="w-4 h-4 text-gray-900" />
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    500+ Connectors
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Sparkles className="w-4 h-4 text-gray-900" />
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Multi-Model AI
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <BarChart3 className="w-4 h-4 text-gray-900" />
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Tenant RLS Isolation
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visual 3D Showcase */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <Hero3DVisual />
            </div>
          </div>

          {/* Bottom Shelf */}
          <div className="bg-[#121316] text-white px-6 sm:px-10 md:px-14 lg:px-20 py-4 md:py-5 flex flex-wrap items-center justify-between gap-6 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 md:gap-16">
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  36
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Supabase Tables
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  15
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Foundation Nodes
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  AES-256
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Envelope Encryption
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  99.9%
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Target Availability
                </div>
              </div>
            </div>

            <Link
              href="/testlab"
              className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-105 group-hover:border-white transition-all">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Explore TestLab Simulator</span>
            </Link>
          </div>
        </section>

      {/* =========================================================================
          SECTION 1: THE ARCHITECTURE SHIFT (Full Width, Continuous Flow)
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
              The Architecture Shift
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              Why Traditional Automation Platforms Break
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Legacy tools rely on arbitrary in-memory execution, untyped JavaScript evals, and unencrypted credentials. OVRA establishes an enterprise-grade sovereign execution standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Legacy Box */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-rose-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <XCircle className="w-4 h-4" />
                  <span>Legacy Automation Tools</span>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold">
                  Fragile Runtime
                </span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Arbitrary Code Evaluation:</strong> Runs unconstrained `eval()` risking server crashes and SSRF vulnerabilities.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Hardcoded Connectors:</strong> Adding new endpoints requires modifying frontend source code.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Plaintext API Secrets:</strong> Tokens stored in plain database columns or logged into telemetry outputs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Payload Overflow Aborts:</strong> Step outputs &gt;50 KiB exhaust worker memory and fail executions.</span>
                </li>
              </ul>
            </div>

            {/* OVRA Box */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-300/80 shadow-2xs space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-2.5 text-ovra-orange font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>The OVRA Engine Standard</span>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                  Sovereign Execution
                </span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-gray-600 relative">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-ovra-orange mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Zero Arbitrary Eval:</strong> Pure JSON Schema input/output contracts with sandboxed AST expression evaluation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-ovra-orange mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Decoupled Versioned Registry:</strong> 15 foundation nodes and dynamic OpenAPI 3.0 import without touching source code.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-ovra-orange mt-2 shrink-0" />
                  <span><strong className="text-gray-900">AES-256-GCM Envelope Encryption:</strong> Scoped credential leasing with time-limited tokens and zero plaintext logging.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-ovra-orange mt-2 shrink-0" />
                  <span><strong className="text-gray-900">Supabase Storage Offload:</strong> Automatic chunk offloading for outputs &gt;64 KiB with signed URL references.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EXECUTION LIFECYCLE (4-Step Sequential Pipeline)
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
              Execution Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              How OVRA Powers Complex Workflows
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
              From inbound event reception to AI classification, transactional side-effects, and audit trail logging.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center font-black text-base">
                  01
                </div>
                <h3 className="font-bold text-base text-gray-950">Trigger & Ingest</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Receive events via HMAC-verified webhooks, cron intervals, or manual user requests with automated anti-replay protection.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-ovra-orange">
                <Zap className="w-4 h-4" />
                <span>HMAC Ingestion</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center font-black text-base">
                  02
                </div>
                <h3 className="font-bold text-base text-gray-950">Route & Reason</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Evaluate deterministic boolean logic, branch conditions, or pass context to Gemini 2.5 Flash for real-time AI reasoning.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-ovra-orange">
                <Sparkles className="w-4 h-4" />
                <span>AI Multi-Model</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center font-black text-base">
                  03
                </div>
                <h3 className="font-bold text-base text-gray-950">Act & Dispatch</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Execute external side effects with leased credentials across PostgreSQL, Google Sheets, Slack, and custom microservices.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-ovra-orange">
                <Send className="w-4 h-4" />
                <span>Leased Vault Exec</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center font-black text-base">
                  04
                </div>
                <h3 className="font-bold text-base text-gray-950">Observe & Audit</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Stream real-time monotonic sequence telemetry to the studio canvas and record permanent immutable audit log records.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-ovra-orange">
                <ShieldCheck className="w-4 h-4" />
                <span>Audit Telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: IN-CANVAS API STUDIO
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
              Developer Ergonomics
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              In-Canvas API Studio: No Separate Playgrounds Needed
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              API testing belongs directly inside the visual canvas. Configure requests, authenticate with leased credentials, execute live tests, and infer output schemas without switching tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-950">6-Stage Inspector Engine</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Configure (Method, URL, Headers), Authentication (Bearer, API Key, Basic), Mapping (AST expression picker), Test, Response, and Advanced timeout/retry rules.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-950">Automatic Schema Inference</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                One-click schema inference parses real API response keys into typed JSON Schema v7 contracts so downstream nodes can immediately map payload properties.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/70 text-ovra-orange flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-950">SSRF Defense & Safe Sandboxing</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Automatic blocking of loopback addresses (`127.0.0.1`), AWS metadata (`169.254.169.254`), and private subnets (`10.0.0.0/8`, `192.168.0.0/16`) on every redirect.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/studio"
              className="px-7 py-3.5 bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2.5"
            >
              <span>Launch Studio Canvas</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
            <Link
              href="/developers"
              className="px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm rounded-full shadow-2xs transition-all flex items-center gap-2"
            >
              <span>Developer Docs</span>
              <ArrowUpRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: MULTI-MODEL AI ORCHESTRATOR
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
              AI Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              AI as an Assistant, Not an Unbounded Black Box
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Orchestrate Google Gemini 2.5 Pro, Claude 3.5 Sonnet, and GPT-4o side-by-side with human approval gates, pgvector knowledge retrieval, and token budgeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <span className="text-ovra-orange font-bold text-xs uppercase font-mono tracking-wider">Google Gemini 2.5</span>
              <h4 className="text-lg font-bold text-gray-950">Ultra-Low Latency & Reasoning</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Sub-250ms latency for emergency triage, vital sign classification, and high-frequency webhook data categorization.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <span className="text-purple-600 font-bold text-xs uppercase font-mono tracking-wider">Claude 3.5 Sonnet</span>
              <h4 className="text-lg font-bold text-gray-950">Deep Context & Policy Synthesis</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Complex clinical protocol compliance, regulatory contract synthesis, and complex multi-page document reasoning.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-4">
              <span className="text-emerald-600 font-bold text-xs uppercase font-mono tracking-wider">pgvector RAG</span>
              <h4 className="text-lg font-bold text-gray-950">Sovereign Knowledge Indexing</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Ingest internal PDF/Markdown SOPs, chunk them, and execute semantic similarity vector search directly inside Supabase PostgreSQL.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/ai-studio"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-ovra-orange hover:bg-ovra-orange-dark text-white font-semibold text-sm shadow-sm transition-all"
            >
              <span>Explore AI Studio Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OPERATIONAL RELIABILITY & TESTLAB
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 md:p-14 rounded-3xl bg-white border border-black/5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Chaos Simulation Suite</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
                TestLab: Stress Testing & Failure Injection
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                TestLab lets you inspect per-node execution durations, verify dead-letter queue behavior on timeouts, and confirm payload offloading for outputs exceeding 64 KiB before production deployment.
              </p>
            </div>

            <Link
              href="/testlab"
              className="px-8 py-4 rounded-full bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm flex items-center gap-2.5 shadow-md transition-all shrink-0"
            >
              <span>Launch TestLab Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DEVELOPER HUB & DOCUMENTATION
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF5EE]">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 md:p-14 rounded-3xl bg-white border border-black/5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Engineered for Developers</span>
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
                Developer Docs, Scoped API Keys & Webhook HMAC
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Trigger workflows via REST, import OpenAPI 3.0 specs, provision scoped tokens, and secure inbound events with HMAC-SHA256 signatures.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto shrink-0">
              <Link
                href="/developers"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Developer Docs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/developers/api-keys"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <span>Provision API Keys</span>
                <KeyRound className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TRANSPARENT TECHNICAL FAQ
         ========================================================================= */}
      <section className="w-full py-20 md:py-28 px-6 sm:px-10 lg:px-16 border-b border-black/5 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-ovra-orange font-bold text-[11px] uppercase tracking-wider">
              Transparent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Honest technical answers about the OVRA platform and runtime architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-950 text-base">Where does API testing live in OVRA?</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                API testing lives directly inside the visual canvas inspector for HTTP/API nodes. You can configure methods, headers, and request bodies, authenticate with leased vault credentials, execute test requests, and automatically infer output schemas without leaving the workflow graph.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-950 text-base">How does tenant isolation work with Supabase PostgreSQL?</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                All 36 core tables implement PostgreSQL Row-Level Security (RLS). Database queries set session context via `ovra.workspace_id` ensuring a query executed by Workspace A can never read, modify, or leak data belonging to Workspace B.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-950 text-base">What happens if a node output payload exceeds 64 KiB?</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                The OVRA Storage Provider automatically uploads oversized JSON or binary payloads to private Supabase Storage buckets and replaces the step output with a storage pointer reference (`storage://...`). Downstream nodes read this reference seamlessly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-2xs space-y-3">
              <h4 className="font-bold text-gray-950 text-base">What is the execution limit on the current Vercel-first stage?</h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                During the current Vercel-first stage, tasks are dispatched through Supabase Queues with bounded execution limits (15-second per-step timeout). A dedicated Temporal-backed worker fleet is the planned production gate for long-running jobs and high-concurrency event streams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GLOBAL FOOTER (Full Width Dark Shelf)
         ========================================================================= */}
      <footer className="w-full bg-[#121316] text-white py-16 px-6 sm:px-10 lg:px-16 border-t border-black/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-ovra-orange flex items-center justify-center font-black text-white text-xs shadow-sm">
                  O
                </div>
                <span className="font-bold text-white text-base tracking-tight">OVRA Automation</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                India&apos;s sovereign workflow automation and AI orchestration platform.
              </p>
              <div className="text-gray-500 text-xs">
                Built with pride by Ansh Rajore.
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Product</div>
              <ul className="space-y-2 text-gray-400 text-xs">
                <li><Link href="/studio" className="hover:text-white transition-colors">Studio Canvas</Link></li>
                <li><Link href="/workflows" className="hover:text-white transition-colors">Workflows</Link></li>
                <li><Link href="/executions" className="hover:text-white transition-colors">Execution Telemetry</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates Marketplace</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations Catalog</Link></li>
                <li><Link href="/credentials" className="hover:text-white transition-colors">Credential Vault</Link></li>
              </ul>
            </div>

            {/* Engineering */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Engineering</div>
              <ul className="space-y-2 text-gray-400 text-xs">
                <li><Link href="/ai-studio" className="hover:text-white transition-colors">AI Studio Workbench</Link></li>
                <li><Link href="/testlab" className="hover:text-white transition-colors">TestLab Simulator</Link></li>
                <li><Link href="/developers" className="hover:text-white transition-colors">Developer Docs</Link></li>
                <li><Link href="/developers/api-keys" className="hover:text-white transition-colors">API Keys</Link></li>
                <li><Link href="/developers/webhooks" className="hover:text-white transition-colors">Inbound Webhooks & HMAC</Link></li>
              </ul>
            </div>

            {/* Legal & Compliance */}
            <div className="space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs">Legal & Trust</div>
              <ul className="space-y-2 text-gray-400 text-xs">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Notice (DPDP)</Link></li>
                <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/dpa" className="hover:text-white transition-colors">Data Processing Addendum</Link></li>
              </ul>
            </div>
          </div>

          <div className="w-full pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
            <div>© 2026 OVRA. All rights reserved. Registered Indian Sovereign Automation Platform.</div>
            <div className="flex items-center gap-5">
              <Link href="/auth/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
              <Link href="/auth/register" className="hover:text-gray-300 transition-colors">Register</Link>
              <Link href="/onboarding" className="hover:text-gray-300 transition-colors">Onboarding Wizard</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
