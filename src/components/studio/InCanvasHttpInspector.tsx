"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Code2,
  ShieldCheck,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  KeyRound,
  FileJson,
  Layers,
  ArrowRight,
} from "lucide-react";

interface KeyValuePair {
  key: string;
  value: string;
}

interface InCanvasHttpInspectorProps {
  nodeId: string;
  config: Record<string, any>;
  onUpdateConfig: (updatedConfig: Record<string, any>) => void;
  upstreamOutputs?: Record<string, any>;
}

export function InCanvasHttpInspector({
  nodeId,
  config,
  onUpdateConfig,
  upstreamOutputs,
}: InCanvasHttpInspectorProps) {
  const [activeTab, setActiveTab] = useState<
    "configure" | "auth" | "mapping" | "test" | "response" | "advanced"
  >("configure");

  // Local state initialized from config
  const method = config.method || "GET";
  const url = config.url || "https://httpbin.org/get";
  const authType = config.authType || "none";
  const bearerToken = config.bearerToken || "";
  const apiKeyName = config.apiKeyName || "X-API-Key";
  const apiKeyValue = config.apiKeyValue || "";
  const apiKeyIn = config.apiKeyIn || "header";
  const basicUser = config.basicUser || "";
  const basicPass = config.basicPass || "";
  const requestBody = config.body || "";
  const timeoutMs = config.timeoutMs || 10000;
  const maxRetries = config.maxRetries || 2;

  // Header pairs
  const [headers, setHeaders] = useState<KeyValuePair[]>(() => {
    if (config.headers && typeof config.headers === "object") {
      return Object.entries(config.headers).map(([k, v]) => ({ key: k, value: String(v) }));
    }
    return [{ key: "Accept", value: "application/json" }];
  });

  // Query param pairs
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(() => {
    if (config.queryParams && typeof config.queryParams === "object") {
      return Object.entries(config.queryParams).map(([k, v]) => ({ key: k, value: String(v) }));
    }
    return [];
  });

  // Test execution state
  const [isTesting, setIsTesting] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    status: number;
    latencyMs: number;
    headers: Record<string, string>;
    body: any;
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [inferredSchema, setInferredSchema] = useState<Record<string, any> | null>(null);

  const updateConfigField = (field: string, val: any) => {
    const updated = { ...config, [field]: val };
    onUpdateConfig(updated);
  };

  const handleHeadersChange = (updated: KeyValuePair[]) => {
    setHeaders(updated);
    const headerObj: Record<string, string> = {};
    updated.forEach((h) => {
      if (h.key.trim()) headerObj[h.key.trim()] = h.value;
    });
    updateConfigField("headers", headerObj);
  };

  const handleQueryParamsChange = (updated: KeyValuePair[]) => {
    setQueryParams(updated);
    const qObj: Record<string, string> = {};
    updated.forEach((q) => {
      if (q.key.trim()) qObj[q.key.trim()] = q.value;
    });
    updateConfigField("queryParams", qObj);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResponse(null);
    const startTime = performance.now();

    try {
      // Build effective headers
      const finalHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) finalHeaders[h.key.trim()] = h.value;
      });

      if (authType === "bearer" && bearerToken) {
        finalHeaders["Authorization"] = `Bearer ${bearerToken}`;
      } else if (authType === "apiKey" && apiKeyIn === "header" && apiKeyName && apiKeyValue) {
        finalHeaders[apiKeyName] = apiKeyValue;
      } else if (authType === "basic" && basicUser) {
        const credentials = btoa(`${basicUser}:${basicPass}`);
        finalHeaders["Authorization"] = `Basic ${credentials}`;
      }

      // Build effective URL with query params
      let finalUrl = url;
      if (queryParams.length > 0) {
        const urlObj = new URL(url);
        queryParams.forEach((q) => {
          if (q.key.trim()) urlObj.searchParams.set(q.key.trim(), q.value);
        });
        if (authType === "apiKey" && apiKeyIn === "query" && apiKeyName && apiKeyValue) {
          urlObj.searchParams.set(apiKeyName, apiKeyValue);
        }
        finalUrl = urlObj.toString();
      }

      // Execute via server-side isolated node test endpoint to honor SSRF defenses
      const res = await fetch("/api/v1/nodes/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: "core.http_request",
          parameters: {
            method,
            url: finalUrl,
            headers: finalHeaders,
            body: ["POST", "PUT", "PATCH"].includes(method) ? requestBody : undefined,
            timeout: timeoutMs,
          },
          mockInputs: upstreamOutputs || {},
        }),
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const data = await res.json();

      if (!res.ok || data.error) {
        setTestError(data.error || `HTTP ${res.status}: Test request failed`);
        setTestResponse({
          status: res.status,
          latencyMs,
          headers: {},
          body: data,
        });
      } else {
        const output = data.output || data;
        setTestResponse({
          status: output.status || 200,
          latencyMs,
          headers: output.headers || {},
          body: output.data !== undefined ? output.data : output,
        });
      }
      setActiveTab("response");
    } catch (err: any) {
      setTestError(err?.message || "Failed to execute in-canvas HTTP request.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleInferSchema = () => {
    if (!testResponse?.body) return;
    const body = testResponse.body;
    const schema: Record<string, any> = {
      type: "object",
      properties: {},
    };

    if (typeof body === "object" && body !== null && !Array.isArray(body)) {
      Object.keys(body).forEach((key) => {
        const val = body[key];
        const valType = Array.isArray(val) ? "array" : typeof val;
        schema.properties[key] = { type: valType };
      });
    } else if (Array.isArray(body)) {
      schema.type = "array";
      schema.items = { type: "object" };
    }

    setInferredSchema(schema);
    updateConfigField("inferredOutputSchema", schema);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("configure")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "configure" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Configure
        </button>
        <button
          onClick={() => setActiveTab("auth")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "auth" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Auth
        </button>
        <button
          onClick={() => setActiveTab("mapping")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "mapping" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Mapping
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "test" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Test
        </button>
        <button
          onClick={() => setActiveTab("response")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "response" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Response {testResponse && <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 inline-block" />}
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`py-1.5 px-2.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === "advanced" ? "bg-white text-gray-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Advanced
        </button>
      </div>

      {/* TAB 1: CONFIGURE */}
      {activeTab === "configure" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">HTTP Method & URL</label>
            <div className="flex items-center gap-1.5">
              <select
                value={method}
                onChange={(e) => updateConfigField("method", e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-gray-900 outline-none focus:border-ovra-orange"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
              </select>
              <input
                type="text"
                value={url}
                onChange={(e) => updateConfigField("url", e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs text-gray-900 font-mono outline-none focus:border-ovra-orange"
              />
            </div>
          </div>

          {/* Headers Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">Request Headers</label>
              <button
                type="button"
                onClick={() => handleHeadersChange([...headers, { key: "", value: "" }])}
                className="text-[11px] text-ovra-orange font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={h.key}
                    placeholder="Header-Name"
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i].key = e.target.value;
                      handleHeadersChange(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={h.value}
                    placeholder="Value"
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i].value = e.target.value;
                      handleHeadersChange(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-300 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleHeadersChange(headers.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Request Body (for POST/PUT/PATCH) */}
          {["POST", "PUT", "PATCH"].includes(method) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Request Body (JSON)</label>
                <span className="text-[10px] text-gray-400 font-mono">Accepts expressions</span>
              </div>
              <textarea
                rows={5}
                value={requestBody}
                onChange={(e) => updateConfigField("body", e.target.value)}
                placeholder='{\n  "userId": "{{nodes.trigger.id}}",\n  "status": "active"\n}'
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-gray-900 outline-none focus:border-ovra-orange"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUTHENTICATION */}
      {activeTab === "auth" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Authentication Type</label>
            <select
              value={authType}
              onChange={(e) => updateConfigField("authType", e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-gray-900 outline-none focus:border-ovra-orange"
            >
              <option value="none">No Authentication</option>
              <option value="bearer">Bearer Token (JWT / API Token)</option>
              <option value="apiKey">API Key (Header or Query Param)</option>
              <option value="basic">Basic Auth (Username & Password)</option>
            </select>
          </div>

          {authType === "bearer" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bearer Token</label>
              <input
                type="password"
                value={bearerToken}
                onChange={(e) => updateConfigField("bearerToken", e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-gray-900 outline-none focus:border-ovra-orange"
              />
            </div>
          )}

          {authType === "apiKey" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  value={apiKeyName}
                  onChange={(e) => updateConfigField("apiKeyName", e.target.value)}
                  placeholder="X-API-Key"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Value</label>
                <input
                  type="password"
                  value={apiKeyValue}
                  onChange={(e) => updateConfigField("apiKeyValue", e.target.value)}
                  placeholder="secret_key_..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Send Key In</label>
                <select
                  value={apiKeyIn}
                  onChange={(e) => updateConfigField("apiKeyIn", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold"
                >
                  <option value="header">HTTP Header</option>
                  <option value="query">Query Parameter</option>
                </select>
              </div>
            </div>
          )}

          {authType === "basic" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={basicUser}
                  onChange={(e) => updateConfigField("basicUser", e.target.value)}
                  placeholder="admin"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={basicPass}
                  onChange={(e) => updateConfigField("basicPass", e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MAPPING */}
      {activeTab === "mapping" && (
        <div className="space-y-3">
          <div className="text-xs text-gray-600 leading-relaxed">
            Click any variable below to copy or insert it into your URL, headers, or request body:
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
            <div className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-ovra-orange" />
              <span>Available Upstream Variables</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[
                { label: "Trigger Output (Event ID)", expr: "{{nodes.trigger.id}}" },
                { label: "Trigger Timestamp", expr: "{{nodes.trigger.timestamp}}" },
                { label: "Patient ID / User ID", expr: "{{outputs.patientId}}" },
                { label: "Severity Classification", expr: "{{outputs.riskScore}}" },
                { label: "Decrypted Token Ref", expr: "{{credentials.default.token}}" },
              ].map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(v.expr);
                  }}
                  className="w-full p-2 rounded-lg bg-white border border-gray-200/80 text-left hover:border-ovra-orange flex items-center justify-between group transition-all"
                >
                  <div>
                    <div className="font-semibold text-[11px] text-gray-900">{v.label}</div>
                    <div className="font-mono text-[10px] text-ovra-orange">{v.expr}</div>
                  </div>
                  <Copy className="w-3 h-3 text-gray-400 group-hover:text-ovra-orange" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEST */}
      {activeTab === "test" && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Side-Effect Safety Alert:</strong> Executing this test will send a real, bounded HTTP request to the external destination URL with safe credential leasing.
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold text-gray-900">{method}</span>
            </div>
            <div className="flex items-start justify-between font-mono">
              <span className="text-gray-500">Target:</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]" title={url}>{url}</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-gray-500">Timeout Ceiling:</span>
              <span>{timeoutMs}ms</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            disabled={isTesting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E1F24] hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ovra-orange" />
                <span>Sending Test Request...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute In-Canvas Test</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 5: RESPONSE */}
      {activeTab === "response" && (
        <div className="space-y-3">
          {testError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {testError}
            </div>
          )}

          {testResponse ? (
            <div className="space-y-3">
              {/* Header metrics */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                      testResponse.status >= 200 && testResponse.status < 300
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testResponse.status} OK
                  </span>
                  <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {testResponse.latencyMs}ms
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(testResponse.body, null, 2));
                    setCopiedResponse(true);
                    setTimeout(() => setCopiedResponse(false), 2000);
                  }}
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  {copiedResponse ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedResponse ? "Copied" : "Copy Body"}</span>
                </button>
              </div>

              {/* Body viewer */}
              <div className="p-3 bg-gray-900 rounded-xl text-gray-100 font-mono text-xs max-h-56 overflow-auto">
                <pre>{JSON.stringify(testResponse.body, null, 2)}</pre>
              </div>

              {/* Infer Schema Button */}
              <button
                type="button"
                onClick={handleInferSchema}
                className="w-full py-2 px-3 rounded-xl border border-ovra-orange/40 bg-ovra-orange/10 hover:bg-ovra-orange/20 text-ovra-orange font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Infer & Bind Output JSON Schema</span>
              </button>

              {inferredSchema && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Schema Inferred Successfully!
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Output schema updated with {Object.keys(inferredSchema.properties || {}).length} properties for downstream node binding.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs italic">
              No test executed yet. Click &quot;Test&quot; tab and execute request to inspect response.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ADVANCED */}
      {activeTab === "advanced" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Timeout (ms)</label>
            <input
              type="number"
              value={timeoutMs}
              max={15000}
              onChange={(e) => updateConfigField("timeoutMs", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono"
            />
            <span className="text-[10px] text-gray-400">Max 15,000ms on Vercel control plane.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Max Retries</label>
            <input
              type="number"
              value={maxRetries}
              max={5}
              onChange={(e) => updateConfigField("maxRetries", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono"
            />
            <span className="text-[10px] text-gray-400">Exponential backoff with jitter.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">SSRF Defense Policy</label>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Loopback (127.0.0.1) & RFC1918 private subnets are blocked automatically.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
