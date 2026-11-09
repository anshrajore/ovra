import { OVRAExecutionError } from "./types";

export interface SafeFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  maxOutputBytes?: number;
}

export interface SafeFetchResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  durationMs: number;
}

const REDACTED_HEADERS = new Set([
  "authorization",
  "x-api-key",
  "cookie",
  "set-cookie",
  "x-auth-token",
  "proxy-authorization",
]);

/**
 * Validates whether a target URL is safe against SSRF attacks.
 * Blocks loopback, private IPv4/IPv6 ranges, cloud metadata IPs, and non-HTTP protocols.
 */
export function validateUrlEgress(rawUrl: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { safe: false, reason: `Unsupported protocol ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
    }

    const host = parsed.hostname.toLowerCase();

    // Loopback, local hostnames and metadata addresses
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host === "169.254.169.254" || // AWS/GCP/Azure link-local metadata
      host === "metadata.google.internal" ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return { safe: false, reason: `Destination host ${host} is a forbidden internal or metadata address.` };
    }

    // RFC 1918 Private IPv4 address checks
    if (
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("127.") ||
      host.startsWith("169.254.") ||
      host.startsWith("fe80:")
    ) {
      return { safe: false, reason: `Destination IP ${host} belongs to a reserved private network.` };
    }

    // RFC 1918 172.16.0.0/12
    if (host.startsWith("172.")) {
      const parts = host.split(".");
      if (parts.length >= 2) {
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) {
          return { safe: false, reason: `Destination IP ${host} is inside RFC 1918 172.16.0.0/12 range.` };
        }
      }
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: `Invalid URL format: ${err?.message}` };
  }
}

/**
 * Redacts sensitive headers before logging or returning telemetry.
 */
export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, val] of Object.entries(headers)) {
    if (REDACTED_HEADERS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Shared SSRF-safe HTTP request client with timeout and classified error handling.
 */
export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 15000,
    signal,
    maxOutputBytes = 65536, // 64 KiB
  } = options;

  const egressCheck = validateUrlEgress(url);
  if (!egressCheck.safe) {
    throw new OVRAExecutionError(
      `SSRF Egress Blocked: ${egressCheck.reason}`,
      "SSRF_BLOCKED",
      403
    );
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const combinedSignal = signal
    ? AbortSignal.any
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal
    : controller.signal;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "User-Agent": "OVRA-NodeRuntime/2.4 (Enterprise; +https://ovra.cloud)",
        ...headers,
      },
      body: method !== "GET" ? body : undefined,
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const contentType = res.headers.get("content-type") || "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      const text = await res.text();
      if (text.length > maxOutputBytes) {
        data = {
          _offloadNotice: `Payload size (${text.length} bytes) exceeds threshold (${maxOutputBytes} bytes).`,
          preview: text.slice(0, 2048),
        };
      } else {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new OVRAExecutionError(
          `Provider authentication failed with HTTP ${res.status}: ${res.statusText}`,
          "AUTH_EXPIRED",
          res.status,
          data
        );
      }
      if (res.status === 429) {
        throw new OVRAExecutionError(
          `Provider rate limit exceeded (HTTP 429). Retry-After: ${res.headers.get("retry-after") || "unspecified"}`,
          "RATE_LIMIT_EXHAUSTED",
          429,
          data
        );
      }
      throw new OVRAExecutionError(
        `Provider returned error status ${res.status}: ${res.statusText}`,
        "PROVIDER_ERROR",
        res.status,
        data
      );
    }

    return {
      statusCode: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      data,
      durationMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof OVRAExecutionError) {
      throw err;
    }
    if (err.name === "AbortError") {
      throw new OVRAExecutionError(
        `Request to ${url} timed out after ${timeoutMs}ms`,
        "TIMEOUT",
        504
      );
    }
    throw new OVRAExecutionError(
      `Network transport error: ${err.message}`,
      "PROVIDER_ERROR",
      502
    );
  }
}
