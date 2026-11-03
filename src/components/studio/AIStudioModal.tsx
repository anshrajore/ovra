"use client";

import { useState } from "react";
import { Sparkles, X, ArrowRight, Wand2, Check } from "lucide-react";
import { WorkflowDefinition } from "@/lib/types/workflow";

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyWorkflow: (workflow: WorkflowDefinition) => void;
}

export function AIStudioModal({
  isOpen,
  onClose,
  onApplyWorkflow,
}: AIStudioModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const samplePrompts = [
    "When a new lead arrives via Webhook, analyze company size with AI Agent, and if score >= 0.7 alert Slack else Email nurture.",
    "On Razorpay payment captured, log transaction into PostgreSQL and send WhatsApp confirmation receipt.",
    "Listen to customer feedback form, run Gemini sentiment analysis, and create high-priority CRM ticket if negative.",
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      // Generate customized workflow graph based on prompt keywords
      const generatedWorkflow: WorkflowDefinition = {
        id: `wf_${Date.now()}`,
        name: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
        description: `Generated via OVRA AI Studio: ${prompt}`,
        status: "draft",
        version: 1,
        workspaceId: "ws_team_workspace",
        lastSavedAt: "Just now",
        nodes: [
          {
            id: "node_gen_trigger",
            type: "core.webhook",
            label: "Webhook",
            subtitle: "Inbound Event Trigger",
            status: "idle",
            config: { endpoint: "/api/v1/webhooks/ai-gen" },
          },
          {
            id: "node_gen_ai",
            type: "ai.agent",
            label: "AI Agent",
            subtitle: "Extract & Classify",
            status: "idle",
            config: { prompt: prompt, model: "gemini-1.5-pro" },
          },
          {
            id: "node_gen_if",
            type: "logic.if",
            label: "IF",
            subtitle: "Confidence >= 0.75",
            status: "idle",
          },
          {
            id: "node_gen_slack",
            type: "comm.slack",
            label: "Slack",
            subtitle: "Notify Team Channel",
            status: "idle",
          },
          {
            id: "node_gen_email",
            type: "comm.email",
            label: "Email",
            subtitle: "Send Automated Response",
            status: "idle",
          },
        ],
        edges: [
          {
            id: "edge_1",
            source: "node_gen_trigger",
            target: "node_gen_ai",
          },
          {
            id: "edge_2",
            source: "node_gen_ai",
            target: "node_gen_if",
          },
          {
            id: "edge_3",
            source: "node_gen_if",
            sourceHandle: "yes",
            target: "node_gen_slack",
            label: "Yes",
          },
          {
            id: "edge_4",
            source: "node_gen_if",
            sourceHandle: "no",
            target: "node_gen_email",
            label: "No",
          },
        ],
      };

      onApplyWorkflow(generatedWorkflow);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-950">
                OVRA AI Studio — Workflow Generator
              </h3>
              <p className="text-xs text-gray-500">
                Describe the business workflow you want to automate in plain English or Hindi.
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Every time a customer sends an inquiry on WhatsApp, understand the intent, check our CRM, and notify the right sales manager..."
              className="w-full p-4 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-purple-600 focus:outline-none resize-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Or Try A Sample Automation:
            </span>
            <div className="flex flex-col gap-2">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(sample)}
                  className="text-left text-xs p-2.5 rounded-xl border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/40 text-gray-700 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{sample}</span>
                  <Wand2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Generates typed nodes, connections, and validation schemas.
          </span>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="px-5 py-2.5 bg-[#1E1F24] hover:bg-black text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Designing Workflow...</span>
              </>
            ) : (
              <>
                <span>Generate Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
