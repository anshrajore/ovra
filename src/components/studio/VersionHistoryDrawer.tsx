"use client";

import { useState } from "react";
import { X, History, RotateCcw, Check, Calendar, User } from "lucide-react";
import { appStore, WorkflowVersionRecord } from "@/lib/store/app-store";

interface VersionHistoryDrawerProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (versionNumber: number) => void;
}

export function VersionHistoryDrawer({
  workflowId,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryDrawerProps) {
  const versions = appStore.getWorkflowVersions(workflowId);
  const [restoredVer, setRestoredVer] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRestore = (ver: number) => {
    appStore.restoreWorkflowVersion(workflowId, ver);
    setRestoredVer(ver);
    onRestore(ver);
    setTimeout(() => {
      setRestoredVer(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-ovra-border/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200 select-none">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950">Version History</h3>
            <p className="text-xs text-gray-500">
              Immutable snapshots published to this workspace.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {versions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No published versions yet. Click the orange "Publish" button to create version 1.
          </div>
        ) : (
          versions.map((v) => (
            <div
              key={v.versionNumber}
              className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-gray-900 text-white text-[11px] font-bold rounded-md">
                  v{v.versionNumber}.0
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(v.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-gray-700 font-medium">
                {v.notes || "Standard production release"}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-400" />
                  {v.publishedBy}
                </span>

                <button
                  onClick={() => handleRestore(v.versionNumber)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {restoredVer === v.versionNumber ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Restored</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3 text-gray-500" />
                      <span>Restore</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/70 text-[11px] text-gray-500 text-center">
        Restoring an older version creates an editable draft without overwriting production executions.
      </div>
    </div>
  );
}
