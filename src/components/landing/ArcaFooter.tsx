"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Heart } from "lucide-react";

export function ArcaFooter() {
  return (
    <footer className="w-full bg-[#08090C] text-white pt-20 pb-12 px-6 sm:px-10 lg:px-16 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Massive ARCA-style CTA Block (from Image 3) */}
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-[#2342FF] text-white flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 shadow-2xl relative overflow-hidden">
          {/* Subtle background drafting grid */}
          <div
            className="absolute inset-0 bg-grid-drafting opacity-20 pointer-events-none"
            style={{ backgroundSize: "32px 32px" }}
          />

          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-white/80 block mb-3">
              One Graph. Zero Failures.
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.08] mb-4">
              Stop maintaining glue code. Build on OVRA today.
            </h2>
            <p className="text-sm sm:text-base text-white/85 font-medium leading-relaxed">
              Join engineering teams orchestrating multi-model AI, webhooks, and
              resilient database pipelines with sovereign data guarantees.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/auth/register"
              className="group px-8 py-5 rounded-2xl bg-black text-white text-base sm:text-lg font-black tracking-tight hover:bg-neutral-900 transition-all flex items-center justify-between gap-4 shadow-2xl border border-white/10"
            >
              <span>Get Started Free</span>
              <div className="w-8 h-8 rounded-full bg-[#2342FF] text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-16 border-b border-white/10 text-xs">
          {/* Col 1: Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#2342FF] flex items-center justify-center text-white font-black text-xs">
                O
              </div>
              <span className="text-base font-black tracking-tight text-white">
                OVRA
              </span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-sm mb-4">
              Visual workflow automation and multi-model AI orchestration
              platform built on a sovereign PostgreSQL substrate.
            </p>
            <div className="flex items-center gap-2 text-white/50 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
              <span>Sovereign Indian Cloud (ap-south-1 Mumbai)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-white/60">
              <li>
                <Link href="/studio" className="hover:text-white transition-colors">Visual Studio</Link>
              </li>
              <li>
                <Link href="/ai-studio" className="hover:text-white transition-colors">AI Studio</Link>
              </li>
              <li>
                <Link href="/testlab" className="hover:text-white transition-colors">TestLab Resilience</Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
              </li>
              <li>
                <Link href="/integrations" className="hover:text-white transition-colors">Connectors</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Developers</h4>
            <ul className="space-y-2.5 text-white/60">
              <li>
                <Link href="/developers" className="hover:text-white transition-colors">API Docs</Link>
              </li>
              <li>
                <Link href="/developers/api-keys" className="hover:text-white transition-colors">API Keys</Link>
              </li>
              <li>
                <Link href="/developers/webhooks" className="hover:text-white transition-colors">Webhooks</Link>
              </li>
              <li>
                <Link href="/OVRA_MASTER_PROJECT_SPECIFICATION.md" className="hover:text-white transition-colors">Specification</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Sovereign */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Compliance</h4>
            <ul className="space-y-2.5 text-white/60">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Notice (DPDP)</Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/dpa" className="hover:text-white transition-colors">Enterprise DPA</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <div>
            © {new Date().getFullYear()} OVRA Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for sovereign engineering teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
