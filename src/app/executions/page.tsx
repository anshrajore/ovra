"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PlayCircle,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowRight,
  RotateCw,
  Copy,
  Check,
  X,
  FileCode,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { useAppStore } from "@/lib/store/use-app-store";
import { ExecutionRecord } from "@/lib/store/app-store";

export default function ExecutionsPage() {
  const store = useAppStore();
  const executions = store.getExecutions();
  const activeWorkspace = store.getActiveWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "RUNNING" | "FAILED">("ALL");
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null);
  const [isReRunning, setIsReRunning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredExecutions = useMemo(() => {
    return executions.filter((exec) => {
      const matchesSearch =
        exec.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exec.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ? true : exec.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [executions, searchQuery, statusFilter]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReRun = async (exec: ExecutionRecord) => {
    setIsReRunning(true);
    const newExecId = `exec_${Date.now()}`;
    await new Promise((res) => setTimeout(res, 800));

    const newRecord: ExecutionRecord = {
      ...exec,
      id: newExecId,
      status: "SUCCESS",
      startedAt: new Date().toISOString(),
      durationMs: exec.durationMs + Math.floor(Math.random() * 20 - 10),
    };

    store.addExecutionRecord(newRecord);
    setSelectedExecution(newRecord);
    setIsReRunning(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Executions Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="executions" />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAF7F2] p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 flex items-center gap-2.5">
                <PlayCircle className="w-6 h-6 text-ovra-orange" />
                Execution History
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Real-time execution telemetry, step logs, and replay engine for{" "}
                <span className="font-semibold text-gray-800">{activeWorkspace.name}</span>.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-ovra-border/60 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search executions by ID or workflow..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-ovra-orange transition-all"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                {(["ALL", "SUCCESS", "RUNNING", "FAILED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      statusFilter === st
                        ? "bg-white text-gray-950 font-semibold shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {st.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Executions Table */}
            {filteredExecutions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <PlayCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900">No executions recorded</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Run a test in the workflow canvas or trigger a webhook to record executions.
                </p>
                <Link
                  href="/workflows"
                  className="mt-4 px-4 py-2 bg-ovra-orange text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-ovra-orange-dark transition-all inline-flex items-center gap-1.5"
                >
                  Go to Workflows
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-ovra-border/70 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-5">Execution ID</th>
                      <th className="py-3 px-4">Workflow</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Trigger</th>
                      <th className="py-3 px-4">Steps</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExecutions.map((exec) => (
                      <tr
                        key={exec.id}
                        onClick={() => setSelectedExecution(exec)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700">
                            <span>{exec.id.substring(0, 16)}...</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(exec.id);
                              }}
                              className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy Full ID"
                            >
                              {copiedId === exec.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          {exec.workflowName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              exec.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : exec.status === "RUNNING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {exec.status === "SUCCESS" && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            )}
                            {exec.status === "RUNNING" && (
                              <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                            )}
                            {exec.status === "FAILED" && (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {exec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 capitalize">
                          {exec.triggerType}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">
                          {exec.nodeCount || exec.steps.length} nodes
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-700">
                          {exec.durationMs}ms
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {new Date(exec.startedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button className="px-2.5 py-1 bg-gray-100 group-hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-[11px] transition-colors inline-flex items-center gap-1">
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
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

      {/* Execution Detail Slide-Over Modal */}
      {selectedExecution && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-white border-l border-ovra-border/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-gray-200/80 bg-[#FAF7F2]/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">
                    {selectedExecution.workflowName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                    <span>{selectedExecution.id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedExecution(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                <span className="text-[10px] text-gray-400 font-medium block">
                  Status
                </span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedExecution.status}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                <span className="text-[10px] text-gray-400 font-medium block">
                  Total Duration
                </span>
                <span className="font-bold text-gray-900 font-mono">
                  {selectedExecution.durationMs}ms
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                <span className="text-[10px] text-gray-400 font-medium block">
                  Trigger
                </span>
                <span className="font-bold text-gray-900 capitalize font-mono">
                  {selectedExecution.triggerType}
                </span>
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Step Telemetry & Payload Log
            </h4>

            <div className="space-y-3">
              {selectedExecution.steps.map((step, idx) => (
                <div
                  key={step.nodeId || idx}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-gray-900">
                        {step.nodeLabel}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-200/70 text-gray-600 rounded text-[10px] font-mono">
                        {step.nodeType}
                      </span>
                    </div>

                    <span className="font-mono text-gray-500 text-[11px]">
                      {step.durationMs}ms
                    </span>
                  </div>

                  {step.outputs && (
                    <details className="mt-2 text-[11px]">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-900 font-medium select-none">
                        View Output Data
                      </summary>
                      <div className="mt-2 p-2.5 bg-gray-900 text-gray-100 rounded-lg font-mono overflow-x-auto max-h-36">
                        <pre>{JSON.stringify(step.outputs, null, 2)}</pre>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Slide-over Footer */}
          <div className="p-4 border-t border-gray-200/80 bg-gray-50/70 flex items-center gap-2">
            <Link
              href={`/studio?id=${selectedExecution.workflowId}`}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-800 bg-white hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Studio
            </Link>

            <button
              onClick={() => handleReRun(selectedExecution)}
              disabled={isReRunning}
              className="flex-1 py-2 rounded-xl bg-ovra-orange hover:bg-ovra-orange-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isReRunning ? "animate-spin" : ""}`}
              />
              Re-run Execution
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
