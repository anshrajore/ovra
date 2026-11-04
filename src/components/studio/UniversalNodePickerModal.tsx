"use client";

import { useState, useMemo } from "react";
import {
  X,
  Search,
  Plus,
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
  Layers,
  Star,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { nodeRegistry, NodeManifest } from "@/lib/node-platform";
import { WorkflowNodeData } from "@/lib/types/workflow";

interface UniversalNodePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: WorkflowNodeData) => void;
  onOpenOpenAPIImport?: () => void;
}

export function UniversalNodePickerModal({
  isOpen,
  onClose,
  onAddNode,
  onOpenOpenAPIImport,
}: UniversalNodePickerModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(["core.webhook", "ai.model", "logic.if"]));

  const categories = [
    { id: "all", label: "All Nodes" },
    { id: "triggers", label: "Triggers" },
    { id: "logic", label: "Logic & Flow" },
    { id: "ai", label: "AI & Agents" },
    { id: "communication", label: "Communication" },
    { id: "data", label: "Data Transformation" },
    { id: "databases", label: "Databases" },
    { id: "utilities", label: "HTTP & Utilities" },
  ];

  const searchResults = useMemo(() => {
    let results = nodeRegistry.searchNodes(search);

    if (activeCategory !== "all") {
      results = results.filter((r) => r.node.category === activeCategory);
    }

    return results;
  }, [search, activeCategory]);

  if (!isOpen) return null;

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectNode = (manifest: NodeManifest) => {
    const newNode: WorkflowNodeData = {
      id: `node_${Date.now()}`,
      type: manifest.id as any,
      label: manifest.name,
      subtitle: manifest.description,
      status: "idle",
      config: {},
    };
    onAddNode(newNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]/60">
          <div>
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-ovra-orange" />
              Universal Node Catalogue
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select an official connector, logic block, or import an external REST API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOpenAPIImport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOpenAPIImport();
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-ovra-orange" />
                Import OpenAPI
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by operation or application (e.g. 'Google Sheets', 'Webhook', 'SQL', 'Slack')..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-ovra-orange transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#1E1F24] text-white shadow-2xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Node Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {searchResults.length === 0 ? (
            <div className="p-10 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-gray-800">No nodes found</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Try searching for a different keyword or import a custom OpenAPI specification.
              </p>
            </div>
          ) : (
            searchResults.map(({ node, connector }) => {
              const isFav = favorites.has(node.id);
              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className="w-full p-3.5 rounded-2xl border border-gray-200/80 hover:border-ovra-orange/50 hover:bg-orange-50/20 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 shadow-2xs flex items-center justify-center shrink-0">
                      {getNodeIcon(node.category, node.id)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-ovra-orange transition-colors">
                          {node.name}
                        </h4>
                        {connector && (
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {connector.name}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          v{node.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                        {node.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(e, node.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? "text-amber-500 hover:text-amber-600"
                          : "text-gray-300 hover:text-gray-500"
                      }`}
                      title={isFav ? "Remove Favorite" : "Add Favorite"}
                    >
                      <Star className={`w-4 h-4 ${isFav ? "fill-amber-500" : ""}`} />
                    </button>

                    <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-ovra-orange group-hover:text-white flex items-center justify-center text-gray-500 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function getNodeIcon(category: string, id: string) {
  if (id.includes("webhook")) return <Zap className="w-4 h-4 text-amber-500" />;
  if (id.includes("schedule") || id.includes("cron")) return <Clock className="w-4 h-4 text-blue-500" />;
  if (id.includes("ai")) return <Sparkles className="w-4 h-4 text-purple-600" />;
  if (id.includes("logic") || id.includes("if") || id.includes("switch")) return <GitBranch className="w-4 h-4 text-amber-600" />;
  if (id.includes("slack")) return <MessageSquare className="w-4 h-4 text-[#4A154B]" />;
  if (id.includes("email")) return <Mail className="w-4 h-4 text-rose-500" />;
  if (id.includes("google")) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
  if (id.includes("postgres") || category === "databases") return <Database className="w-4 h-4 text-indigo-600" />;
  if (id.includes("razorpay")) return <CreditCard className="w-4 h-4 text-blue-600" />;
  if (id.includes("http")) return <Globe className="w-4 h-4 text-teal-600" />;
  return <Layers className="w-4 h-4 text-gray-600" />;
}
