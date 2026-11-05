"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function PlumbArcaNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto transition-all duration-300 w-full max-w-5xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
          scrolled
            ? "bg-[#0B0C10]/90 backdrop-blur-xl border-white/15 shadow-2xl glass-rim-reflection"
            : "bg-[#0B0C10]/80 backdrop-blur-md border-white/10 shadow-lg"
        }`}
      >
        {/* Left: Brand logo & name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#2342FF] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-white/20">
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
          <span className="text-lg font-black tracking-tight text-white flex items-center">
            OVRA
            <span className="w-1.5 h-1.5 rounded-full bg-[#2342FF] ml-1.5 animate-pulse" />
          </span>
        </Link>

        {/* Center: Editorial Navigation Links (from Plumb & ARCA references) */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/70">
          <Link
            href="#manifesto"
            className="hover:text-white transition-colors duration-200"
          >
            Manifesto
          </Link>
          <Link
            href="#pipelines"
            className="hover:text-white transition-colors duration-200"
          >
            Pipelines
          </Link>
          <Link
            href="/studio"
            className="hover:text-white transition-colors duration-200"
          >
            Studio
          </Link>
          <Link
            href="/ai-studio"
            className="hover:text-white transition-colors duration-200"
          >
            AI Studio
          </Link>
          <Link
            href="/testlab"
            className="hover:text-white transition-colors duration-200"
          >
            TestLab
          </Link>
          <Link
            href="/developers"
            className="hover:text-white transition-colors duration-200"
          >
            Developers
          </Link>
        </nav>

        {/* Right: Auth & Plumb Iridescent CTA Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
          >
            Sign in
          </Link>

          <Link
            href="/auth/register"
            className="relative group flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full bg-white text-black text-xs font-bold tracking-tight hover:bg-neutral-100 transition-all shadow-md overflow-hidden"
          >
            <span>Start Building</span>
            <div className="w-5 h-5 rounded-full bg-[#2342FF] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            {/* Ambient specular gleam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform pointer-events-none" />
          </Link>
        </div>
      </div>
    </header>
  );
}
