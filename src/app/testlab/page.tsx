"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Play,
  RotateCcw,
  Bug,
  AlertTriangle,
  Clock,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Pause,
  Layers,
} from "lucide-react";

interface StepTelemetry {
  nodeId: string;
  name: string;
  durationMs: number;
  status: "idle" | "running" | "passed" | "failed";
  error?: string;
  payloadOffloaded?: boolean;
}

export default function TestLabPage() {
  const [selectedFailure, setSelectedFailure] = useState<string>("none");
  const [breakpointNode, setBreakpointNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const initialSteps: StepTelemetry[] = [
    { nodeId: "node_1", name: "core.webhook (Stripe Order & Telemetry Ingestion)", durationMs: 42, status: "idle" },
    { nodeId: "node_2", name: "ai.model (Gemini 2.5 Churn & Risk Classifier)", durationMs: 280, status: "idle" },
    { nodeId: "node_3", name: "logic.if (Risk Score > 0.8 Threshold)", durationMs: 12, status: "idle" },
    { nodeId: "node_4", name: "db.postgres (Insert Incident Record)", durationMs: 65, status: "idle" },
    { nodeId: "node_5", name: "comm.slack (Dispatch P1 Enterprise Alert)", durationMs: 145, status: "idle" },
  ];

  const [steps, setSteps] = useState<StepTelemetry[]>(initialSteps);
  const [logs, setLogs] = useState<string[]>([]);

  const handleStartSimulation = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setLogs(["[TestLab] Initializing bounded DAG test runner..."]);
    setSteps(initialSteps.map((s) => ({ ...s, status: "idle" })));

    let idx = 0;
    const runNext = () => {
      if (idx >= initialSteps.length) {
        setIsRunning(false);
        setLogs((prev) => [...prev, "[TestLab] Simulation completed successfully with all assertions passed."]);
        return;
      }

      const current = initialSteps[idx];
      setCurrentStepIndex(idx);

      setSteps((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, status: "running" } : s))
      );
      setLogs((prev) => [...prev, `[TestLab] Executing ${current.name}...`]);

      setTimeout(() => {
        // Check for injected failure
        if (selectedFailure === "rate_limit" && idx === 1) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === idx
                ? { ...s, status: "failed", error: "HTTP 429 Too Many Requests (Rate limit exceeded; Retry-After: 30s)" }
                : s
            )
          );
          setLogs((prev) => [
            ...prev,
            `[FAILURE INJECTION] Rate Limit 429 triggered on ${current.name}. Exponential backoff retry scheduled.`,
          ]);
          setIsRunning(false);
          return;
        }

        if (selectedFailure === "timeout" && idx === 1) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === idx
                ? { ...s, status: "failed", error: "Gateway Timeout (Execution exceeded 30,000ms deadline)" }
                : s
            )
          );
          setLogs((prev) => [
            ...prev,
            `[FAILURE INJECTION] Timeout 504 triggered on ${current.name}. Task moved to Dead Letter Queue (DLQ).`,
          ]);
          setIsRunning(false);
          return;
        }

        if (selectedFailure === "payload_overflow" && idx === 1) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === idx
                ? { ...s, status: "passed", payloadOffloaded: true }
                : s
            )
          );
          setLogs((prev) => [
            ...prev,
            `[STORAGE OFFLOAD] Output size 184 KiB exceeded 64 KiB threshold. Uploaded to private bucket ovra-execution-payloads.`,
          ]);
        } else {
          setSteps((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, status: "passed" } : s))
          );
        }

        idx++;
        runNext();
      }, 700);
    };

    runNext();
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setSteps(initialSteps.map((s) => ({ ...s, status: "idle" })));
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio Canvas</span>
          </Link>
          <span className="text-white/30 text-xs">/</span>
          <span className="text-xs font-mono text-white/50">TestLab</span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#2342FF] font-bold uppercase tracking-wider mb-2">
              <FlaskConical className="w-4 h-4 text-[#2342FF]" />
              <span>Resilience & Stress Engineering</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              OVRA TestLab
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Simulate edge-case failures, verify dead-letter queue behavior, test payload offloading, and inspect step execution waterfall latency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartSimulation}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-[#2342FF] hover:bg-[#1A35DB] text-white font-bold text-xs shadow-lg shadow-[#2342FF]/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunning ? "Simulating..." : "Run Test Simulation"}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Failure Injection Bar */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Bug className="w-4 h-4 text-[#2342FF]" />
            <span>Chaos & Failure Injection Scenario</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: "none", name: "Nominal Flow (No Errors)", desc: "All 5 nodes execute normally" },
              { id: "rate_limit", name: "Inject 429 Rate Limit", desc: "Triggers exponential backoff" },
              { id: "timeout", name: "Inject 30s Timeout", desc: "Forces deadline abort to DLQ" },
              { id: "payload_overflow", name: "Inject >64 KiB Payload", desc: "Verifies Supabase Storage offload" },
            ].map((f) => {
              const isSelected = selectedFailure === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFailure(f.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-[#2342FF]/20 border-[#2342FF] text-white shadow-sm"
                      : "bg-black/30 border-white/5 text-gray-400 hover:border-white/10"
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-0.5">{f.name}</div>
                  <div className="text-[10px] text-gray-400">{f.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Telemetry Waterfall & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Waterfall Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              DAG Execution Waterfall
            </div>

            <div className="space-y-2">
              {steps.map((s, idx) => (
                <div
                  key={s.nodeId}
                  className={`p-4 rounded-xl border transition-all ${
                    s.status === "running"
                      ? "bg-amber-400/10 border-amber-400"
                      : s.status === "passed"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : s.status === "failed"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {s.status === "running" ? (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : s.status === "passed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : s.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-white/10" />
                      )}
                      <span className="font-bold text-xs text-white">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {s.payloadOffloaded && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          <span>Storage Ref</span>
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-gray-400">{s.durationMs}ms</span>
                    </div>
                  </div>

                  {s.error && (
                    <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-500/20 text-red-300 text-[11px] font-mono">
                      {s.error}
                    </div>
                  )}

                  {/* Latency Waterfall Bar */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        s.status === "passed"
                          ? "bg-emerald-400"
                          : s.status === "failed"
                          ? "bg-red-400"
                          : s.status === "running"
                          ? "bg-amber-400"
                          : "bg-transparent"
                      }`}
                      style={{ width: s.status !== "idle" ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Runner Log Output (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Runner Telemetry Stream
            </div>

            <div className="p-4 rounded-2xl bg-black/70 border border-white/10 font-mono text-[11px] min-h-[360px] max-h-[460px] overflow-y-auto space-y-1.5 text-gray-300">
              {logs.length === 0 ? (
                <div className="text-gray-600 italic">No active simulation. Click &quot;Run Test Simulation&quot; to begin.</div>
              ) : (
                logs.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.includes("FAILURE")
                        ? "text-red-400 font-semibold"
                        : line.includes("STORAGE")
                        ? "text-blue-300 font-semibold"
                        : line.includes("completed")
                        ? "text-emerald-400 font-bold"
                        : "text-gray-300"
                    }
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
