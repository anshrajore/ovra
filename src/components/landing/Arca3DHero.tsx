"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  Lock,
  Terminal,
} from "lucide-react";
import confetti from "canvas-confetti";

export function Arca3DHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<0 | 1 | 2 | 3>(0);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Mouse 3D perspective tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setExecutionTime(null);

    const startTime = performance.now();

    setTimeout(() => {
      setSimStep(2);
      setTimeout(() => {
        setSimStep(3);
        const elapsed = Math.round(performance.now() - startTime);
        setExecutionTime(elapsed);
        setIsSimulating(false);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#FFFFFF", "#2342FF", "#00E599", "#FFD028"],
          });
        } catch {
          // ignore if canvas not supported
        }
      }, 500);
    }, 450);
  };

  // Interpolated 3D tilts
  const rotX = -mousePos.y * 14;
  const rotY = mousePos.x * 16;

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] lg:min-h-screen bg-[#2342FF] text-white overflow-hidden pt-24 sm:pt-28 pb-16 flex flex-col justify-between select-none"
      style={{
        backgroundColor: "#2342FF",
        backgroundImage: `
          radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 85% 80%, rgba(0, 0, 0, 0.25) 0%, transparent 50%),
          linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px",
      }}
    >
      {/* Top Banner Tag Shelf (Robin reference craft) */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-4 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          {/* Physical taped badge 1 */}
          <div className="relative px-3 py-1 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-md shadow-md rotate-[-1.5deg] hover:rotate-0 transition-transform">
            <span className="washi-tape -top-2 left-3 w-8" />
            SOVEREIGN INDIAN ENGINE
          </div>

          {/* Physical badge 2 */}
          <div className="px-3 py-1 bg-[#00E599] text-black text-[11px] font-black uppercase tracking-wider rounded-md shadow-md rotate-[1.5deg] hover:rotate-0 transition-transform">
            ZERO EVAL() AST
          </div>

          {/* Physical badge 3 */}
          <div className="hidden sm:inline-block px-3 py-1 bg-[#FFD028] text-black text-[11px] font-black uppercase tracking-wider rounded-md shadow-md rotate-[-0.8deg] hover:rotate-0 transition-transform">
            AES-256 ENVELOPE
          </div>
        </div>

        {/* Status capsule */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/90">
          <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
          <span>Mumbai ap-south-1 • System Nominal</span>
        </div>
      </div>

      {/* Main Kinetic & 3D Stage */}
      <div className="relative w-full max-w-7xl mx-auto px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* 3D Floating Interactive Composition */}
        <div
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          style={{
            perspective: "1200px",
          }}
        >
          {/* Left Column: Headline & Value Proposition (100% Uncluttered Clean Contrast) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-medium text-white mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD028]" />
              <span>Next-Gen Visual Automation + AI Graph</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.04] mb-6">
              The workflow engine that never breaks.
            </h1>

            <p className="text-base sm:text-lg text-white/85 font-medium max-w-xl leading-relaxed mb-8">
              Visual workflow composition with the developer ergonomics of code.
              Orchestrate AI models, trigger webhooks, and execute durable graphs
              on a sovereign PostgreSQL substrate.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/studio"
                className="group relative flex items-center gap-3 px-7 py-4 rounded-2xl bg-black text-white font-bold text-sm sm:text-base hover:bg-neutral-900 transition-all shadow-2xl hover:scale-[1.02] border border-white/10"
              >
                <span>Launch Studio Canvas</span>
                <div className="w-6 h-6 rounded-full bg-[#2342FF] text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base transition-all border border-white/25 active:scale-95"
              >
                <Play className={`w-4 h-4 fill-white ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "Executing Pipeline..." : "Test Live DAG (14ms)"}</span>
              </button>
            </div>

            {/* Hand-annotated annotation doodle (Robin reference) */}
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
              <span>Free tier includes 10,000 runs/mo • No credit card required</span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Floating Cards Canvas with Background Typographic OVRA */}
          <div
            className="lg:col-span-6 relative w-full h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center"
            style={{
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.15s cubic-bezier(0.1, 0.7, 0.3, 1)",
            }}
          >
            {/* Signature ARCA-style Graphic Typographic Layer (Positioned behind 3D cards only) */}
            <div
              className="absolute -top-14 -right-4 pointer-events-none z-0 select-none opacity-20 font-black text-white text-[12rem] lg:text-[14rem] tracking-tighter leading-none"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                textShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
              }}
            >
              OVRA
            </div>

            {/* Card 1: Left Tilted Dark Pass Card (Luca Ferrante style from Image 3) */}
            <div
              className="absolute left-0 sm:left-4 top-6 sm:top-10 w-[240px] sm:w-[270px] rounded-3xl bg-[#0E1015] border border-white/20 p-5 text-white shadow-2xl transition-all duration-300 hover:scale-105 z-20"
              style={{
                transform: "rotate(-12deg) translateZ(40px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.15)",
              }}
            >
              {/* Washi Tape strip on card corner */}
              <div className="washi-tape -top-3 left-10 w-12 rotate-[-5deg]" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00E599] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
                  LIVE PIPELINE
                </span>
                <span className="text-[10px] text-white/50 font-mono">#OVRA-8492</span>
              </div>

              <div className="text-lg font-black tracking-tight mb-1 text-white">
                Enterprise Churn Guard
              </div>
              <p className="text-xs text-white/70 mb-4">
                Autonomous B2B telemetry & real-time Stripe revenue retention DAG.
              </p>

              {/* Status pill & stats */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">Latency</span>
                <span className="font-bold text-[#00E599]">14.2 ms</span>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-white/50">Pass Verified</span>
                <span className="text-xs font-mono font-bold text-white">AES-256</span>
              </div>
            </div>

            {/* Card 2: Right Tilted Glassmorphic Node Card (from Image 3 & Image 2) */}
            <div
              className="absolute right-0 sm:right-6 top-16 sm:top-20 w-[230px] sm:w-[260px] rounded-3xl bg-[#141721]/95 backdrop-blur-xl border border-white/25 p-5 text-white shadow-2xl transition-all duration-300 hover:scale-105 z-10"
              style={{
                transform: "rotate(10deg) translateZ(20px)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.2)",
              }}
            >
              {/* Washi Tape strip */}
              <div className="washi-tape -top-3 right-8 w-12 rotate-[6deg]" />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD028] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#FFD028]" />
                  HMAC GUARD
                </span>
                <span className="text-[10px] text-white/60 font-mono">200 OK</span>
              </div>

              <div className="text-base font-black tracking-tight mb-1">
                Stripe Fraud Replay
              </div>
              <p className="text-[11px] text-white/70 mb-3">
                Idempotent webhook signature verification & replay buffer.
              </p>

              <div className="p-2 rounded-xl bg-black/40 border border-white/10 font-mono text-[10px] text-[#00E599] truncate">
                sha256=9f82d...valid
              </div>
            </div>

            {/* Center Interactive Mini DAG (Image 1 & 2 integration) */}
            <div
              className="relative w-[280px] sm:w-[320px] rounded-3xl bg-[#090A0D] border-2 border-white/30 p-5 text-white shadow-2xl z-30"
              style={{
                transform: "translateZ(80px)",
                boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2342FF]" />
                  <span className="text-xs font-black tracking-tight uppercase">Live Orchestrator</span>
                </div>
                {executionTime !== null && (
                  <span className="text-[11px] font-mono font-bold text-[#00E599]">
                    ✓ {executionTime}ms
                  </span>
                )}
              </div>

              {/* 3 Step Connected Flow Nodes */}
              <div className="space-y-2.5">
                {/* Node 1 */}
                <div
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    simStep >= 1
                      ? "bg-[#2342FF]/20 border-[#2342FF] text-white"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#FFD028]" />
                    <span className="font-semibold">1. Webhook Inbound</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">POST</span>
                </div>

                {/* Node 2 */}
                <div
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    simStep >= 2
                      ? "bg-[#00E599]/20 border-[#00E599] text-white"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="font-semibold">2. Gemini 2.5 Flash</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">210 tok</span>
                </div>

                {/* Node 3 */}
                <div
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    simStep >= 3
                      ? "bg-[#2342FF]/30 border-white text-white"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="font-semibold">3. Supabase Write</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50">RLS</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="mt-4 w-full py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <span>{isSimulating ? "Processing DAG..." : "Execute Pipeline"}</span>
                <Play className="w-3 h-3 fill-black text-black" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stark Metric Shelf (Image 3 ARCA reference: 8K+ members, 60+ countries, 0 feeds) */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 border-t border-white/15 z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              36+
            </div>
            <div className="text-xs sm:text-sm font-medium text-white/70 mt-1">
              Supabase Normalized Tables
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              60+
            </div>
            <div className="text-xs sm:text-sm font-medium text-white/70 mt-1">
              Native Enterprise Connectors
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              0
            </div>
            <div className="text-xs sm:text-sm font-medium text-white/70 mt-1">
              Silent Unhandled Failures
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              100%
            </div>
            <div className="text-xs sm:text-sm font-medium text-white/70 mt-1">
              Sovereign Indian Cloud
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
