/**
 * @ovra/node-schema
 * JSON Schema helpers and field descriptors for dynamic node configuration
 */

export interface SchemaFieldDescriptor {
  key: string;
  type: "string" | "number" | "boolean" | "select" | "textarea" | "json" | "array";
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export class SchemaHelper {
  /**
   * Derive form field descriptors from a JSON Schema properties map
   */
  public static deriveFields(schema: Record<string, any>): SchemaFieldDescriptor[] {
    if (!schema || !schema.properties) return [];

    const properties = schema.properties;
    const requiredKeys = new Set<string>(schema.required || []);
    const fields: SchemaFieldDescriptor[] = [];

    for (const [key, prop] of Object.entries<any>(properties)) {
      let fieldType: SchemaFieldDescriptor["type"] = "string";

      if (prop.enum && Array.isArray(prop.enum)) {
        fieldType = "select";
      } else if (prop.type === "number" || prop.type === "integer") {
        fieldType = "number";
      } else if (prop.type === "boolean") {
        fieldType = "boolean";
      } else if (prop.format === "textarea" || (prop.type === "string" && prop.maxLength && prop.maxLength > 200)) {
        fieldType = "textarea";
      } else if (prop.type === "object") {
        fieldType = "json";
      } else if (prop.type === "array") {
        fieldType = "array";
      }

      fields.push({
        key,
        type: fieldType,
        label: prop.title || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
        description: prop.description,
        required: requiredKeys.has(key),
        defaultValue: prop.default,
        options: prop.enum
          ? prop.enum.map((opt: string) => ({
              label: opt.replace(/_/g, " ").replace(/^./, (str) => str.toUpperCase()),
              value: opt,
            }))
          : undefined,
        placeholder: prop.examples?.[0] || prop.placeholder,
      });
    }

    return fields;
  }

  /**
   * Produce default configuration payload from a JSON Schema
   */
  public static getDefaultConfig(schema: Record<string, any>): Record<string, unknown> {
    const fields = this.deriveFields(schema);
    const defaults: Record<string, unknown> = {};

    for (const f of fields) {
      if (f.defaultValue !== undefined) {
        defaults[f.key] = f.defaultValue;
      } else if (f.type === "boolean") {
        defaults[f.key] = false;
      } else if (f.type === "number") {
        defaults[f.key] = 0;
      } else if (f.type === "select" && f.options && f.options[0]) {
        defaults[f.key] = f.options[0].value;
      } else {
        defaults[f.key] = "";
      }
    }

    return defaults;
  }
}
