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
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen lg:h-screen bg-[#0A0B0D] p-2 sm:p-3 md:p-4 flex flex-col justify-center">
      {/* Outer Device Bezel Frame — Expands to fill full width & full viewport */}
      <div className="w-full flex-1 min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] bg-[#141519] rounded-[28px] sm:rounded-[36px] md:rounded-[42px] p-1.5 sm:p-2 md:p-2.5 shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden">
        {/* Main Inner Card */}
        <div className="w-full flex-1 bg-[#FAF5EE] rounded-[22px] sm:rounded-[30px] md:rounded-[34px] overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Top Navigation */}
          <LandingNavbar />

          {/* Hero Section — Fills available vertical space and centers content */}
          <div className="flex-1 px-6 sm:px-10 md:px-14 lg:px-20 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Category Pill Tag */}
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-3 sm:mb-4">
                Workflow Automation Platform
              </span>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight text-gray-950 leading-[1.05] mb-5">
                Build, Automate and Scale with OVRA
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl font-normal leading-relaxed mb-8">
                The open workflow automation platform to connect your tools,
                build intelligent workflows, and run AI-powered automations at scale.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="/studio"
                  className="px-7 py-3.5 bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm md:text-base rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  href="/studio"
                  className="px-7 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-sm md:text-base rounded-full shadow-sm transition-all flex items-center gap-2"
                >
                  Explore Platform
                  <Play className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                </Link>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-200/80">
                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-900">
                    <Zap className="w-4 h-4 text-gray-900" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Automate Workflows
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-900">
                    <Layers className="w-4 h-4 text-gray-900" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Integrate Your Tools
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-900">
                    <Sparkles className="w-4 h-4 text-gray-900" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Build with AI
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-900">
                    <BarChart3 className="w-4 h-4 text-gray-900" />
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-gray-900 leading-tight">
                    Scale Effortlessly
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visual 3D Showcase (5 cols) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <Hero3DVisual />
            </div>
          </div>

          {/* Bottom Dark Statistics Shelf Bar */}
          <div className="bg-[#121316] text-white px-6 sm:px-10 md:px-14 lg:px-20 py-4 md:py-5 flex flex-wrap items-center justify-between gap-6 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 md:gap-16">
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  10K+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Active Workflows
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  500+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Integrations
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  50K+
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Builders
                </div>
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block" />

              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                  99.9%
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Platform Uptime
                </div>
              </div>
            </div>

            {/* Watch Overview Button */}
            <Link
              href="/studio"
              className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-105 group-hover:border-white transition-all">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Watch 2-min Overview</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
