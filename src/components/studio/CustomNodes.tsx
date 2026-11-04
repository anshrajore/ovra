"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Zap,
  Sparkles,
  GitBranch,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface BaseNodeData {
  label: string;
  subtitle: string;
  status?: "idle" | "running" | "success" | "failed" | "skipped";
  durationMs?: number;
}

// 1. Webhook Trigger Node
export const WebhookNode = memo(({ data }: { data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isRunning
          ? "border-ovra-orange ring-4 ring-ovra-orange/15 shadow-md"
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Left Circular Icon Badge */}
        <div className="w-10 h-10 rounded-full bg-[#FFF5ED] border border-orange-200/80 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-ovra-orange fill-ovra-orange" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || "Webhook"}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isRunning && (
              <Loader2 className="w-3.5 h-3.5 text-ovra-orange animate-spin" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.subtitle || "New lead received"}
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-ovra-orange"
      />
    </div>
  );
});
WebhookNode.displayName = "WebhookNode";

// 2. AI Agent Node
export const AIAgentNode = memo(({ data }: { data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isRunning
          ? "border-purple-500 ring-4 ring-purple-500/15 shadow-md"
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-purple-600"
      />

      <div className="flex items-center gap-3">
        {/* Left Circular Icon Badge */}
        <div className="w-10 h-10 rounded-full bg-[#F6F2FF] border border-purple-200/80 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-purple-600 fill-purple-600" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || "AI Agent"}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isRunning && (
              <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.subtitle || "Qualify the lead"}
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-purple-600"
      />
    </div>
  );
});
AIAgentNode.displayName = "AIAgentNode";

// 3. IF Conditional Branching Node (With Yes and No handles!)
export const IFNode = memo(({ data }: { data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isRunning
          ? "border-amber-500 ring-4 ring-amber-500/15 shadow-md"
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-amber-600"
      />

      <div className="flex items-center gap-3">
        {/* Left Circular Icon Badge */}
        <div className="w-10 h-10 rounded-full bg-[#FFFBEB] border border-amber-200/80 flex items-center justify-center shrink-0">
          <GitBranch className="w-4 h-4 text-amber-700" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || "IF"}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isRunning && (
              <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.subtitle || "Score >= 0.7"}
          </span>
        </div>
      </div>

      {/* Branch 1: Yes (Top Right) */}
      <div className="absolute -right-8 top-1.5 flex items-center gap-1">
        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800 rounded-full shadow-2xs">
          Yes
        </span>
        <Handle
          type="source"
          id="yes"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white hover:!scale-125 transition-transform"
          style={{ top: "18px" }}
        />
      </div>

      {/* Branch 2: No (Bottom Right) */}
      <div className="absolute -right-7 bottom-1.5 flex items-center gap-1">
        <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-[10px] font-bold text-rose-800 rounded-full shadow-2xs">
          No
        </span>
        <Handle
          type="source"
          id="no"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !bg-rose-500 !border-2 !border-white hover:!scale-125 transition-transform"
          style={{ bottom: "18px" }}
        />
      </div>
    </div>
  );
});
IFNode.displayName = "IFNode";

// 4. Slack Action Node
export const SlackNode = memo(({ data }: { data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isSkipped = data.status === "skipped";

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isSkipped
          ? "opacity-40 grayscale border-dashed border-gray-300"
          : isRunning
          ? "border-emerald-500 ring-4 ring-emerald-500/15 shadow-md"
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-emerald-600"
      />

      <div className="flex items-center gap-3">
        {/* Slack Logo Icon */}
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-2xs flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#E01E5A"
              d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
            />
            <path
              fill="#36C5F0"
              d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
            />
            <path
              fill="#2EB67D"
              d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
            />
            <path
              fill="#ECB22E"
              d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || "Slack"}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isRunning && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.subtitle || "Notify Sales Team"}
          </span>
        </div>
      </div>
    </div>
  );
});
SlackNode.displayName = "SlackNode";

// 5. Email Action Node
export const EmailNode = memo(({ data }: { data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isSkipped = data.status === "skipped";

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isSkipped
          ? "opacity-40 grayscale border-dashed border-gray-300"
          : isRunning
          ? "border-orange-500 ring-4 ring-orange-500/15 shadow-md"
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-orange-600"
      />

      <div className="flex items-center gap-3">
        {/* Email Icon */}
        <div className="w-10 h-10 rounded-full bg-[#FFF5ED] border border-orange-200/80 flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-ovra-orange" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || "Email"}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isRunning && (
              <Loader2 className="w-3.5 h-3.5 text-ovra-orange animate-spin" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            {data.subtitle || "Send Nurture Email"}
          </span>
        </div>
      </div>
    </div>
  );
});
EmailNode.displayName = "EmailNode";

// 6. Universal Node for all Foundation and Dynamic OpenAPI Nodes
export const UniversalCanvasNode = memo(({ id, type, data }: { id: string; type: string; data: BaseNodeData }) => {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isFailed = data.status === "failed";
  const isSkipped = data.status === "skipped";

  // Determine kind from node type
  const isTrigger = type.includes("trigger") || type.includes("webhook") || type.includes("schedule");
  const isLogic = type.includes("logic") || type.includes("switch") || type.includes("if");
  const isAi = type.includes("ai") || type.includes("model") || type.includes("agent");
  const isData = type.includes("data") || type.includes("json") || type.includes("fields");
  const isDb = type.includes("db") || type.includes("postgres") || type.includes("sheets");

  // Determine accent color and border
  const getTheme = () => {
    if (isTrigger) return { bg: "bg-[#FFF5ED]", border: "border-orange-200/80", text: "text-ovra-orange", ring: "ring-ovra-orange/15" };
    if (isAi) return { bg: "bg-[#F6F2FF]", border: "border-purple-200/80", text: "text-purple-600", ring: "ring-purple-500/15" };
    if (isLogic) return { bg: "bg-[#FFFBEB]", border: "border-amber-200/80", text: "text-amber-600", ring: "ring-amber-500/15" };
    if (isDb) return { bg: "bg-[#EFF6FF]", border: "border-blue-200/80", text: "text-blue-600", ring: "ring-blue-500/15" };
    if (isData) return { bg: "bg-[#ECFDF5]", border: "border-emerald-200/80", text: "text-emerald-600", ring: "ring-emerald-500/15" };
    return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", ring: "ring-gray-300" };
  };

  const theme = getTheme();

  return (
    <div
      className={`relative px-4 py-3 bg-white rounded-2xl border transition-all duration-300 min-w-[210px] shadow-soft select-none ${
        isSkipped
          ? "opacity-40 grayscale border-dashed border-gray-300"
          : isRunning
          ? `border-ovra-orange ring-4 ${theme.ring} shadow-md`
          : isSuccess
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : isFailed
          ? "border-rose-400 ring-2 ring-rose-100"
          : "border-gray-200/90 hover:border-gray-300"
      }`}
    >
      {/* Input Handle (if not trigger) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-ovra-orange"
        />
      )}

      <div className="flex items-center gap-3">
        {/* Left Circular Icon Badge */}
        <div className={`w-10 h-10 rounded-full ${theme.bg} border ${theme.border} flex items-center justify-center shrink-0`}>
          <Zap className={`w-4 h-4 ${theme.text}`} />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-950 tracking-tight">
              {data.label || type}
            </span>
            {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            {isFailed && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
            {isRunning && <Loader2 className="w-3.5 h-3.5 text-ovra-orange animate-spin" />}
          </div>
          <span className="text-[11px] text-gray-500 font-medium truncate max-w-[130px]">
            {data.subtitle || type}
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white hover:!bg-ovra-orange"
      />
    </div>
  );
});
UniversalCanvasNode.displayName = "UniversalCanvasNode";

const baseNodeTypes: Record<string, any> = {
  "core.webhook": WebhookNode,
  "ai.agent": AIAgentNode,
  "logic.if": IFNode,
  "comm.slack": SlackNode,
  "comm.email": EmailNode,
  "core.manual_trigger": UniversalCanvasNode,
  "core.schedule": UniversalCanvasNode,
  "core.http_request": UniversalCanvasNode,
  "logic.switch": UniversalCanvasNode,
  "logic.merge": UniversalCanvasNode,
  "logic.loop": UniversalCanvasNode,
  "data.set_fields": UniversalCanvasNode,
  "data.json_parser": UniversalCanvasNode,
  "ai.model": UniversalCanvasNode,
  "app.google_sheets": UniversalCanvasNode,
  "db.postgres": UniversalCanvasNode,
};

// Proxy to guarantee any custom connector or OpenAPI node dynamically renders without React Flow errors
export const nodeTypes = new Proxy(baseNodeTypes, {
  get: (target, prop: string) => {
    if (prop in target) {
      return target[prop];
    }
    return UniversalCanvasNode;
  },
});

