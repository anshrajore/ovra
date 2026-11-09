# OVRA — Security Gaps in Node Execution & Transport
**Date:** 7 November 2026  
**Auditor:** Principal Security Engineer  
**Classification:** Confidential Security Audit

---

## 1. Executive Security Review

OVRA enforces strong cryptographic posture in certain areas (PostgreSQL RLS on 36 tables, AES-256-GCM envelope labels, zero-eval AST expression engine). However, several critical vulnerabilities and security gaps exist in the current connector execution layer that must be resolved before general availability.

---

## 2. Identified Vulnerabilities & Mitigation Roadmap

### Gap 1: SSRF DNS Rebinding & Redirect Vulnerability in HTTP Transport
- **Current State:** `core-http.ts` checks string hostnames against an IP blocklist (`localhost`, `127.0.0.1`, `169.254.169.254`).
- **Vulnerability:** An attacker can provide a hostname pointing to a public IP that subsequently redirects (HTTP 302) to `http://169.254.169.254/computeMetadata/v1` or performs DNS rebinding where TTL=0 resolves to `127.0.0.1` at socket connect time.
- **Required Mitigation:** Implement an egress proxy boundary that resolves DNS first, blocks private IP allocations, re-checks destination addresses on every HTTP redirect, and enforces protocol to HTTPS.

### Gap 2: In-Memory Credential Plaintext Exposure
- **Current State:** Node configurations allow users to enter raw API keys and tokens directly into node properties (`config.authKey`), storing them in unencrypted workflow definitions.
- **Vulnerability:** Workflow definitions exported as JSON or stored in client `localStorage` expose plaintext third-party secrets.
- **Required Mitigation:** Node configuration schemas MUST NEVER accept raw secrets. Nodes must only store a `credentialConnectionId`. Secrets must be retrieved ephemeral through the server-side `CredentialBroker` with an expiring lease.

### Gap 3: Header Redaction Absence in Execution Telemetry
- **Current State:** Telemetry and execution step logs record request headers and response bodies directly.
- **Vulnerability:** `Authorization: Bearer <token>` and `x-api-key` headers can be written to execution log tables and viewed by users with read-only audit roles.
- **Required Mitigation:** Implement recursive sanitization before persisting logs:
  ```ts
  const SENSITIVE_HEADERS = ["authorization", "x-api-key", "cookie", "set-cookie", "x-auth-token"];
  ```

### Gap 4: Resource Exhaustion & Payload Spillover (OOM)
- **Current State:** Large JSON responses (e.g., 50MB CSV/JSON download from an external API) are parsed directly into serverless memory.
- **Vulnerability:** Repeated concurrent runs of large payloads crash serverless worker instances with Out-Of-Memory (OOM) exceptions.
- **Required Mitigation:** Implement a 64 KiB payload threshold. Responses exceeding 64 KiB are streamed directly to private object storage buckets, and only signed references (`OVRAFileRef`) are forwarded through the DAG.
