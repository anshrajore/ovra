"use client";

import { useState } from "react";
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
} from "lucide-react";

interface CanvasHeaderProps {
  workflowName: string;
  onUpdateName?: (name: string) => void;
  onTestRun?: () => void;
  onOpenCode?: () => void;
  onOpenHistory?: () => void;
  onPublish?: () => void;
  isRunning?: boolean;
}

export function CanvasHeader({
  workflowName,
  onUpdateName,
  onTestRun,
  onOpenCode,
  onOpenHistory,
  onPublish,
  isRunning = false,
}: CanvasHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflowName);
  const [isPublished, setIsPublished] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdateName) onUpdateName(name);
  };

  const handlePublish = () => {
    setIsPublished(true);
    if (onPublish) onPublish();
    setTimeout(() => setIsPublished(false), 3000);
  };

  return (
    <div className="h-14 px-6 bg-white/90 backdrop-blur-md border-b border-ovra-border/60 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Back button, Title & Status */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors"
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
              className="text-base font-bold text-gray-950 bg-gray-100 px-2 py-0.5 rounded border border-ovra-orange outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-base font-bold text-gray-950 tracking-tight">
                {name}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </div>

          {/* Saved indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Cloud className="w-3.5 h-3.5 text-gray-400" />
            <span>Saved 2 min ago</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Code / JSON Viewer */}
        <button
          onClick={onOpenCode}
          title="View Compiled Workflow JSON"
          className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-200/80 rounded-full transition-colors"
        >
          <Code2 className="w-4 h-4" />
        </button>

        {/* History */}
        <button
          onClick={onOpenHistory}
          title="Execution History & Logs"
          className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 border border-gray-200/80 rounded-full transition-colors"
        >
          <History className="w-4 h-4" />
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
              <span>Published!</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 fill-white/20" />
              <span>Publish</span>
            </>
          )}
        </button>

        {/* More Options */}
        <button className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
