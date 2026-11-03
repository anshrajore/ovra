"use client";

import { useState } from "react";
import { X, Copy, Check, Download } from "lucide-react";
import { WorkflowDefinition } from "@/lib/types/workflow";

interface CodeModalProps {
  workflow: WorkflowDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export function CodeModal({ workflow, isOpen, onClose }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(workflow, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, "-")}-v${workflow.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#18191E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-ovra-orange" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Immutable Workflow JSON Contract
            </h3>
            <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-[10px] font-mono">
              Version {workflow.version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-300" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Code Body */}
        <div className="flex-1 overflow-auto p-6 bg-[#0E0F12] font-mono text-xs text-emerald-400 leading-relaxed">
          <pre>{jsonString}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#121316] text-[11px] text-gray-400 flex items-center justify-between">
          <span>
            Compatible with OVRA Bounded Simulator & Production Temporal Engine.
          </span>
          <span className="text-gray-500 font-mono">
            {workflow.nodes.length} nodes · {workflow.edges.length} edges
          </span>
        </div>
      </div>
    </div>
  );
}
