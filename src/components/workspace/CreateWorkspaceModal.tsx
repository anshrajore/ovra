"use client";

import { useState } from "react";
import { X, Building2, Rocket, Briefcase, Users, Check } from "lucide-react";
import { appStore, Workspace } from "@/lib/store/app-store";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspace: Workspace) => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Workspace["type"]>("team");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const typeOptions: Array<{
    id: Workspace["type"];
    label: string;
    desc: string;
    icon: typeof Building2;
  }> = [
    { id: "personal", label: "Personal", desc: "Private developer sandbox", icon: Rocket },
    { id: "startup", label: "Startup", desc: "Early-stage agile project", icon: Users },
    { id: "team", label: "Team", desc: "Collaborative department unit", icon: Briefcase },
    { id: "company", label: "Company", desc: "Enterprise organization", icon: Building2 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newWs = appStore.createWorkspace(name.trim(), description.trim(), type);
      setIsSubmitting(false);
      setName("");
      setDescription("");
      if (onCreated) onCreated(newWs);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-ovra-orange/10 text-ovra-orange flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">Create Workspace</h3>
              <p className="text-xs text-gray-500">
                Workspaces isolate workflows, credentials, and team members.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Workspace Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NayaMarg Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="What will this workspace be used for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-950 focus:bg-white focus:border-ovra-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Workspace Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? "border-ovra-orange bg-orange-50/30 text-gray-950 ring-1 ring-ovra-orange/40"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? "text-ovra-orange" : "text-gray-400"}`} />
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-gray-500 leading-tight">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
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
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
