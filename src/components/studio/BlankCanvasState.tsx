"use client";

import React from "react";
import { Plus, LayoutGrid, Upload, Sparkles, ArrowRight } from "lucide-react";

interface BlankCanvasStateProps {
  onCreateBlank: () => void;
  onExploreTemplates: () => void;
  onImportJSON: () => void;
}

export function BlankCanvasState({
  onCreateBlank,
  onExploreTemplates,
  onImportJSON,
}: BlankCanvasStateProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 pointer-events-none">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 shadow-2xl shadow-gray-900/5 text-center pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#2342FF] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sovereign Workflow Canvas</span>
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-xl font-bold text-gray-950 tracking-tight mb-2">
          Build your first workflow
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed mb-6 max-w-md mx-auto">
          Start from a clean canvas, browse battle-tested production templates, or import an existing workflow JSON to orchestrate your AI agents and connectors.
        </p>

        {/* Action Buttons Grid */}
        <div className="space-y-2.5 text-left">
          {/* 1. Primary: Create Blank Workflow */}
          <button
            type="button"
            onClick={onCreateBlank}
            className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-[#2342FF] hover:bg-[#1A35DB] text-white shadow-sm hover:shadow transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-tight">Create Blank Workflow</div>
                <div className="text-[11px] text-white/80">Start clean with a starter manual trigger node</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 2. Secondary: Explore Templates */}
          <button
            type="button"
            onClick={onExploreTemplates}
            className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-900 transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-700">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-tight">Explore Templates</div>
                <div className="text-[11px] text-gray-500">Pick pre-built AI, Slack, or payment triage flows</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 3. Tertiary: Import Workflow JSON */}
          <button
            type="button"
            onClick={onImportJSON}
            className="w-full group flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-900 transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-700">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-tight">Import Workflow JSON</div>
                <div className="text-[11px] text-gray-500">Upload a exported workflow or schema file</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Footer Shortcut Tip */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
          Pro-tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono text-[10px] text-gray-600">Cmd + K</kbd> anywhere to open the action palette.
        </div>
      </div>
    </div>
  );
}
