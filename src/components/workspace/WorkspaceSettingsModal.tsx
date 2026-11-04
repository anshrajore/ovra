"use client";

import { useState } from "react";
import { X, Settings, AlertTriangle, Trash2, Check } from "lucide-react";
import { appStore } from "@/lib/store/app-store";

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsModal({
  isOpen,
  onClose,
}: WorkspaceSettingsModalProps) {
  const activeWorkspace = appStore.getActiveWorkspace();
  const [name, setName] = useState(activeWorkspace.name);
  const [description, setDescription] = useState(activeWorkspace.description || "");
  const [env, setEnv] = useState(activeWorkspace.environment);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.updateWorkspace(activeWorkspace.id, {
      name: name.trim(),
      description: description.trim(),
      environment: env,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete "${activeWorkspace.name}" and all its workflows?`)) {
      appStore.deleteWorkspace(activeWorkspace.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Workspace Settings</h3>
              <p className="text-xs text-gray-500">
                Configure identity and environment parameters.
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

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Environment
            </label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            >
              <option value="production">Production — Strict security & live execution</option>
              <option value="staging">Staging — Pre-release testing environment</option>
              <option value="development">Development — Experimental sandbox</option>
            </select>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-rose-100 mt-6">
            <h4 className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Danger Zone
            </h4>
            <p className="text-[11px] text-gray-500 mb-3">
              Deleting a workspace removes all contained workflows and credential references.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Workspace
            </button>
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
              className="px-5 py-2 bg-[#1E1F24] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
