"use client";

import { useState, useEffect } from "react";
import {
  X,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Sparkles,
  Sliders,
  Database,
  Mail,
  MessageSquare,
  GitBranch,
  Webhook as WebhookIcon,
  Loader2,
  Check,
} from "lucide-react";
import { WorkflowNodeData } from "@/lib/types/workflow";
import { nodeRegistry, SchemaHelper } from "@/lib/node-platform";
import { DynamicNodeConfigForm } from "./DynamicNodeConfigForm";

interface NodeInspectorModalProps {
  node: WorkflowNodeData | null;
  onClose: () => void;
  onUpdateConfig?: (nodeId: string, updatedConfig: Record<string, any>) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onRunSingleNode?: (nodeId: string) => Promise<void> | void;
}

export function NodeInspectorModal({
  node,
  onClose,
  onUpdateConfig,
  onDuplicateNode,
  onDeleteNode,
  onRunSingleNode,
}: NodeInspectorModalProps) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"params" | "io" | "json">("params");
  const [isTesting, setIsTesting] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (node) {
      const def = nodeRegistry.getNode(node.type);
      const defaultConfig = def?.manifest.configSchema
        ? SchemaHelper.getDefaultConfig(def.manifest.configSchema)
        : getDefaultConfig(node.type);
      setConfig(node.config && Object.keys(node.config).length > 0 ? node.config : defaultConfig);
    }
  }, [node]);

  if (!node) return null;

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateConfig?.(node.id, updated);
  };

  const handleRunSolo = async () => {
    setIsTesting(true);
    try {
      if (onRunSingleNode) {
        await onRunSingleNode(node.id);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-ovra-border/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/80 bg-[#FAF7F2]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white border border-gray-200/80 shadow-2xs flex items-center justify-center text-gray-800">
              {getNodeIcon(node.type)}
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                {node.label}
              </h3>
              <span className="text-[11px] text-gray-500 font-mono">
                {node.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateNode?.(node.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Duplicate Node (⌘D)"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete node "${node.label}"?`)) {
                  onDeleteNode?.(node.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Node (Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold mt-3">
          <button
            onClick={() => setActiveTab("params")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === "params"
                ? "bg-white text-gray-950 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab("io")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === "io"
                ? "bg-white text-gray-950 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Data (I/O)
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === "json"
                ? "bg-white text-gray-950 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Status card */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">State:</span>
            <div className="flex items-center gap-1.5 font-semibold capitalize">
              {node.status === "success" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Success</span>
                </>
              )}
              {node.status === "running" && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-ovra-orange animate-spin" />
                  <span className="text-ovra-orange">Running</span>
                </>
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
            <div className="flex items-center gap-1 text-gray-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{node.executionDurationMs}ms</span>
            </div>
          )}
        </div>

        {/* Tab 1: Parameters Form */}
        {activeTab === "params" && (
          <div className="space-y-4">
            {nodeRegistry.getNode(node.type)?.manifest.configSchema ? (
              <DynamicNodeConfigForm
                schema={nodeRegistry.getNode(node.type)!.manifest.configSchema!}
                config={config}
                onChange={handleFieldChange}
              />
            ) : (
              <NodeParameterEditor
                type={node.type}
                config={config}
                onChange={handleFieldChange}
              />
            )}
          </div>
        )}

        {/* Tab 2: Inputs & Outputs */}
        {activeTab === "io" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Step Input Payload
                </span>
                <button
                  onClick={() => copyToClipboard(node.inputs || {})}
                  className="text-gray-500 hover:text-gray-900 text-[10px] flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 overflow-x-auto max-h-48">
                <pre>{JSON.stringify(node.inputs || { message: "No execution input recorded yet. Run a test!" }, null, 2)}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                  Step Output Payload
                </span>
                <button
                  onClick={() => copyToClipboard(node.outputs || {})}
                  className="text-gray-500 hover:text-gray-900 text-[10px] flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-950 overflow-x-auto max-h-48">
                <pre>{JSON.stringify(node.outputs || { message: "No execution output recorded yet. Run a test!" }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Raw JSON */}
        {activeTab === "json" && (
          <div className="space-y-2">
            <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Node Object Specification
            </span>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96">
              <pre>{JSON.stringify(node, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-gray-200/80 bg-gray-50/70 flex items-center gap-2">
        <button
          onClick={handleRunSolo}
          disabled={isTesting}
          className="flex-1 py-2 bg-gray-950 hover:bg-black text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ovra-orange" />
              <span>Simulating Step...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Test Step Solo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Subcomponent: Parameter fields by node type
function NodeParameterEditor({
  type,
  config,
  onChange,
}: {
  type: string;
  config: Record<string, any>;
  onChange: (key: string, val: any) => void;
}) {
  if (type.includes("webhook")) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            HTTP Method
          </label>
          <select
            value={config.method || "POST"}
            onChange={(e) => onChange("method", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          >
            <option value="POST">POST (Inbound payload)</option>
            <option value="GET">GET (Query string)</option>
            <option value="PUT">PUT</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Webhook URL Path
          </label>
          <input
            type="text"
            value={config.path || "/api/v1/webhooks/razorpay-event"}
            onChange={(e) => onChange("path", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-ovra-orange outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Authentication
          </label>
          <select
            value={config.authType || "none"}
            onChange={(e) => onChange("authType", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          >
            <option value="none">No Auth (Public Webhook)</option>
            <option value="bearer">Bearer Token</option>
            <option value="hmac">HMAC Signature (SHA256)</option>
          </select>
        </div>
      </div>
    );
  }

  if (type.includes("ai_agent")) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Model Engine
          </label>
          <select
            value={config.model || "gemini-2.5-pro"}
            onChange={(e) => onChange("model", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          >
            <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Recommended)</option>
            <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast)</option>
            <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            System Instructions / Prompt
          </label>
          <textarea
            rows={4}
            value={config.systemPrompt || "Analyze inbound order data and verify risk scoring. Determine if customer should receive instant refund or flagged for review."}
            onChange={(e) => onChange("systemPrompt", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none resize-none font-mono"
            placeholder="Describe what the agent should do..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-700 font-semibold">Temperature</label>
            <span className="font-mono text-gray-600">{config.temperature ?? 0.2}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.temperature ?? 0.2}
            onChange={(e) => onChange("temperature", parseFloat(e.target.value))}
            className="w-full accent-ovra-orange"
          />
        </div>
      </div>
    );
  }

  if (type.includes("if_condition") || type.includes("logic")) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Field to Evaluate
          </label>
          <input
            type="text"
            value={config.field || "riskScore"}
            onChange={(e) => onChange("field", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-ovra-orange outline-none"
            placeholder="e.g. outputs.riskScore"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Comparison Operator
          </label>
          <select
            value={config.operator || "greater_than"}
            onChange={(e) => onChange("operator", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          >
            <option value="greater_than">Is greater than (&gt;)</option>
            <option value="less_than">Is less than (&lt;)</option>
            <option value="equals">Equals (===)</option>
            <option value="contains">Contains substring</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Target Value
          </label>
          <input
            type="text"
            value={config.threshold || "75"}
            onChange={(e) => onChange("threshold", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-ovra-orange outline-none"
          />
        </div>
      </div>
    );
  }

  if (type.includes("slack")) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Slack Channel
          </label>
          <input
            type="text"
            value={config.channel || "#high-risk-alerts"}
            onChange={(e) => onChange("channel", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:border-ovra-orange outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Notification Message
          </label>
          <textarea
            rows={3}
            value={config.message || "🚨 Urgent: High risk transaction detected for customer {{customerId}}. Amount: ₹{{amount}}."}
            onChange={(e) => onChange("message", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none resize-none font-mono"
          />
        </div>
      </div>
    );
  }

  if (type.includes("email")) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            value={config.recipient || "founder@startup.in"}
            onChange={(e) => onChange("recipient", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Subject Line
          </label>
          <input
            type="text"
            value={config.subject || "Order Confirmation & Invoice"}
            onChange={(e) => onChange("subject", e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Template Body
          </label>
          <textarea
            rows={3}
            value={config.body || "Dear {{name}},\n\nYour order #{{orderId}} was successfully processed."}
            onChange={(e) => onChange("body", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none resize-none font-mono"
          />
        </div>
      </div>
    );
  }

  // Generic fallback editor
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Custom Parameter
        </label>
        <input
          type="text"
          value={config.endpoint || ""}
          onChange={(e) => onChange("endpoint", e.target.value)}
          placeholder="https://api.service.com/action"
          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:border-ovra-orange outline-none"
        />
      </div>
    </div>
  );
}

function getNodeIcon(type: string) {
  if (type.includes("webhook")) return <WebhookIcon className="w-4 h-4 text-emerald-600" />;
  if (type.includes("ai")) return <Sparkles className="w-4 h-4 text-purple-600" />;
  if (type.includes("if") || type.includes("logic")) return <GitBranch className="w-4 h-4 text-amber-600" />;
  if (type.includes("slack")) return <MessageSquare className="w-4 h-4 text-[#4A154B]" />;
  if (type.includes("email")) return <Mail className="w-4 h-4 text-blue-600" />;
  return <Database className="w-4 h-4 text-gray-600" />;
}

function getDefaultConfig(type: string): Record<string, any> {
  if (type.includes("webhook")) return { method: "POST", path: "/api/v1/webhooks/razorpay-event", authType: "none" };
  if (type.includes("ai")) return { model: "gemini-2.5-pro", temperature: 0.2, systemPrompt: "Analyze risk" };
  if (type.includes("if")) return { field: "riskScore", operator: "greater_than", threshold: "75" };
  if (type.includes("slack")) return { channel: "#high-risk-alerts", message: "Urgent alert" };
  if (type.includes("email")) return { recipient: "founder@startup.in", subject: "Automated notification" };
  return {};
}
