"use client";

import { X, Play, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { WorkflowNodeData } from "@/lib/types/workflow";

interface NodeInspectorModalProps {
  node: WorkflowNodeData | null;
  onClose: () => void;
  onRunSingleNode?: (nodeId: string) => void;
}

export function NodeInspectorModal({
  node,
  onClose,
  onRunSingleNode,
}: NodeInspectorModalProps) {
  if (!node) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-ovra-border/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-5 border-b border-gray-200/80 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-950">
              {node.label}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
              {node.type}
            </span>
          </div>
          <span className="text-xs text-gray-500">{node.subtitle}</span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Execution Status Card */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-medium">Status</span>
            <div className="flex items-center gap-1.5 font-semibold capitalize">
              {node.status === "success" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Success</span>
                </>
              )}
              {node.status === "running" && (
                <span className="text-ovra-orange">Running...</span>
              )}
              {node.status === "idle" && (
                <span className="text-gray-500">Idle (Ready)</span>
              )}
              {node.status === "skipped" && (
                <span className="text-gray-400">Skipped</span>
              )}
            </div>
          </div>

          {node.executionDurationMs && (
            <div className="flex items-center justify-between text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </span>
              <span className="font-mono text-gray-800">
                {node.executionDurationMs} ms
              </span>
            </div>
          )}
        </div>

        {/* Node Parameters / Config */}
        <div>
          <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
            Configuration
          </h4>
          <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto">
            <pre>
              {JSON.stringify(node.config || { mode: "default" }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Input Payload */}
        {node.inputs && (
          <div>
            <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
              Step Input Payload
            </h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 overflow-x-auto max-h-48">
              <pre>{JSON.stringify(node.inputs, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Output Payload */}
        {node.outputs && (
          <div>
            <h4 className="font-bold text-emerald-900 mb-2 uppercase tracking-wider text-[11px]">
              Step Output Payload
            </h4>
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-950 overflow-x-auto max-h-48">
              <pre>{JSON.stringify(node.outputs, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-gray-200/80 bg-gray-50/60 flex items-center justify-between">
        <button
          onClick={() => onRunSingleNode?.(node.id)}
          className="w-full py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-900 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-gray-900" />
          Test Step Solo
        </button>
      </div>
    </div>
  );
}
