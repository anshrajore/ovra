/**
 * @ovra/expression-engine
 * Safe expression evaluation and template interpolation without eval()
 */

export class ExpressionEngine {
  /**
   * Resolve nested property path on an object (e.g. "outputs.data.riskScore")
   */
  public static getPathValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object" || !path) return undefined;
    const parts = path.trim().replace(/^\{\{|\}\}$/g, "").trim().split(".");
    let current: any = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (part === "__proto__" || part === "constructor" || part === "prototype") return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * Interpolate template strings with {{path}} placeholders
   * Example: "Customer {{inputs.name}} created order {{outputs.orderId}}"
   */
  public static interpolate(
    template: string,
    context: Record<string, unknown>
  ): string {
    if (!template || typeof template !== "string") return template;

    return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
      const val = this.getPathValue(context, path);
      if (val === undefined || val === null) return "";
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    });
  }

  /**
   * Safely evaluate comparison operators without eval()
   */
  public static evaluateCondition(
    left: unknown,
    operator:
      | "equals"
      | "not_equals"
      | "greater_than"
      | "less_than"
      | "greater_than_or_equal"
      | "less_than_or_equal"
      | "contains"
      | "starts_with"
      | "is_empty"
      | "is_not_empty",
    right?: unknown
  ): boolean {
    // Empty checks
    if (operator === "is_empty") {
      if (left === null || left === undefined || left === "") return true;
      if (Array.isArray(left)) return left.length === 0;
      if (typeof left === "object") return Object.keys(left).length === 0;
      return false;
    }
    if (operator === "is_not_empty") {
      return !this.evaluateCondition(left, "is_empty");
    }

    // Equality checks
    if (operator === "equals") {
      return String(left) === String(right);
    }
    if (operator === "not_equals") {
      return String(left) !== String(right);
    }

    // Numeric comparisons
    const numLeft = Number(left);
    const numRight = Number(right);
    const areNumbers = !isNaN(numLeft) && !isNaN(numRight);

    if (operator === "greater_than") {
      return areNumbers ? numLeft > numRight : String(left) > String(right);
    }
    if (operator === "less_than") {
      return areNumbers ? numLeft < numRight : String(left) < String(right);
    }
    if (operator === "greater_than_or_equal") {
      return areNumbers ? numLeft >= numRight : String(left) >= String(right);
    }
    if (operator === "less_than_or_equal") {
      return areNumbers ? numLeft <= numRight : String(left) <= String(right);
    }

    // String / Array containment
    if (operator === "contains") {
      if (typeof left === "string") {
        return left.toLowerCase().includes(String(right).toLowerCase());
      }
      if (Array.isArray(left)) {
        return left.includes(right);
      }
      return false;
    }
    if (operator === "starts_with") {
      return String(left).toLowerCase().startsWith(String(right).toLowerCase());
    }

    return false;
  }
}
