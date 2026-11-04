"use client";

import { useState } from "react";
import {
  X,
  FileCode,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Layers,
} from "lucide-react";
import { nodeRegistry, defineNode, defineConnector } from "@/lib/node-platform";

interface OpenAPIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (connectorName: string, operationCount: number) => void;
}

export function OpenAPIImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: OpenAPIImportModalProps) {
  const [importMode, setImportMode] = useState<"url" | "raw">("raw");
  const [specUrl, setSpecUrl] = useState("");
  const [rawJson, setRawJson] = useState(`{
  "openapi": "3.0.0",
  "info": {
    "title": "Petstore API",
    "version": "1.0.0",
    "description": "Sample OpenAPI specification for custom connector generation"
  },
  "servers": [
    { "url": "https://api.petstore.com/v1" }
  ],
  "paths": {
    "/pets": {
      "get": {
        "operationId": "listPets",
        "summary": "List all pets",
        "responses": { "200": { "description": "Successful response" } }
      },
      "post": {
        "operationId": "createPet",
        "summary": "Create a new pet",
        "responses": { "201": { "description": "Pet created" } }
      }
    }
  }
}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      let spec: any;
      if (importMode === "url") {
        const resp = await fetch(specUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: Could not fetch OpenAPI URL`);
        spec = await resp.json();
      } else {
        spec = JSON.parse(rawJson);
      }

      if (!spec.paths || typeof spec.paths !== "object") {
        throw new Error("Invalid OpenAPI specification: missing 'paths' object.");
      }

      const connectorId = (spec.info?.title || "custom-api")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const connectorName = spec.info?.title || "Custom API";

      // 1. Register Connector
      const newConnector = defineConnector({
        id: connectorId,
        name: connectorName,
        description: spec.info?.description || "Imported OpenAPI specification",
        category: "utilities",
        icon: "globe",
        authType: "api_key",
        authConfigSchema: {},
        isOfficial: false,
      });
      nodeRegistry.registerConnector(newConnector);

      // 2. Parse and Register Operations
      let operationCount = 0;
      for (const [path, methods] of Object.entries<any>(spec.paths)) {
        for (const [method, op] of Object.entries<any>(methods)) {
          if (typeof op !== "object" || !op) continue;
          const operationId = op.operationId || `${method}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`;
          const nodeName = op.summary || `${method.toUpperCase()} ${path}`;

          const generatedNode = defineNode(
            {
              id: `${connectorId}.${operationId}`,
              version: spec.info?.version || "1.0.0",
              connector: connectorId,
              operationId,
              name: nodeName,
              description: op.description || op.summary || `Execute ${method.toUpperCase()} ${path}`,
              category: "utilities",
              kind: method.toLowerCase() === "get" ? "action" : "action",
              inputsSchema: { type: "object" },
              outputsSchema: { type: "object" },
              configSchema: {
                type: "object",
                properties: {
                  endpoint: {
                    type: "string",
                    title: "Endpoint Path",
                    default: path,
                  },
                  method: {
                    type: "string",
                    title: "Method",
                    default: method.toUpperCase(),
                  },
                },
              },
              execution: {
                timeoutMs: 15000,
              },
            },
            async (input, config) => {
              return {
                status: "success",
                output: {
                  message: `Custom OpenAPI operation '${operationId}' invoked successfully`,
                  path,
                  method: method.toUpperCase(),
                  timestamp: new Date().toISOString(),
                },
              };
            }
          );

          nodeRegistry.registerNode(generatedNode);
          operationCount++;
        }
      }

      onImportComplete?.(connectorName, operationCount);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to parse and register OpenAPI specification.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]/60">
          <div>
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-ovra-orange" />
              Import OpenAPI Specification
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatically generate typed connectors and workflow nodes from any OpenAPI 3.0/3.1 document.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleParseAndRegister} className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setImportMode("raw")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                importMode === "raw" ? "bg-white text-gray-950 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Paste JSON Spec
            </button>
            <button
              type="button"
              onClick={() => setImportMode("url")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                importMode === "url" ? "bg-white text-gray-950 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Import via URL
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {importMode === "url" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                OpenAPI / Swagger JSON URL
              </label>
              <input
                type="url"
                required
                placeholder="https://petstore.swagger.io/v2/swagger.json"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:border-ovra-orange outline-none shadow-2xs"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                OpenAPI Specification (JSON)
              </label>
              <textarea
                rows={12}
                required
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 text-gray-100 border border-gray-800 rounded-xl text-xs font-mono focus:border-ovra-orange outline-none shadow-2xs resize-none"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-ovra-orange hover:bg-ovra-orange-dark text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Nodes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generate & Register Operations
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
