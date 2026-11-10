"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  Wand2,
  Check,
  Plus,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { WorkflowDefinition, WorkflowNodeData, WorkflowConnection } from "@/lib/types/workflow";

export interface WorkflowPatch {
  patchId: string;
  summary: string;
  rationale: string;
  addNodes: WorkflowNodeData[];
  addEdges: WorkflowConnection[];
  removeNodeIds?: string[];
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkflow: WorkflowDefinition;
  isExecutionRunning?: boolean;
  onApplyPatch: (patch: WorkflowPatch) => void;
}

export function AIAssistantDrawer({
  isOpen,
  onClose,
  activeWorkflow,
  isExecutionRunning = false,
  onApplyPatch,
}: AIAssistantDrawerProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposedPatch, setProposedPatch] = useState<WorkflowPatch | null>(null);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; content: string; patch?: WorkflowPatch }>
  >([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the OVRA In-Canvas AI Assistant. I can generate nodes, connect branching logic, and optimize your active pipeline. Your canvas and active executions will not be interrupted.",
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Append customer data to Google Sheets",
    "Branch on risk score with IF condition",
    "Send failure alert to Slack on error",
    "Add Resend / SendGrid email step",
  ];

  const handleGenerate = (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    const userMsgId = `usr_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: textToUse },
    ]);
    if (!customPrompt) setPrompt("");
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      const timestamp = Date.now();
      let patch: WorkflowPatch;

      const lower = textToUse.toLowerCase();

      if (lower.includes("sheet") || lower.includes("google")) {
        const newNode: WorkflowNodeData = {
          id: `node_sheets_${timestamp}`,
          type: "app.google_sheets",
          label: "Google Sheets",
          subtitle: "Append row to Spreadsheet",
          status: "idle",
          config: {
            operation: "append_row",
            spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
            sheetName: "Sheet1",
            values: { name: "{{name}}", email: "{{email}}", score: "{{score}}" },
          },
        };

        const lastNode = activeWorkflow.nodes[activeWorkflow.nodes.length - 1];
        const newEdge: WorkflowConnection = {
          id: `edge_${timestamp}`,
          source: lastNode ? lastNode.id : "start",
          target: newNode.id,
        };

        patch = {
          patchId: `patch_${timestamp}`,
          summary: "Add Google Sheets Append Row Node",
          rationale: "Inserts an authenticated Google Sheets v4 connector to stream row data directly to spreadsheet.",
          addNodes: [newNode],
          addEdges: lastNode ? [newEdge] : [],
        };
      } else if (lower.includes("slack")) {
        const newNode: WorkflowNodeData = {
          id: `node_slack_${timestamp}`,
          type: "comm.slack",
          label: "Slack Alert",
          subtitle: "Post to #security-alerts",
          status: "idle",
          config: {
            channel: "#security-alerts",
            message: "⚠️ Alert triggered: {{_error.message || 'Workflow exception detected'}}",
          },
        };

        const lastNode = activeWorkflow.nodes[activeWorkflow.nodes.length - 1];
        const newEdge: WorkflowConnection = {
          id: `edge_${timestamp}`,
          source: lastNode ? lastNode.id : "start",
          target: newNode.id,
        };

        patch = {
          patchId: `patch_${timestamp}`,
          summary: "Add Slack Alert Dispatcher",
          rationale: "Dispatches high-priority incident notifications to designated operational channel.",
          addNodes: [newNode],
          addEdges: lastNode ? [newEdge] : [],
        };
      } else if (lower.includes("email") || lower.includes("sendgrid") || lower.includes("resend")) {
        const newNode: WorkflowNodeData = {
          id: `node_email_${timestamp}`,
          type: "comm.email",
          label: "Email Delivery",
          subtitle: "Send via Resend / SendGrid",
          status: "idle",
          config: {
            to: "{{email}}",
            subject: "Notification: Pipeline Execution Update",
            provider: "resend",
          },
        };

        const lastNode = activeWorkflow.nodes[activeWorkflow.nodes.length - 1];
        const newEdge: WorkflowConnection = {
          id: `edge_${timestamp}`,
          source: lastNode ? lastNode.id : "start",
          target: newNode.id,
        };

        patch = {
          patchId: `patch_${timestamp}`,
          summary: "Add Email Delivery Node",
          rationale: "Configures REST-based outbound email dispatch with AST template interpolation.",
          addNodes: [newNode],
          addEdges: lastNode ? [newEdge] : [],
        };
      } else {
        // General AI / IF branching logic
        const ifNode: WorkflowNodeData = {
          id: `node_if_${timestamp}`,
          type: "logic.if",
          label: "Filter Score >= 0.8",
          subtitle: "Branch on criteria",
          status: "idle",
          config: {
            field: "score",
            operator: "greater_than_or_equal",
            value: 0.8,
          },
        };

        const lastNode = activeWorkflow.nodes[activeWorkflow.nodes.length - 1];
        const newEdge: WorkflowConnection = {
          id: `edge_${timestamp}`,
          source: lastNode ? lastNode.id : "start",
          target: ifNode.id,
        };

        patch = {
          patchId: `patch_${timestamp}`,
          summary: "Add Decision Branching Gate",
          rationale: "Evaluates items dynamically and routes positive matches to 'true' port.",
          addNodes: [ifNode],
          addEdges: lastNode ? [newEdge] : [],
        };
      }

      setProposedPatch(patch);
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: "assistant",
          content: `I've generated a draft patch based on your request: "${patch.summary}". Inspect the diff below and click "Apply to Draft" when ready.`,
          patch,
        },
      ]);
    }, 600);
  };

  const handleApply = (patch: WorkflowPatch) => {
    onApplyPatch(patch);
    setProposedPatch(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `applied_${Date.now()}`,
        role: "assistant",
        content: `✓ Successfully applied patch "${patch.summary}" to canvas draft revision. Active runs remain isolated on their pinned snapshots.`,
      },
    ]);
  };

  return (
    <aside className="absolute right-0 top-0 bottom-0 w-96 lg:w-[420px] h-full bg-[#0D0F14] text-white border-l border-white/10 flex flex-col justify-between shrink-0 z-50 select-none shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111319]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2342FF] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
              <span>OVRA Copilot</span>
              {isExecutionRunning ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Run Active (Draft Mode)
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready (v{activeWorkflow.version || 1})
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50">In-Canvas Workflow Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#2342FF] text-white font-medium"
                  : "bg-white/5 border border-white/10 text-white/90"
              }`}
            >
              {msg.content}
            </div>

            {/* Render proposed patch card if present */}
            {msg.patch && (
              <div className="w-full mt-3 p-3.5 rounded-2xl bg-[#141720] border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-[#2342FF]" />
                    {msg.patch.summary}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{msg.patch.addNodes.length} Node
                  </span>
                </div>

                <p className="text-[11px] text-white/60 leading-normal">
                  {msg.patch.rationale}
                </p>

                {/* Diff Preview */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] font-mono">
                  {msg.patch.addNodes.map((n) => (
                    <div key={n.id} className="flex items-center gap-2 text-emerald-400">
                      <Plus className="w-3 h-3 shrink-0" />
                      <span className="text-white font-sans">{n.label}</span>
                      <span className="text-white/40 text-[10px]">({n.type})</span>
                    </div>
                  ))}
                  {msg.patch.addEdges.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-white/50 text-[10px]">
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      <span>Connect {e.source} → {e.target}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleApply(msg.patch!)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#2342FF] hover:bg-[#1A35DB] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply to Canvas
                  </button>
                  <button
                    onClick={() => setProposedPatch(null)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <Loader2 className="w-4 h-4 animate-spin text-[#2342FF]" />
            <span>Analyzing DAG topology & drafting patch...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-white/10 bg-[#0E1015] flex flex-wrap gap-1.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleGenerate(qp)}
            className="text-[10px] text-white/60 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
          >
            + {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-white/10 bg-[#111319]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-2xl p-1.5 focus-within:border-[#2342FF] transition-colors"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to modify workflow..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="p-2 rounded-xl bg-[#2342FF] hover:bg-[#1A35DB] disabled:opacity-40 text-white transition-all shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
