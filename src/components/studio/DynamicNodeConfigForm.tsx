"use client";

import { useMemo } from "react";
import { SchemaHelper, SchemaFieldDescriptor } from "@/lib/node-platform/schema";

interface DynamicNodeConfigFormProps {
  schema: Record<string, any>;
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function DynamicNodeConfigForm({
  schema,
  config,
  onChange,
}: DynamicNodeConfigFormProps) {
  const fields = useMemo(() => {
    return SchemaHelper.deriveFields(schema);
  }, [schema]);

  if (!fields.length) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-gray-500 text-xs">
        No configurable parameters required for this node.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-800">
              {field.label}
              {field.required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {field.type === "number" && (
              <span className="text-[11px] font-mono text-gray-500">
                {config[field.key] ?? field.defaultValue ?? 0}
              </span>
            )}
          </div>

          {field.description && (
            <p className="text-[11px] text-gray-500 leading-normal mb-1">
              {field.description}
            </p>
          )}

          {/* Render by field type */}
          {field.type === "select" && (
            <select
              value={config[field.key] ?? field.defaultValue ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-ovra-orange outline-none shadow-2xs transition-all"
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {field.type === "textarea" && (
            <textarea
              rows={4}
              value={config[field.key] ?? field.defaultValue ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder || "Enter value..."}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:border-ovra-orange outline-none shadow-2xs resize-none transition-all"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={config[field.key] ?? field.defaultValue ?? 0}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:border-ovra-orange outline-none shadow-2xs transition-all"
            />
          )}

          {field.type === "boolean" && (
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={Boolean(config[field.key] ?? field.defaultValue ?? false)}
                onChange={(e) => onChange(field.key, e.target.checked)}
                className="w-4 h-4 rounded text-ovra-orange accent-ovra-orange"
              />
              <span className="text-xs text-gray-700 font-medium">Enable</span>
            </label>
          )}

          {field.type === "json" && (
            <textarea
              rows={4}
              value={
                typeof config[field.key] === "object"
                  ? JSON.stringify(config[field.key], null, 2)
                  : config[field.key] ?? "{}"
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(field.key, parsed);
                } catch {
                  onChange(field.key, e.target.value);
                }
              }}
              placeholder='{\n  "key": "value"\n}'
              className="w-full px-3 py-2 bg-gray-900 text-gray-100 border border-gray-800 rounded-xl text-xs font-mono focus:border-ovra-orange outline-none shadow-2xs resize-none"
            />
          )}

          {field.type === "string" && (
            <input
              type="text"
              value={config[field.key] ?? field.defaultValue ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder || "Enter value..."}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-ovra-orange outline-none shadow-2xs transition-all font-mono"
            />
          )}
        </div>
      ))}
    </div>
  );
}
