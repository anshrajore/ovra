"use client";

import { useState } from "react";
import {
  X,
  Search,
  Zap,
  Sparkles,
  GitBranch,
  Mail,
  Database,
  CreditCard,
  MessageSquare,
  FileSpreadsheet,
  Globe,
  Clock,
  Plus,
} from "lucide-react";
import { NodeType, WorkflowNodeData } from "@/lib/types/workflow";

interface NodeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: WorkflowNodeData) => void;
}

export function NodeLibraryModal({
  isOpen,
  onClose,
  onAddNode,
}: NodeLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Nodes" },
    { id: "triggers", label: "Triggers" },
    { id: "ai", label: "AI & Agents" },
    { id: "logic", label: "Logic & Flow" },
    { id: "comm", label: "Communication" },
    { id: "data", label: "Databases & Finance" },
  ];

  const availableNodes = [
    {
      type: "core.webhook" as NodeType,
      category: "triggers",
      label: "Webhook",
      subtitle: "Trigger on inbound HTTP POST / webhook",
      icon: Zap,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      type: "ai.agent" as NodeType,
      category: "ai",
      label: "AI Agent",
      subtitle: "Autonomous reasoning and tool execution",
      icon: Sparkles,
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      type: "logic.if" as NodeType,
      category: "logic",
      label: "IF Condition",
      subtitle: "Branch workflow based on logical expression",
      icon: GitBranch,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      type: "comm.slack" as NodeType,
      category: "comm",
      label: "Slack Alert",
      subtitle: "Send formatted message to a channel or DM",
      icon: MessageSquare,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      type: "comm.email" as NodeType,
      category: "comm",
      label: "Send Email",
      subtitle: "Deliver transactional or marketing emails",
      icon: Mail,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      type: "comm.whatsapp" as NodeType,
      category: "comm",
      label: "WhatsApp Business",
      subtitle: "Send template message via Cloud API",
      icon: MessageSquare,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      type: "finance.razorpay" as NodeType,
      category: "data",
      label: "Razorpay",
      subtitle: "Verify payments, create orders & refunds",
      icon: CreditCard,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      type: "db.postgres" as NodeType,
      category: "data",
      label: "PostgreSQL",
      subtitle: "Execute safe SQL queries and mutations",
      icon: Database,
      badgeColor: "bg-indigo-100 text-indigo-700",
    },
    {
      type: "google.sheets" as NodeType,
      category: "data",
      label: "Google Sheets",
      subtitle: "Append row or lookup spreadsheet records",
      icon: FileSpreadsheet,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
  ];

  const filteredNodes = availableNodes.filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(search.toLowerCase()) ||
      node.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || node.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectNode = (template: (typeof availableNodes)[0]) => {
    const newNode: WorkflowNodeData = {
      id: `node_${Date.now()}`,
      type: template.type,
      label: template.label,
      subtitle: template.subtitle,
      status: "idle",
      config: {},
    };
    onAddNode(newNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-950">Node Library</h3>
            <p className="text-xs text-gray-500">
              Select an integration or logic node to add to your canvas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search triggers, AI, databases, notifications..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-ovra-orange"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#1E1F24] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNodes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleSelectNode(item)}
                className="w-full p-3 rounded-2xl border border-gray-200/80 hover:border-ovra-orange/50 hover:bg-orange-50/20 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.badgeColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-ovra-orange transition-colors">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-gray-500">{item.subtitle}</p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-ovra-orange group-hover:text-white flex items-center justify-center text-gray-500 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
