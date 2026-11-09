"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Play, Copy, Check, ArrowUpRight, Zap, Code2, Globe } from "lucide-react";

export function LandingApiInspector() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<"nodes" | "test" | "import">("nodes");
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);

  const endpoints = {
    nodes: {
      method: "GET",
      path: "/api/v1/nodes",
      curl: `curl -X GET https://ovra.io/api/v1/nodes \\\n  -H "Authorization: Bearer ovra_live_demo"`,
      sampleResponse: {
        totalRegistered: 15,
        version: "1.0.0",
        categories: ["core", "ai", "storage", "apps", "utilities"],
        nodes: [
          { id: "core.webhook_trigger", type: "trigger", latency: "1.2ms" },
          { id: "ai.gemini_flash", type: "ai", latency: "210ms" },
          { id: "core.http_request", type: "action", latency: "14ms" },
        ],
      },
    },
    test: {
      method: "POST",
      path: "/api/v1/nodes/test",
      curl: `curl -X POST https://ovra.io/api/v1/nodes/test \\\n  -H "Content-Type: application/json" \\\n  -d '{"nodeType": "ai.gemini_flash", "input": {"prompt": "Classify enterprise telemetry alert"}}'`,
      sampleResponse: {
        nodeType: "ai.gemini_flash",
        status: "success",
        durationMs: 14.8,
        output: {
          triageLevel: "PRIORITY_1_CRITICAL",
          recommendedDepartment: "DevOps_Reliability",
          tokensUsed: 142,
          securityChecks: { ssrfProtected: true, evalFree: true },
        },
      },
    },
    import: {
      method: "POST",
      path: "/api/v1/connectors/openapi/import",
      curl: `curl -X POST https://ovra.io/api/v1/connectors/openapi/import \\\n  -H "Content-Type: application/json" \\\n  -d '{"specUrl": "https://api.resend.com/openapi.json"}'`,
      sampleResponse: {
        success: true,
        connectorId: "conn_resend_emails",
        operationsRegistered: 18,
        ssrfChecked: true,
        status: "READY_FOR_CANVAS",
      },
    },
  };

  const current = endpoints[selectedEndpoint];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setResponseOutput(null);
    setTimeout(() => {
      setResponseOutput(current.sampleResponse);
      setIsRunning(false);
    }, 350);
  };

  return (
    <section className="relative w-full bg-[#08090C] text-white py-24 px-6 sm:px-10 lg:px-16 border-b border-white/10 select-none">
      <div className="max-w-6xl mx-auto scroll-reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2342FF] mb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Ergonomics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test the platform API in real time.
            </h2>
          </div>

          <Link
            href="/developers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2342FF] hover:underline"
          >
            <span>Read Complete API Reference</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Studio Window */}
        <div className="rounded-3xl bg-[#0F1117] border border-white/15 shadow-2xl overflow-hidden">
          {/* Top Bar with endpoint selectors */}
          <div className="p-4 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs font-mono text-white/50 hidden sm:inline">
                OVRA In-Canvas API Studio v1.0
              </span>
            </div>

            {/* Endpoint Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  setSelectedEndpoint("nodes");
                  setResponseOutput(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedEndpoint === "nodes"
                    ? "bg-[#2342FF] text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                GET /nodes
              </button>
              <button
                onClick={() => {
                  setSelectedEndpoint("test");
                  setResponseOutput(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedEndpoint === "test"
                    ? "bg-[#2342FF] text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                POST /nodes/test
              </button>
              <button
                onClick={() => {
                  setSelectedEndpoint("import");
                  setResponseOutput(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedEndpoint === "import"
                    ? "bg-[#2342FF] text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                POST /connectors/openapi
              </button>
            </div>
          </div>

          {/* Code & Response Split Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Left: cURL Snippet */}
            <div className="lg:col-span-6 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-white/50 font-mono">
                  <span>REQUEST (cURL)</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00E599]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-[#00E599] overflow-x-auto leading-relaxed">
                  {current.curl}
                </pre>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-white/50 font-mono">Method: {current.method}</span>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 shadow"
                >
                  <Play className={`w-3.5 h-3.5 fill-black ${isRunning ? "animate-spin" : ""}`} />
                  <span>{isRunning ? "Sending Request..." : "Send Request"}</span>
                </button>
              </div>
            </div>

            {/* Right: Live Response */}
            <div className="lg:col-span-6 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-white/50">
                  <span>RESPONSE (JSON)</span>
                  <span className="text-[#00E599] font-bold">200 OK</span>
                </div>

                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white/90 overflow-x-auto h-[180px] leading-relaxed">
                  {responseOutput
                    ? JSON.stringify(responseOutput, null, 2)
                    : JSON.stringify(current.sampleResponse, null, 2)}
                </pre>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-mono text-white/40">
                <span>SSRF Guard: ACTIVE</span>
                <span>AST Eval-Free: VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
