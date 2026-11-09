# OVRA — Connector Rollout Roadmap & Benchmark Specification (v2.5)
**Date:** 9 November 2026  
**Strategy:** One Real Reference Connector (Google Sheets) Before Scaling to 10+ Connectors.

---

## 1. Rollout Strategy & Quality Gates

OVRA will not expand catalogue vanity counts. Every connector rolled out must satisfy the strict **Definition of a Real Connector**:
1. Registered with semantic version in `OVRAConnectorManifest`.
2. Schema-driven parameter configuration generated in the in-canvas inspector.
3. Dedicated credential lifecycle: OAuth2 with PKCE, API Key, or Connection Profile.
4. Dynamic resource loaders: real API calls to discover resources (e.g. Workbooks &rarr; Sheets &rarr; Columns).
5. All operations execute real external API requests and return typed `OVRAItem[]` envelopes.
6. 100% test coverage: manifest validation, unit tests, mock contract tests, and live sandbox integration tests.

---

## 2. Phased Rollout Sequence

### Milestone 1: The Reference Benchmark — Google Sheets
**Target Release:** Sprint 1  
**Capabilities Implemented:**
- **Auth:** Google OAuth2 with PKCE, scopes:
  `https://www.googleapis.com/auth/spreadsheets`, `https://www.googleapis.com/auth/drive.readonly`
- **Dynamic Loaders:**
  1. `loadSpreadsheets(query)`: Fetches user's spreadsheets from Google Drive API v3.
  2. `loadSheets(spreadsheetId)`: Fetches sheet tabs (`Sheet1`, `Sheet2`) from Google Sheets API v4.
  3. `loadColumns(spreadsheetId, sheetName)`: Reads row 1 header values to generate dynamic input fields.
- **Operations:**
  1. `sheets.list`: List available spreadsheets with metadata.
  2. `sheets.get`: Get metadata for a specific spreadsheet.
  3. `rows.read`: Read rows from a range (A1 notation or column header mapping).
  4. `rows.append`: Append a new row mapped from upstream node output items.
  5. `rows.update`: Update existing row by row index or key lookup.
  6. `rows.search`: Lookup rows matching column criteria.
  7. `rows.clear`: Clear row contents.

#### Milestone 1 Acceptance Workflow (Golden Path)
```
[Manual Trigger]
       │
       ▼
[Set Fields: customer="Aarav Sharma", plan="Enterprise", mrr=45000]
       │
       ▼
[Google Sheets: Append Row] (Live API Append to "Customer Pipeline")
       │
       ▼
[Google Sheets: Read Rows] (Live API Read to verify row was committed)
       │
       ▼
[IF Condition: mrr >= 30000]
      /   \
 (true)   (false)
    /       \
   ▼         ▼
[Slack Alert] [Nurture Email]
```

---

## 3. Subsequent Rollout Cohorts

### Cohort 1: Core Productivity & Communications (Sprint 2)
- **Slack (Upgrade from partial to full):**
  - Operations: `conversations.list`, `chat.postMessage`, `chat.update`, `chat.deleteMessage`, `users.lookupByEmail`.
  - Dynamic fields: Channel picker with search.
- **Gmail:**
  - Operations: `messages.list`, `messages.get`, `messages.send`.
  - Auth: Google OAuth2 (`mail.google.com`).
  - Dynamic fields: Label selector (`INBOX`, `SENT`, custom labels).

### Cohort 2: Databases & Storage (Sprint 3)
- **PostgreSQL:**
  - Operations: `select`, `insert`, `update`, `upsert`, `customQuery`.
  - Security: Parameterized SQL queries only (zero string concatenation), SSL enforcement, connection pool limits.
- **Supabase:**
  - Operations: `from.select`, `from.insert`, `from.update`, `from.delete`.
  - Auth: Project URL + Service Role Key / User JWT.
  - Dynamic fields: Table and column introspector.

### Cohort 3: FinTech & Payments (Sprint 4)
- **Stripe:**
  - Operations: `customers.create`, `customers.retrieve`, `paymentIntents.create`, `invoices.create`.
  - Triggers: Webhook trigger with signature validation and live replay.
- **Razorpay:**
  - Operations: `orders.create`, `payments.fetch`, `refunds.create`.
  - Auth: Key ID + Key Secret.
  - Triggers: Webhook trigger with raw-body HMAC-SHA256 validation.

### Cohort 4: DevOps & AI (Sprint 5)
- **GitHub:**
  - Operations: `issues.create`, `issues.comment`, `pulls.list`.
  - Dynamic fields: Repository picker with organization filter.
- **OpenAI & Google Gemini:**
  - Operations: `generateContent`, `structuredJsonExtraction`, `embeddings.create`.
  - Feature: Real-time token consumption attribution and budget gating.
