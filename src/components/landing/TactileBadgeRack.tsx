"use client";

import { useState } from "react";
import { Zap, ShieldCheck, Sparkles, Database, Terminal, Cpu, Layers, Lock } from "lucide-react";

export function TactileBadgeRack() {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const badges = [
    {
      label: "Durable DAGs",
      icon: Zap,
      bg: "bg-[#2342FF] text-white",
      hoverBg: "hover:bg-[#1A34D9]",
      detail: "Deterministic state machines that survive restarts & network drops without event loss.",
    },
    {
      label: "Zero-Eval AST Engine",
      icon: Lock,
      bg: "bg-[#00E599] text-black",
      hoverBg: "hover:bg-[#00C885]",
      detail: "Safe template interpolation without eval() or new Function() to eliminate RCE risks.",
    },
    {
      label: "Multi-Model AI",
      icon: Sparkles,
      bg: "bg-[#FF4B72] text-white",
      hoverBg: "hover:bg-[#E03A5E]",
      detail: "Gemini 2.5 Flash, Claude 3.5 Sonnet, and GPT-4o side-by-side prompt benchmarking.",
    },
    {
      label: "Chaos & Resilience Lab",
      icon: Cpu,
      bg: "bg-[#FFD028] text-black",
      hoverBg: "hover:bg-[#E6BA19]",
      detail: "Simulate 429 rate limits, 30s timeouts, and >64 KiB payload spillovers before deployment.",
    },
    {
      label: "In-Canvas API Studio",
      icon: Terminal,
      bg: "bg-[#0F1117] text-white border border-white/20",
      hoverBg: "hover:bg-[#1C1F2B]",
      detail: "Embedded 6-stage inspector for live headers, query params, schemas, and cURL generation.",
    },
    {
      label: "Sovereign Indian Cloud",
      icon: ShieldCheck,
      bg: "bg-[#2342FF] text-white",
      hoverBg: "hover:bg-[#1A34D9]",
      detail: "Strict data residency in Mumbai (ap-south-1), fully compliant with India's DPDP Act, 2023.",
    },
    {
      label: "AES-256 Envelope Vault",
      icon: Layers,
      bg: "bg-[#9333EA] text-white",
      hoverBg: "hover:bg-[#7E22CE]",
      detail: "Credentials encrypted with KMS envelope keys, decrypted solely inside worker RAM.",
    },
    {
      label: "pgvector Semantic RAG",
      icon: Database,
      bg: "bg-[#00E599] text-black",
      hoverBg: "hover:bg-[#00C885]",
      detail: "768-dimensional embeddings stored directly in PostgreSQL with cosine index lookup.",
    },
  ];

  return (
    <section className="relative w-full bg-[#FAF7F2] py-20 px-6 sm:px-10 lg:px-16 border-b border-black/10 select-none">
      <div className="max-w-5xl mx-auto text-center">
        {/* Handwritten Style Annotation (Robin reference) */}
        <div className="inline-block px-3 py-1 bg-white border border-black/10 rounded-full text-xs font-mono text-gray-600 shadow-2xs mb-4 rotate-[-1deg]">
          ✦ engineering details everyone forgets
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mb-4">
          Tactile primitives designed for developers.
        </h2>
        <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto mb-10 leading-relaxed">
          Hover over any primitive to see how OVRA handles the edge cases traditional
          automation tools quietly ignore.
        </p>

        {/* Playful Interactive Badges Grid (Robin craft + ARCA palette) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <button
                key={idx}
                onMouseEnter={() => setHoveredBadge(b.label)}
                onMouseLeave={() => setHoveredBadge(null)}
                className={`group relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-md transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2.5 ${b.bg} ${b.hoverBg}`}
                style={{
                  transform: `rotate(${((idx % 5) - 2) * 1.2}deg)`,
                }}
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{b.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Detail Box */}
        <div className="mt-8 max-w-xl mx-auto min-h-[56px] flex items-center justify-center">
          {hoveredBadge ? (
            <div className="p-3.5 rounded-xl bg-white border border-black/10 text-xs font-medium text-gray-900 shadow-sm animate-fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2342FF]" />
              <span>{badges.find((b) => b.label === hoveredBadge)?.detail}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 font-mono italic">
              Hover over any badge to explore architectural specs
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
