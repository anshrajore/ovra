"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sparkles,
  User,
  Settings,
  KeyRound,
  LogOut,
  ExternalLink,
  Activity,
  Workflow,
  CheckCircle2,
  X,
  Command,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";

interface StudioHeaderProps {
  onOpenAIStudio?: () => void;
}

export function StudioHeader({ onOpenAIStudio }: StudioHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const store = useAppStore();
  const user = store.getUser();
  const activity = store.getActivity();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsCommandPaletteOpen(false);
    router.push(`/workflows?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="h-16 px-6 bg-white border-b border-ovra-border/70 flex items-center justify-between select-none z-20 shrink-0">
        {/* Left: Brand Logo & Navigation Pills */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#2342FF] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
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
              href="/workflows"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname.startsWith("/workflows") || pathname.startsWith("/studio")
                  ? "bg-[#1E1F24] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-950 hover:bg-white/80"
              }`}
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

            <Link
              href="/templates"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname.startsWith("/templates")
                  ? "bg-[#1E1F24] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-950 hover:bg-white/80"
              }`}
            >
              Templates
            </Link>

            <Link
              href="/integrations"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname.startsWith("/integrations")
                  ? "bg-[#1E1F24] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-950 hover:bg-white/80"
              }`}
            >
              Integrations
            </Link>
          </nav>
        </div>

        {/* Right: Search, Notifications & User Avatar */}
        <div className="flex items-center gap-4">
          {/* Search Bar Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative hidden md:flex items-center w-56 lg:w-64 pl-9 pr-10 py-1.5 bg-gray-100/80 hover:bg-gray-100 border border-gray-200/80 rounded-full text-xs text-gray-400 text-left transition-all"
          >
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <span>Search anything...</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
              ⌘K
            </kbd>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
              title="Recent Activity & Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#2342FF] rounded-full ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-ovra-orange" />
                    Activity Stream
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Live Realtime
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 p-1">
                  {activity.slice(0, 6).map((item) => (
                    <div key={item.id} className="py-2 px-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold">
                          {item.userAvatar}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.userName}
                        </span>
                        <span className="text-gray-500">{item.action}</span>
                      </div>
                      <span className="font-medium text-gray-800 block pl-5 truncate">
                        "{item.targetTitle}"
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/workflows"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block text-center py-1.5 text-[11px] font-semibold text-ovra-orange hover:text-ovra-orange-dark border-t border-gray-100 transition-colors"
                >
                  View All Workflows
                </Link>
              </div>
            )}
          </div>

          {/* User Avatar Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#1E1F24] hover:bg-black text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-gray-100 select-none transition-transform"
              title="User Account"
            >
              {user.avatar}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs">
                {/* User Info Header */}
                <div className="p-2.5 border-b border-gray-100">
                  <span className="font-bold text-gray-950 block">{user.name}</span>
                  <span className="text-[11px] text-gray-500 font-mono block truncate">
                    {user.email}
                  </span>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-orange-50 border border-orange-200/60 rounded text-[10px] font-bold text-ovra-orange">
                    {user.role}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Workspace Settings</span>
                  </Link>

                  <Link
                    href="/credentials"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-gray-400" />
                    <span>API Credentials Vault</span>
                  </Link>

                  <a
                    href="https://github.com/anshrajore/ovra"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span>GitHub Repository</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal (⌘K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative border-b border-gray-200">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search workflows, templates, or execute command..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 text-xs text-gray-900 placeholder-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(false)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-2 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 block">
                Quick Navigation
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  router.push("/workflows");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium"
              >
                <span className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-gray-400" />
                  Workflows Dashboard
                </span>
                <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  G W
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  router.push("/templates");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Explore Templates
                </span>
                <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  G T
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  router.push("/credentials");
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl font-medium"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  API Credentials Vault
                </span>
                <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  G C
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
