"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Building,
  User,
  Users,
  Shield,
  Save,
  Trash2,
  Plus,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";

export default function SettingsPage() {
  const router = useRouter();
  const store = useAppStore();
  const user = store.getUser();
  const activeWorkspace = store.getActiveWorkspace();
  const members = store.getMembers();

  const [wsName, setWsName] = useState(activeWorkspace.name);
  const [wsDesc, setWsDesc] = useState(activeWorkspace.description || "");
  const [environment, setEnvironment] = useState(activeWorkspace.environment);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateWorkspace(activeWorkspace.id, {
      name: wsName.trim() || activeWorkspace.name,
      description: wsDesc.trim(),
      environment,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteWorkspace = () => {
    if (confirm(`Are you absolutely sure you want to delete "${activeWorkspace.name}"? This action cannot be undone.`)) {
      store.deleteWorkspace(activeWorkspace.id);
      router.push("/workflows");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Settings Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="settings" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-ovra-orange" />
                Workspace Settings
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Configure workspace metadata, manage team access control, and environment preferences.
              </p>
            </div>

            {/* Section 1: General Workspace Settings */}
            <div className="bg-white rounded-3xl border border-ovra-border/70 p-6 shadow-2xs space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <Building className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="text-sm font-bold text-gray-950">Workspace Profile</h2>
                  <p className="text-xs text-gray-500">Public metadata and environment designation</p>
                </div>
              </div>

              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      required
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Environment Stage
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                    >
                      <option value="production">Production (Mission Critical)</option>
                      <option value="staging">Staging (Pre-Release)</option>
                      <option value="development">Development (Sandbox)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Workspace Description
                  </label>
                  <textarea
                    rows={2}
                    value={wsDesc}
                    onChange={(e) => setWsDesc(e.target.value)}
                    placeholder="Short summary of what is built in this workspace..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedSuccess ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Changes saved successfully!
                    </span>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-950 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Team Members & RBAC */}
            <div className="bg-white rounded-3xl border border-ovra-border/70 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-700" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-950">Team & Roles</h2>
                    <p className="text-xs text-gray-500">
                      Collaborators with access to workflows and credentials
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="px-3 py-1.5 bg-ovra-orange hover:bg-ovra-orange-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {members.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E1F24] text-white flex items-center justify-center font-bold text-xs">
                        {m.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">{m.name}</span>
                        <span className="text-[11px] text-gray-500 font-mono block">
                          {m.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={m.role}
                        onChange={(e) => store.updateMemberRole(m.id, e.target.value as any)}
                        disabled={m.role === "owner"}
                        className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium capitalize disabled:opacity-60"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="operator">Operator</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      {m.role !== "owner" && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${m.name} from workspace?`)) {
                              store.removeMember(m.id);
                            }
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Danger Zone */}
            <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="text-sm font-bold text-rose-950">Danger Zone</h2>
                  <p className="text-xs text-rose-700">Irreversible actions on this workspace</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-rose-800">
                  <span className="font-semibold block">Delete this workspace</span>
                  <span>
                    Permanently delete all workflows, versions, and credentials in {activeWorkspace.name}.
                  </span>
                </div>

                <button
                  onClick={handleDeleteWorkspace}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Workspace
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}
