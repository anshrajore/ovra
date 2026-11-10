"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Play,
  Cloud,
  Code2,
  History,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Copy,
  Download,
  Upload,
  Trash2,
  Activity,
  AlertCircle,
} from "lucide-react";
import { appStore } from "@/lib/store/app-store";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";
import { ActivityDrawer } from "./ActivityDrawer";

interface CanvasHeaderProps {
  workflowId: string;
  workflowName: string;
  workflowVersion: number;
  workflowStatus?: "active" | "draft" | "archived" | "paused";
  nodesCount?: number;
  onPublish?: () => void;
  onUpdateName?: (name: string) => void;
  onTestRun?: () => void;
  onOpenCode?: () => void;
  onDuplicateWorkflow?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: () => void;
  onClearCanvas?: () => void;
  onDeleteWorkflow?: () => void;
  onRestoreVersion?: (ver: number) => void;
  saveStatus?: "saved" | "saving" | "unsaved";
  isRunning?: boolean;
}

export function CanvasHeader({
  workflowId,
  workflowName,
  workflowVersion,
  workflowStatus = "draft",
  nodesCount = 0,
  onPublish,
  onUpdateName,
  onTestRun,
  onOpenCode,
  onDuplicateWorkflow,
  onExportJSON,
  onImportJSON,
  onClearCanvas,
  onDeleteWorkflow,
  onRestoreVersion,
  saveStatus = "saved",
  isRunning = false,
}: CanvasHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflowName);
  const [isPublished, setIsPublished] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(workflowName);
  }, [workflowName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = () => {
    setIsEditing(false);
    if (name.trim() && name !== workflowName && onUpdateName) {
      onUpdateName(name.trim());
    }
  };

  const handlePublish = () => {
    if (nodesCount === 0) {
      alert("Cannot publish an empty workflow. Please add at least one node to your pipeline first.");
      return;
    }
    const newVer = appStore.publishWorkflowVersion(workflowId);
    onPublish?.();
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3000);
  };

  return (
    <>
      <div className="h-14 px-6 bg-white/95 backdrop-blur-md border-b border-ovra-border/60 flex items-center justify-between select-none z-20 shrink-0">
        {/* Left: Back button, Title & Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                autoFocus
                className="text-base font-bold text-gray-950 bg-gray-100 px-2 py-0.5 rounded border border-[#2342FF] outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-base font-bold text-gray-950 tracking-tight">
                  {name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity"
                  title="Rename Workflow"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Version & Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                workflowStatus === "active"
                  ? "bg-emerald-50 border-emerald-200/80 text-emerald-700"
                  : "bg-amber-50 border-amber-200/80 text-amber-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  workflowStatus === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              v{workflowVersion}.0 {workflowStatus === "active" ? "Active" : "Draft"}
            </div>

            {/* Dynamic Reactive Saved indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-ovra-orange animate-spin" />
                  <span className="text-ovra-orange">Saving...</span>
                </>
              ) : saveStatus === "unsaved" ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600">Unsaved edits (⌘S)</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-gray-400" />
                  <span>Saved just now</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Code / JSON Viewer */}
          <button
            onClick={onOpenCode}
            title="View Compiled Workflow JSON Contract"
            className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-200/80 rounded-full transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Version History Drawer Toggle */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="Version History & Restore"
            className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-200/80 rounded-full transition-colors"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Activity Log Drawer Toggle */}
          <button
            onClick={() => setIsActivityOpen(true)}
            title="Workspace Activity Audit"
            className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-200/80 rounded-full transition-colors"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Test Run Pill Button */}
          <button
            onClick={onTestRun}
            disabled={isRunning}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
              isRunning
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 hover:border-gray-400"
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-ovra-orange" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                <span>Test Run</span>
              </>
            )}
          </button>

          {/* Publish Pill Button */}
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-ovra-orange hover:bg-ovra-orange-dark text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
          >
            {isPublished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Published v{workflowVersion + 1}!</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 fill-white/20" />
                <span>Publish</span>
              </>
            )}
          </button>

          {/* More Options Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  <span>Rename Workflow</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDuplicateWorkflow?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Duplicate Workflow</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExportJSON?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onImportJSON?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  <span>Import JSON</span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (confirm("Clear all nodes and connections from the canvas?")) {
                      onClearCanvas?.();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 rounded-xl transition-colors font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Clear Canvas</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (confirm(`Permanently delete "${name}"?`)) {
                      onDeleteWorkflow?.();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Workflow</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        workflowId={workflowId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={(ver) => onRestoreVersion?.(ver)}
      />

      {/* Activity Log Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />
    </>
  );
}
