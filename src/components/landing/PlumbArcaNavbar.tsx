"use client";

import Link from "next/link";
import { ArrowUpRight, Settings, KeyRound, Layers, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store/use-app-store";

export function PlumbArcaNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const store = useAppStore();
  const activeWorkspace = store.getActiveWorkspace();
  const storeUser = store.getUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Monitor Supabase auth session
  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setIsSignedIn(true);
          setUserEmail(data.session.user.email || storeUser.email);
        } else if (localStorage.getItem("ovra_session_active") === "true") {
          setIsSignedIn(true);
          setUserEmail(storeUser.email);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsSignedIn(true);
          setUserEmail(session.user.email || storeUser.email);
        } else if (localStorage.getItem("ovra_session_active") !== "true") {
          setIsSignedIn(false);
          setUserEmail(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (e) {
      // In case client initialization is local preview
      if (localStorage.getItem("ovra_session_active") === "true") {
        setIsSignedIn(true);
        setUserEmail(storeUser.email);
      }
    }
  }, [storeUser.email]);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("ovra_session_active");
    setIsSignedIn(false);
    setUserEmail(null);
    window.location.reload();
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto transition-all duration-300 w-full max-w-5xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
          scrolled
            ? "bg-[#0B0C10]/95 backdrop-blur-xl border-white/15 shadow-2xl glass-rim-reflection"
            : "bg-[#0B0C10]/85 backdrop-blur-md border-white/10 shadow-lg"
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

        {/* Center: Editorial Navigation Links */}
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

        {/* Right: Auth & Account Settings */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-2.5" ref={dropdownRef}>
              <Link
                href="/studio"
                className="relative group flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full bg-[#2342FF] text-white text-xs font-bold tracking-tight hover:bg-[#1A35DB] transition-all shadow-md overflow-hidden"
              >
                <span>Open Studio</span>
                <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-semibold text-white"
                  title="Account & Settings"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2342FF] to-blue-400 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {(userEmail ? userEmail[0] : storeUser.avatar).toUpperCase()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 pr-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#141519] border border-white/15 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                    <div className="p-2.5 border-b border-white/10">
                      <span className="font-bold text-white block truncate">
                        {storeUser.name || "Enterprise User"}
                      </span>
                      <span className="text-[11px] text-white/50 font-mono block truncate">
                        {userEmail || storeUser.email}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 bg-[#2342FF]/20 border border-[#2342FF]/40 rounded text-[10px] font-semibold text-[#8299FF]">
                          {activeWorkspace.name}
                        </span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                      >
                        <Settings className="w-4 h-4 text-white/50" />
                        <span>Workspace Settings</span>
                      </Link>

                      <Link
                        href="/credentials"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-white/50" />
                        <span>Credentials Vault</span>
                      </Link>

                      <Link
                        href="/workflows"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
                      >
                        <Layers className="w-4 h-4 text-white/50" />
                        <span>Workflows</span>
                      </Link>
                    </div>

                    <div className="border-t border-white/10 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-medium transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-400/70" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform pointer-events-none" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
