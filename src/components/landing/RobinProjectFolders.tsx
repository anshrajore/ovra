"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Play, CheckCircle2, ShieldCheck, Database, Zap, Lock, Terminal } from "lucide-react";

export function RobinProjectFolders() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  const projects = [
    {
      tabId: "+ PIPELINE 01",
      title: "Customer Churn AI Intervention & Retention DAG",
      date: "MAR 2, 2026",
      tagline: "Autonomous B2B telemetry pipeline predicting churn risk, calculating SLA impact, and orchestrating CRM interventions.",
      badge: "B2B SaaS & AI",
      bgTab: "bg-[#2342FF] text-white",
      folderBg: "bg-[#0A0C12] border-white/15",
      terminalCommand: "ovra trigger --pipeline b2b-churn-intervention",
      nodes: [
        { label: "Mixpanel Usage Drop Trigger", status: "200 OK", type: "trigger" },
        { label: "Gemini 2.5 Churn Risk Evaluator", status: "Risk: 0.88 High", type: "ai" },
        { label: "PostgreSQL Customer Account Flag", status: "Status: Flagged", type: "db" },
        { label: "Slack Executive Escalation & CRM Update", status: "Dispatched", type: "notification" },
      ],
      metrics: { latency: "14.4ms", uptime: "99.99%", cost: "$0.0003/run" },
    },
    {
      tabId: "+ PIPELINE 02",
      title: "Stripe Webhook Replay & Fraud Guard",
      date: "JAN 28, 2026",
      tagline: "Idempotent payment webhook pipeline with HMAC verification and zero dropped transactions.",
      badge: "Fintech & Webhooks",
      bgTab: "bg-[#111216] text-white",
      folderBg: "bg-[#0E0F14] border-white/15",
      terminalCommand: "ovra webhooks verify --endpoint /api/v1/webhooks/stripe",
      nodes: [
        { label: "Stripe HMAC-SHA256 Verification", status: "Signature Valid", type: "trigger" },
        { label: "Deduplication Cache (PostgreSQL)", status: "Unseen Event", type: "db" },
        { label: "Risk Score Evaluator", status: "Score: 12 (Safe)", type: "ai" },
        { label: "Slack Finance Alert & Invoice Receipt", status: "Dispatched", type: "notification" },
      ],
      metrics: { latency: "11.2ms", uptime: "100%", cost: "$0.0001/run" },
    },
    {
      tabId: "+ PIPELINE 03",
      title: "pgvector Knowledge Retrieval & RAG Synthesis",
      date: "FEB 14, 2026",
      tagline: "Chunk documents, compute text-embedding-004 vectors, and synthesize answers with citations.",
      badge: "Vector Search & AI",
      bgTab: "bg-[#FFD028] text-black",
      folderBg: "bg-[#0B0C10] border-white/15",
      terminalCommand: "ovra rag query --source product_spec.md --similarity 0.88",
      nodes: [
        { label: "File Drop Ingestion (.pdf / .md)", status: "Parsed 12 Chunks", type: "trigger" },
        { label: "text-embedding-004 Vectors", status: "768 Dimensions", type: "ai" },
        { label: "pgvector Cosine Similarity Match", status: "Top 3 Matched", type: "db" },
        { label: "Gemini 2.5 Pro Contextual Answer", status: "Synthesized", type: "ai" },
      ],
      metrics: { latency: "42.0ms", uptime: "99.95%", cost: "$0.0012/run" },
    },
  ];

  const current = projects[activeTab];

  return (
    <section id="pipelines" className="relative w-full bg-[#FAF7F2] text-black py-24 sm:py-32 px-6 sm:px-10 lg:px-16 border-b border-black/10 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Section Label (Robin handwritten feel) */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2342FF] block mb-1">
              Production Case Studies
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-950 tracking-tight">
              Real pipelines built by engineering teams.
            </h2>
          </div>

          <Link
            href="/templates"
            className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2342FF] hover:underline"
          >
            <span>Browse 40+ Templates</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cut-Out Folded Folder Tabs (Image 1 Robin reference) */}
        <div className="flex items-end gap-2 overflow-x-auto scrollbar-none pt-4">
          {projects.map((proj, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx as 0 | 1 | 2)}
                className={`relative px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase transition-all flex items-center gap-2 rounded-t-2xl border-t border-x ${
                  isActive
                    ? `${proj.bgTab} border-transparent shadow-lg scale-100 z-10 -mb-px`
                    : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300 scale-95"
                }`}
                style={{
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)",
                }}
              >
                <span>{proj.tabId}</span>
              </button>
            );
          })}
        </div>

        {/* Folder Content Body (High-contrast obsidian card with washi tape details) */}
        <div className={`relative rounded-b-3xl rounded-tr-3xl p-6 sm:p-10 lg:p-12 text-white border shadow-2xl transition-all duration-300 ${current.folderBg}`}>
          {/* Top Washi Tape details (Robin reference) */}
          <div className="washi-tape -top-3 left-16 w-16 rotate-[-2deg]" />
          <div className="washi-tape -top-3 right-20 w-14 rotate-[3deg]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Pipeline Details */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-white/50">{current.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-white/90">
                    {current.badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                  {current.title}
                </h3>

                <p className="text-sm sm:text-base text-white/75 font-normal leading-relaxed mb-6">
                  {current.tagline}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-8 font-mono text-xs">
                  <div>
                    <div className="text-white/40 text-[10px] uppercase">Latency</div>
                    <div className="font-bold text-[#00E599] text-sm sm:text-base mt-0.5">{current.metrics.latency}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] uppercase">Availability</div>
                    <div className="font-bold text-white text-sm sm:text-base mt-0.5">{current.metrics.uptime}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] uppercase">Compute Cost</div>
                    <div className="font-bold text-[#FFD028] text-sm sm:text-base mt-0.5">{current.metrics.cost}</div>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="flex items-center gap-4">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md group"
                >
                  <span>Open Pipeline in Studio</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/developers"
                  className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
                >
                  CLI Specs →
                </Link>
              </div>
            </div>

            {/* Right Column: Taped Mockup Preview with Interactive Step Logs */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl bg-black/70 border border-white/15 p-5 shadow-2xl relative">
                {/* Washi tape on top right of the terminal */}
                <div className="washi-tape -top-2 right-6 w-12 rotate-[4deg]" />

                {/* Window header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs text-white/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-white/60">pipeline_graph.ts</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#00E599]">● LIVE STREAM</span>
                </div>

                {/* Execution Command */}
                <div className="p-2.5 rounded-lg bg-white/5 font-mono text-xs text-white/80 mb-4 flex items-center gap-2">
                  <span className="text-[#2342FF] font-bold">$</span>
                  <span>{current.terminalCommand}</span>
                </div>

                {/* Step List */}
                <div className="space-y-2.5">
                  {current.nodes.map((node, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
                        <span className="font-bold text-white">{node.label}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#00E599] font-bold bg-[#00E599]/10 px-2 py-0.5 rounded-md">
                        {node.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Verification Seal */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-mono">
                  <span>Durable State: CHECKPOINT_SAVED</span>
                  <span className="text-white/60">Signature: HMAC-SHA256</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
