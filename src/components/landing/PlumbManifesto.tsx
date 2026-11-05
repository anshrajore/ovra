"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Activity, Shield, Terminal } from "lucide-react";

export function PlumbManifesto() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Sentence to Graph",
      desc: "Type your intent in plain English or drop an OpenAPI 3.1 spec. OVRA compiles it directly into a typed DAG with input/output schemas.",
      badge: "Gemini 2.5 Compiler",
    },
    {
      title: "2. Sealed Credentials",
      desc: "API keys and OAuth tokens are envelope-encrypted with AES-256-GCM. Decryption only occurs ephemeral inside worker memory.",
      badge: "Envelope Encryption",
    },
    {
      title: "3. Durable Execution",
      desc: "If Stripe or your CRM returns HTTP 429, OVRA automatically backs off exponentially, never dropping an event.",
      badge: "Dead Letter Queue",
    },
  ];

  return (
    <section
      id="manifesto"
      className="relative w-full bg-[#08090C] text-white py-24 sm:py-32 px-6 sm:px-10 lg:px-16 border-b border-white/10 overflow-hidden"
    >
      {/* Background radial specular glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#2342FF]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Editorial Subtitle */}
        <div className="text-xs font-bold tracking-[0.25em] uppercase text-white/50 mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2342FF]" />
          <span>The Platform Manifesto</span>
        </div>

        {/* High-Impact Statement (Plumb style) */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white/90 leading-[1.3] mb-16">
          Most teams keep three copies of the truth: the doc where it was decided,
          the webhook where it quietly failed, and the script that nobody maintains.{" "}
          <span className="text-white font-bold underline decoration-[#2342FF] decoration-4 underline-offset-8">
            OVRA keeps one, and it’s the one you designed.
          </span>
        </h2>

        {/* Subsection: How it Works */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2342FF] mb-2 block">
              How it works
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-4">
              From an idea to an enterprise workflow graph, without leaving the page.
            </h3>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Build your pipeline visually with drag-and-drop nodes, inspect live
              HTTP headers and payloads in-canvas, and deploy with one click.
            </p>

            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-[#2342FF] transition-colors group"
            >
              <span>Explore Visual Studio</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Interactive Steps List */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeStep === idx
                    ? "bg-white/10 border-[#2342FF] shadow-xl"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-white">{step.title}</h4>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#2342FF]/30 text-[#2342FF] border border-[#2342FF]/40">
                    {step.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Contextual Bottom HUD Capsule (Image 2 Plumb reference) */}
        <div className="mt-16 flex items-center justify-between p-3.5 sm:p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs text-white/80">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse" />
            <span className="font-semibold text-white">SanjeevaniX Emergency Call Triage</span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-white/60 hidden sm:inline font-mono">DAG-7491-DELHI</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatar Stack */}
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#08090C] bg-[#2342FF] text-[9px] font-bold text-white flex items-center justify-center">
                AI
              </div>
              <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#08090C] bg-[#00E599] text-[9px] font-bold text-black flex items-center justify-center">
                DB
              </div>
              <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#08090C] bg-[#FFD028] text-[9px] font-bold text-black flex items-center justify-center">
                HTTP
              </div>
            </div>

            <span className="font-mono text-white/80 font-bold">Executed 14ms ago</span>
          </div>
        </div>
      </div>
    </section>
  );
}
