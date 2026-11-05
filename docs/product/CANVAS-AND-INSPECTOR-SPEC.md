# OVRA — Workflow Canvas & Node Inspector Specification

## 1. Canvas Information Architecture

The workflow canvas is the primary product surface for authoring, configuring, and debugging automations.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Canvas Top Bar: Workflow Name | Status Badge | Undo/Redo | Test | Publish │
├────────────┬──────────────────────────────────────────────┬───────────────┤
│ Left Rail  │ React Flow Dynamic Graph Canvas              │ Right Context │
│ - Add Node │ - Pinned inputs/outputs                     │ Inspector     │
│ - Outline  │ - Typed connection ports                     │ - Configure   │
│ - Variables│ - Branch route labels & indicators           │ - Auth        │
│ - Notes    │ - Live execution status glow                │ - Map / Test  │
├────────────┴──────────────────────────────────────────────┴───────────────┤
│ Bottom Drawer: Run State | Sequence Timeline | Node Logs | Step I/O Trace │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Contextual Node Inspector Specification

The right inspector drawer dynamically renders tabbed interfaces tailored to the selected node type:

### 2.1 Generic Node Tabs
1. **Configure**: Schema-driven form fields derived from `configSchema`.
2. **Credentials**: Connected workspace credentials or auth profile binding.
3. **Test Bench**: Single-node bounded test harness with sample inputs.
4. **Output / Schema**: Real-time output schema preview and JSON tree viewer.

### 2.2 Dedicated HTTP/API Request Node Tabs (`core.http_request`)
Per the executive decision, API testing lives inside the canvas inspector:

1. **Configure**:
   - HTTP Method: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`.
   - URL: Base URL with dynamic variable pills (e.g., `https://api.example.com/v1/{{nodes.trigger.id}}`).
   - Query Parameters & Path Parameters: Key-value table.
   - Headers: Key-value table with autocomplete for standard headers (`Content-Type`, `Accept`, etc.).
   - Body: Raw JSON editor, Form-data, or URL-encoded with syntax highlighting.
2. **Authentication**:
   - Auth Type: None, API Key (Header/Query), Bearer Token, Basic Auth, or OAuth2 Reference.
   - Credential Reference: Secure lease selector linking to workspace credential vault.
3. **Mapping**:
   - Upstream node output explorer.
   - Interpolation picker (`{{nodes.upstreamNode.data.field}}`) with live preview of resolved values.
4. **Test**:
   - Bounded execution runner with a 15-second timeout and 2 MiB response size ceiling.
   - Side-effect safety alert: *"Warning: This test will send a live HTTP request to external services."*
5. **Response**:
   - HTTP Status Code badge (e.g., `200 OK`, `404 Not Found`).
   - Round-trip latency (ms) and response headers table.
   - Formatted JSON response viewer with one-click copy.
   - **Schema Inference Button**: Automatically updates downstream node schemas using the returned payload keys.
6. **Advanced**:
   - Timeout (ms), Redirect policy (follow/error), Retries (exponential backoff count), Idempotency Key header, Pagination rules.

---

## 3. In-Editor Debugging & Replay

- **Pin Node Output**: Developers can pin a successful execution payload as a mock fixture, allowing rapid downstream node configuration without re-triggering external webhooks.
- **Run from Selected Node**: Executes the downstream DAG using pinned or historical inputs.
- **Contextual "Open HTTP Details"**: Available on third-party connector nodes (e.g., Slack, Google Sheets) to inspect underlying API network requests for troubleshooting.
