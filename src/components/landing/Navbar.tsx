"use client";

import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-ovra-border/60">
      <div className="flex items-center gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-ovra-orange flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-white"
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
          <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
            OVRA
            <span className="text-xs font-semibold text-ovra-orange ml-0.5 align-top">®</span>
          </span>
        </Link>

        {/* Separator */}
        <div className="h-4 w-px bg-gray-300 hidden md:block" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-gray-700">
          <Link href="/studio" className="hover:text-gray-950 transition-colors">
            Studio
          </Link>
          <Link href="/ai-studio" className="hover:text-gray-950 transition-colors">
            AI Studio
          </Link>
          <Link href="/testlab" className="hover:text-gray-950 transition-colors">
            TestLab
          </Link>
          <Link href="/developers" className="hover:text-gray-950 transition-colors">
            Developers
          </Link>
          <Link href="/templates" className="hover:text-gray-950 transition-colors">
            Templates
          </Link>
        </nav>
      </div>

      {/* Auth & CTA Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-xs font-semibold text-gray-800 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-full shadow-sm transition-all"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-xs font-semibold text-gray-950 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-full shadow-sm flex items-center gap-1 transition-all"
        >
          Get Started <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
