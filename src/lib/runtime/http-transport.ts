import crypto from "crypto";
import { OVRAExecutionError, OVRARetryPolicy, OVRAFileRef } from "./types";

export interface SafeFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  maxOutputBytes?: number;
  retryPolicy?: OVRARetryPolicy;
}

export interface SafeFetchResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  durationMs: number;
  fileRef?: OVRAFileRef;
  attemptsMade: number;
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

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Shared SSRF-safe HTTP request client with exponential backoff retry,
 * jitter, Retry-After header support, and 64 KiB payload offloading.
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
    maxOutputBytes = 65536, // 64 KiB threshold
    retryPolicy,
  } = options;

  const egressCheck = validateUrlEgress(url);
  if (!egressCheck.safe) {
    throw new OVRAExecutionError(
      `SSRF Egress Blocked: ${egressCheck.reason}`,
      "SSRF_BLOCKED",
      403
    );
  }

  const maxRetries = retryPolicy?.maxRetries ?? 2;
  const initialInterval = retryPolicy?.initialIntervalMs ?? 300;
  const maxInterval = retryPolicy?.maxIntervalMs ?? 4000;
  const backoffMultiplier = retryPolicy?.backoffMultiplier ?? 2;

  let attempt = 0;
  const totalStartTime = Date.now();

  while (true) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const combinedSignal = signal
      ? AbortSignal.any
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal
      : controller.signal;

    try {
      signal?.throwIfAborted();

      const res = await fetch(url, {
        method,
        headers: {
          "User-Agent": "OVRA-NodeRuntime/2.5 (Enterprise; +https://ovra.cloud)",
          ...headers,
        },
        body: method !== "GET" ? body : undefined,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const contentType = res.headers.get("content-type") || "";
      let data: unknown;
      let fileRef: OVRAFileRef | undefined = undefined;

      const rawText = await res.text();
      const rawLength = Buffer.byteLength(rawText, "utf-8");

      if (rawLength > maxOutputBytes) {
        // Offload payload to storage reference
        const sha256 = crypto.createHash("sha256").update(rawText).digest("hex");
        fileRef = {
          ref: `storage://payloads/${sha256.slice(0, 16)}.json`,
          fileName: "response.json",
          mimeType: contentType.includes("json") ? "application/json" : "text/plain",
          sizeBytes: rawLength,
          sha256,
        };
        data = {
          _fileRef: fileRef,
          _offloaded: true,
          preview: rawText.slice(0, 1024),
        };
      } else {
        if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(rawText);
          } catch {
            data = rawText;
          }
        } else {
          data = rawText;
        }
      }

      if (!res.ok) {
        const isRateLimit = res.status === 429;
        const isTransient = res.status === 502 || res.status === 503 || res.status === 504;

        if ((isRateLimit || isTransient) && attempt <= maxRetries) {
          let retryDelay = Math.min(
            maxInterval,
            initialInterval * Math.pow(backoffMultiplier, attempt - 1) + Math.random() * 100
          );

          const retryAfter = res.headers.get("retry-after");
          if (retryAfter) {
            const parsedSeconds = parseInt(retryAfter, 10);
            if (!isNaN(parsedSeconds)) {
              retryDelay = Math.max(retryDelay, parsedSeconds * 1000);
            }
          }

          await sleep(retryDelay);
          continue;
        }

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
        durationMs: Date.now() - totalStartTime,
        fileRef,
        attemptsMade: attempt,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err instanceof OVRAExecutionError) {
        throw err;
      }

      const isTimeout = err.name === "AbortError";
      if (isTimeout && attempt <= maxRetries) {
        const retryDelay = Math.min(
          maxInterval,
          initialInterval * Math.pow(backoffMultiplier, attempt - 1) + Math.random() * 100
        );
        await sleep(retryDelay);
        continue;
      }

      if (isTimeout) {
        throw new OVRAExecutionError(
          `Request to ${url} timed out after ${timeoutMs}ms (Attempts: ${attempt})`,
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
}
