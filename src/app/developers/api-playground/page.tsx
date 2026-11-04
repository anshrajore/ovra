"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Terminal,
  Send,
  Code2,
} from "lucide-react";

interface Endpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  defaultBody?: string;
}

export default function ApiPlaygroundPage() {
  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/v1/nodes",
      description: "List all versioned nodes in the central registry",
    },
    {
      method: "POST",
      path: "/api/v1/nodes/test",
      description: "Execute a single node in an isolated in-memory test harness",
      defaultBody: JSON.stringify(
        {
          nodeId: "core.http_request",
          parameters: {
            url: "https://httpbin.org/get",
            method: "GET",
          },
          mockInputs: {
            sampleData: "hello ovra",
          },
        },
        null,
        2
      ),
    },
    {
      method: "GET",
      path: "/api/v1/credentials",
      description: "Query registered credential vaults (metadata only)",
    },
    {
      method: "POST",
      path: "/api/v1/connectors/openapi/import",
      description: "Parse an OpenAPI 3.0 specification and generate node schemas",
      defaultBody: JSON.stringify(
        {
          schema: {
            openapi: "3.0.0",
            info: { title: "PetStore API", version: "1.0.0" },
            paths: {
              "/pets": {
                get: {
                  summary: "List all pets",
                  operationId: "listPets",
                },
              },
            },
          },
        },
        null,
        2
      ),
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);
  const [requestBody, setRequestBody] = useState(endpoints[0].defaultBody || "");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (ep: Endpoint) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || "");
    setResponseBody(null);
    setResponseStatus(null);
  };

  const handleSend = async () => {
    setLoading(true);
    setResponseBody(null);
    setResponseStatus(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ovra_test_playground_preview",
        },
      };

      if (selectedEndpoint.method === "POST" && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const latency = Math.round(performance.now() - startTime);
      setResponseLatency(latency);
      setResponseStatus(res.status);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: err?.message || "Network request failed" }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://ovra.io${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer ovra_live_..." \\\n  -H "Content-Type: application/json"`;
    if (selectedEndpoint.method === "POST" && requestBody.trim()) {
      curl += ` \\\n  -d '${requestBody.replace(/'/g, "\\'")}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0C0D10] text-gray-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Developer Hub</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Play className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span>Interactive API Playground</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Test live control-plane REST endpoints, inspect response headers, and generate copy-paste cURL snippets.
            </p>
          </div>

          <button
            onClick={copyCurl}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all self-start sm:self-center"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "cURL Copied" : "Copy cURL"}</span>
          </button>
        </div>

        {/* Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Endpoint Picker (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
              Available Endpoints
            </div>
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  type="button"
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/10"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ep.method === "GET"
                          ? "bg-blue-500/20 text-blue-400"
                          : ep.method === "POST"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-white truncate">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 line-clamp-1">{ep.description}</div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Request & Response Inspector (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Request Bar */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    selectedEndpoint.method === "GET"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs text-white flex-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  {selectedEndpoint.path}
                </span>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON Body Editor if POST */}
              {selectedEndpoint.method === "POST" && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 mb-1.5">Request Body (JSON)</div>
                  <textarea
                    rows={7}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-200 outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Response Output</span>
                </div>
                {responseStatus !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        responseStatus >= 200 && responseStatus < 300
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {responseStatus}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">{responseLatency}ms</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/5 min-h-[220px] max-h-[360px] overflow-auto font-mono text-xs text-gray-300">
                {loading ? (
                  <div className="flex items-center justify-center h-40 text-gray-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    <span>Executing request...</span>
                  </div>
                ) : responseBody ? (
                  <pre className="text-emerald-300/90 whitespace-pre-wrap">{responseBody}</pre>
                ) : (
                  <div className="text-gray-600 italic">Click &quot;Send Request&quot; to inspect real API response...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
