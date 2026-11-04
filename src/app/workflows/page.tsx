"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Workflow,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  FileCode,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";
import { WorkflowDefinition } from "@/lib/types/workflow";

export default function WorkflowsDashboardPage() {
  const router = useRouter();
  const store = useAppStore();
  const workflows = store.getWorkflows();
  const activeWorkspace = store.getActiveWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");
  const [selectedStarter, setSelectedStarter] = useState<"blank" | "ai_triage" | "payment">("blank");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter((wf) => {
      const matchesSearch =
        wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wf.description && wf.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ? true : wf.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workflows, searchQuery, statusFilter]);

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newWorkflowName.trim() || "Untitled Automation";
    const newWf = store.createWorkflow(name, newWorkflowDesc.trim());

    if (selectedStarter === "ai_triage") {
      newWf.nodes.push(
        {
          id: `node_ai_${Date.now()}`,
          type: "ai.agent",
          label: "Gemini Triage",
          subtitle: "Analyze and score risk",
          status: "idle",
        },
        {
          id: `node_slack_${Date.now()}`,
          type: "comm.slack",
          label: "Slack Alert",
          subtitle: "Post to #security",
          status: "idle",
        }
      );
      newWf.edges.push({
        id: `edge_${Date.now()}`,
        source: newWf.nodes[0].id,
        target: newWf.nodes[1].id,
      });
      store.saveWorkflow(newWf);
    }

    setIsCreateModalOpen(false);
    setNewWorkflowName("");
    setNewWorkflowDesc("");
    router.push(`/studio?id=${newWf.id}`);
  };

  const handleDuplicate = (id: string) => {
    const cloned = store.duplicateWorkflow(id);
    setActiveMenuId(null);
    if (cloned) {
      router.push(`/studio?id=${cloned.id}`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setActiveMenuId(null);
    if (confirm(`Permanently delete workflow "${name}"?`)) {
      store.deleteWorkflow(id);
    }
  };

  const handleExportJSON = (wf: WorkflowDefinition) => {
    setActiveMenuId(null);
    const blob = new Blob([JSON.stringify(wf, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${wf.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ovra.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          const newWf: WorkflowDefinition = {
            id: `wf_${Date.now()}`,
            name: parsed.name ? `${parsed.name} (Imported)` : "Imported Automation",
            description: parsed.description || "Imported workflow",
            status: "draft",
            version: 1,
            workspaceId: activeWorkspace.id,
            nodes: parsed.nodes,
            edges: parsed.edges || [],
            lastSavedAt: "Imported just now",
          };
          store.saveWorkflow(newWf);
          router.push(`/studio?id=${newWf.id}`);
        } else {
          alert("Invalid OVRA workflow format. File must contain a 'nodes' array.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Hidden File Input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Workflows Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="workflows" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                  <Workflow className="w-6 h-6 text-ovra-orange" />
                  Workflows
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Design, orchestrate and monitor multi-step automations in{" "}
                  <span className="font-semibold text-gray-800">{activeWorkspace.name}</span>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleImportJSONClick}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-500" />
                  Import JSON
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-ovra-orange hover:bg-ovra-orange-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Workflow
                </button>
              </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-ovra-border/60 shadow-2xs">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search workflows by title or trigger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-ovra-orange transition-all"
                />
              </div>

              {/* Status Filters & View Toggle */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                  {(["all", "active", "draft", "archived"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all ${
                        statusFilter === st
                          ? "bg-white text-gray-950 font-semibold shadow-2xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center border border-gray-200 rounded-xl p-0.5 bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "grid" ? "bg-gray-100 text-gray-950" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "list" ? "bg-gray-100 text-gray-950" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Workflow List or Grid */}
            {filteredWorkflows.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Workflow className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900">No workflows found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search criteria or filter options."
                    : "Get started by creating your first automated pipeline or using a prebuilt template."}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-ovra-orange text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-ovra-orange-dark transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create Automation
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="bg-white rounded-2xl border border-ovra-border/70 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Badges & Menu */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              wf.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {wf.status === "active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            {wf.status === "active" ? "Active" : "Draft"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            v{wf.version || 1}.0
                          </span>
                        </div>

                        {/* Card Menu Button */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === wf.id ? null : wf.id)
                            }
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === wf.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 text-xs">
                              <Link
                                href={`/studio?id=${wf.id}`}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-lg font-medium"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                Open Canvas
                              </Link>
                              <button
                                onClick={() => handleDuplicate(wf.id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-lg font-medium text-left"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => handleExportJSON(wf)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-gray-950 hover:bg-gray-50 rounded-lg font-medium text-left"
                              >
                                <Download className="w-3.5 h-3.5 text-gray-400" />
                                Export JSON
                              </button>
                              <div className="my-1 border-t border-gray-100" />
                              <button
                                onClick={() => handleDelete(wf.id, wf.name)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-medium text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <Link href={`/studio?id=${wf.id}`} className="block group">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-ovra-orange transition-colors">
                          {wf.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {wf.description || "No description provided."}
                        </p>
                      </Link>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-gray-400" />
                          {wf.nodes.length} nodes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {wf.lastSavedAt || "Recently"}
                        </span>
                      </div>

                      <Link
                        href={`/studio?id=${wf.id}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-[11px] transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-ovra-border/70 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Workflow</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Nodes</th>
                      <th className="py-3 px-4">Version</th>
                      <th className="py-3 px-4">Last Saved</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWorkflows.map((wf) => (
                      <tr key={wf.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <Link
                            href={`/studio?id=${wf.id}`}
                            className="font-bold text-gray-900 hover:text-ovra-orange transition-colors flex items-center gap-2"
                          >
                            <Workflow className="w-4 h-4 text-gray-400" />
                            <span>{wf.name}</span>
                          </Link>
                          {wf.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-sm">
                              {wf.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              wf.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {wf.status === "active" ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">
                          {wf.nodes.length}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">
                          v{wf.version || 1}.0
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {wf.lastSavedAt || "Recently"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/studio?id=${wf.id}`}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-[11px] text-gray-900 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDuplicate(wf.id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(wf.id, wf.name)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-ovra-orange mb-3">
                <Workflow className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-950">Create New Workflow</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Start with a blank canvas or choose a starter blueprint.
              </p>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Razorpay Order Fraud Check"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="What does this automation accomplish?"
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:border-ovra-orange focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Starter Template
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setSelectedStarter("blank")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedStarter === "blank"
                        ? "border-ovra-orange bg-orange-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="starter"
                      checked={selectedStarter === "blank"}
                      onChange={() => setSelectedStarter("blank")}
                      className="mt-0.5 accent-ovra-orange"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Blank Canvas
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Starts with a single Webhook Trigger node.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setSelectedStarter("ai_triage")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedStarter === "ai_triage"
                        ? "border-ovra-orange bg-orange-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="starter"
                      checked={selectedStarter === "ai_triage"}
                      onChange={() => setSelectedStarter("ai_triage")}
                      className="mt-0.5 accent-ovra-orange"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Webhook & AI Triage
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        Webhook $\rightarrow$ Gemini 2.5 Agent $\rightarrow$ Slack Alert.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-ovra-orange hover:bg-ovra-orange-dark text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Create & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
