"use client";

import Link from "next/link";
import { Search, Bell, Sparkles } from "lucide-react";

interface StudioHeaderProps {
  onOpenAIStudio?: () => void;
}

export function StudioHeader({ onOpenAIStudio }: StudioHeaderProps) {
  return (
    <header className="h-16 px-6 bg-white border-b border-ovra-border/70 flex items-center justify-between select-none z-20">
      {/* Left: Brand Logo & Navigation Pills */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-ovra-orange flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="7" cy="12" r="3" />
              <circle cx="17" cy="12" r="3" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 flex items-center">
            OVRA
          </span>
        </Link>

        {/* Center Nav Pills */}
        <nav className="flex items-center gap-1.5 bg-gray-100/70 p-1 rounded-full border border-gray-200/60 text-xs font-semibold">
          <Link
            href="/studio"
            className="px-4 py-1.5 bg-[#1E1F24] text-white rounded-full shadow-sm transition-all"
          >
            Workflows
          </Link>
          <button
            onClick={onOpenAIStudio}
            className="px-4 py-1.5 text-gray-600 hover:text-gray-950 hover:bg-white/80 rounded-full transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Studio
          </button>
          <button className="px-4 py-1.5 text-gray-600 hover:text-gray-950 hover:bg-white/80 rounded-full transition-all">
            Templates
          </button>
          <button className="px-4 py-1.5 text-gray-600 hover:text-gray-950 hover:bg-white/80 rounded-full transition-all">
            Integrations
          </button>
          <button className="px-4 py-1.5 text-gray-600 hover:text-gray-950 hover:bg-white/80 rounded-full transition-all">
            AI Agents
          </button>
        </nav>
      </div>

      {/* Right: Search, Notifications & User Avatar */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-56 lg:w-64 pl-9 pr-10 py-1.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-gray-200/80 focus:border-ovra-orange rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell with Badge */}
        <button className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-ovra-orange rounded-full ring-2 ring-white" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#2D2E33] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-gray-100 select-none">
          A
        </div>
      </div>
    </header>
  );
}
