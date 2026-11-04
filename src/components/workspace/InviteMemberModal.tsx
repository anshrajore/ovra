"use client";

import { useState } from "react";
import { X, Mail, Copy, Check, Send, Shield } from "lucide-react";
import { appStore, WorkspaceMember } from "@/lib/store/app-store";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceMember["role"]>("editor");
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `https://app.ovra.in/join?token=inv_${Date.now()}`;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    appStore.inviteMember(email.trim(), role);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setEmail("");
      onClose();
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Invite Teammate</h3>
              <p className="text-xs text-gray-500">
                Grant workflow access to your workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Teammate Email Address
            </label>
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Select Role & Permissions
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            >
              <option value="admin">Admin — Full control over workflows & team</option>
              <option value="editor">Editor — Can build, edit, and publish workflows</option>
              <option value="operator">Operator — Can execute workflows and view logs</option>
              <option value="viewer">Viewer — Read-only access to workflow canvas</option>
            </select>
          </div>

          {/* Direct Link Share */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-600">Or share instant invite link</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 rounded-xl border border-gray-200/80">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-transparent px-2 text-[11px] font-mono text-gray-600 outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1 shrink-0 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-gray-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || isSent}
              className="px-5 py-2 bg-ovra-orange hover:bg-ovra-orange-dark text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSent ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Invitation Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
