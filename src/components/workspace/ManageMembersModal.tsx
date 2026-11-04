"use client";

import { useState } from "react";
import { X, Users, UserPlus, Shield, Trash2, Mail } from "lucide-react";
import { appStore, WorkspaceMember } from "@/lib/store/app-store";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: () => void;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  onOpenInvite,
}: ManageMembersModalProps) {
  const members = appStore.getMembers();
  const activeWorkspace = appStore.getActiveWorkspace();

  if (!isOpen) return null;

  const roleColors: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-blue-100 text-blue-800 border-blue-200",
    editor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    operator: "bg-amber-100 text-amber-800 border-amber-200",
    viewer: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const handleRoleChange = (memberId: string, newRole: WorkspaceMember["role"]) => {
    appStore.updateMemberRole(memberId, newRole);
  };

  const handleRemove = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the workspace?")) {
      appStore.removeMember(memberId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Team & Permissions</h3>
              <p className="text-xs text-gray-500">
                Manage members and access levels for <span className="font-semibold text-gray-900">{activeWorkspace.name}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenInvite();
              }}
              className="px-3 py-1.5 bg-[#1E1F24] hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {member.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-950">{member.name}</span>
                    {member.status === "invited" && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {member.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.role === "owner" ? (
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${roleColors.owner}`}>
                    Owner
                  </span>
                ) : (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:border-ovra-orange"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                )}

                {member.role !== "owner" && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    title="Remove Member"
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between text-[11px] text-gray-500">
          <span>Role changes are enforced instantly across all workflows and API calls.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
