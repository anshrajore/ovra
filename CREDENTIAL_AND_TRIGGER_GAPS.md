# OVRA — Credential & Trigger System Gap Analysis (v2.5)
**Date:** 9 November 2026  
**Auditor:** Principal Workflow Runtime Engineer & Security Architect

---

## 1. Credential System Reality vs Target Architecture

| Capability | Current OVRA State | Required Production Standard | Gap Severity |
|---|---|---|---|
| **Storage Architecture** | `credential_connections` table exists in Supabase. `credential-broker.ts` has AES-256-GCM envelope logic, but has in-memory fallback. | Pure server-side KMS/envelope encryption. Browser never sees decrypted token; only receives masked ID (`cred_live_9481`). | High |
| **OAuth2 Flow** | Supported in auth login; connector OAuth uses manual tokens (`xoxb-`, Google API keys). | First-class OAuth2 authorization code with PKCE for Google, Slack, GitHub. Encrypted refresh token storage. | Critical |
| **Token Refresh** | Not wired to connector runtime. Expired tokens throw 401 error. | Automatic token refresh interceptor. Before executing a node, broker inspects `expiresAt`. If within 5 minutes of expiration, invokes provider refresh endpoint and saves new tokens with key rotation. | Critical |
| **Connection Test** | Basic status flag in table (`status: "active"`). | `testConnection(credentialId)` capability per connector. For Google: calls `oauth2.googleapis.com/tokeninfo`. For Slack: calls `auth.test`. | High |
| **Cross-Origin Security** | Credentials can be referenced by any node in the workspace. | Capability-scoped leasing. A node with connector `slack` can only lease credentials with connector `slack`. Cross-connector lease requests fail fast. | High |

---

## 2. Trigger System Reality vs Target Architecture

### Webhook Triggers
- **Current State:**
  - Route `/api/v1/webhooks/[triggerId]` receives HTTP requests.
  - Generates HMAC signature check in simulator.
- **Identified Gaps:**
  1. *Activation / Deactivation Lifecycle*: When a workflow is toggled active, OVRA must automatically register the webhook with the upstream provider (e.g., Stripe `stripe.webhookEndpoints.create`, GitHub repository hook). When paused, it must delete or disable the provider subscription.
  2. *Replay Defense & Deduplication*: Current route does not store idempotency keys in `idempotency_records`. Duplicate webhook posts trigger duplicate executions.
  3. *Raw Body Preservation*: HMAC validation requires access to the unaltered raw request buffer. Body parsing must not mutate whitespace or key order.

### Polling Triggers
- **Current State:**
  - No polling trigger infrastructure exists.
- **Identified Gaps:**
  1. *Cursor Watermark*: Polling triggers (e.g., Google Sheets "New Row Appended", Gmail "New Email Received") require persistent cursors (`lastRowIndex`, `historyId`, `updatedAfter`).
  2. *Deduplication Across Poll Windows*: Missing overlapping-window query to prevent skipped events during clock drift.
  3. *Checkpoint Persistence*: Cursor updates must only be committed to Supabase after the event execution has been accepted into the durable queue.

### Scheduled Cron Triggers
- **Current State:**
  - `core.cron_trigger` generates synthetic timestamp locally without durable cron scheduling.
- **Identified Gaps:**
  1. *Timezone & DST Evaluation*: Serverless environments run on UTC. Scheduled triggers must evaluate recurrence against the workspace's declared IANA timezone (`Asia/Kolkata`, `America/New_York`), accounting for Daylight Saving Time transitions.
  2. *Missed-Run Policy*: If the serverless host experiences a restart or delay, OVRA must evaluate whether to catch up missed runs or drop them.
