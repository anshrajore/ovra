"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Users,
  UserPlus,
  Settings,
  Search,
} from "lucide-react";
import { appStore } from "@/lib/store/app-store";
import { useAppStore } from "@/lib/store/use-app-store";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { ManageMembersModal } from "./ManageMembersModal";
import { InviteMemberModal } from "./InviteMemberModal";
import { WorkspaceSettingsModal } from "./WorkspaceSettingsModal";

export function WorkspaceSwitcherDropdown() {
  const store = useAppStore();
  const activeWorkspace = store.getActiveWorkspace();
  const allWorkspaces = store.getWorkspaces();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = allWorkspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="relative w-full" ref={dropdownRef}>
        {/* Workspace Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-xl shadow-2xs transition-colors"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Building2 className="w-4 h-4 text-ovra-orange shrink-0" />
            <span className="text-xs font-bold text-gray-900 tracking-tight truncate">
              {activeWorkspace.name}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200/80 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-ovra-orange"
                />
              </div>
            </div>

            {/* Workspaces List */}
            <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
              <span className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Your Workspaces
              </span>
              {filtered.map((ws) => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => {
                      store.setActiveWorkspace(ws.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                      isActive
                        ? "bg-gray-100 font-bold text-gray-950"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full bg-ovra-orange shrink-0" />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-ovra-orange shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="p-1.5 border-t border-gray-100 space-y-0.5 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCreateOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-950 hover:bg-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-ovra-orange" />
                <span>Create Workspace</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsManageMembersOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-950 hover:bg-white rounded-lg transition-colors font-medium"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Manage Members</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsInviteOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-950 hover:bg-white rounded-lg transition-colors font-medium"
              >
                <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                <span>Invite Teammate</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gray-950 hover:bg-white rounded-lg transition-colors font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-gray-600" />
                <span>Workspace Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <ManageMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => setIsManageMembersOpen(false)}
        onOpenInvite={() => setIsInviteOpen(true)}
      />
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
