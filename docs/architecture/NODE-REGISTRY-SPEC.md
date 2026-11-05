# OVRA — Node Platform & Decoupled Registry Specification

## 1. Architectural Philosophy

Nodes and Connectors are decoupled:
- **Connector**: Represents an application or third-party service (e.g., `Google Sheets`, `Razorpay`, `Slack`). Connectors define authentication profiles, base URLs, and connection tests.
- **Node Operation**: Represents a specific action or trigger belonging to a connector (e.g., `app.google_sheets.append_row`, `core.webhook`).

```
┌────────────────────────────────────────────────────────┐
│                    Connector Manifest                  │
│ id: 'app.google_sheets' | authType: 'oauth2'          │
└───────────────────────────┬────────────────────────────┘
                            │ 1:N
┌───────────────────────────┴────────────────────────────┐
│                      Node Manifest                     │
│ id: 'app.google_sheets.append_row'                     │
│ inputSchema: JSONSchema7 | outputSchema: JSONSchema7   │
│ execute(ctx: OVRAExecutionContext): NodeExecutionResult│
└────────────────────────────────────────────────────────┘
```

---

## 2. Package Architecture (`src/lib/node-platform/`)

The Node Platform is structured into isolated packages:
- **`contracts`**: Defines `NodeManifest`, `ConnectorManifest`, `OVRAExecutionContext`, `CredentialLease`, `RateLimiter`.
- **`expression-engine`**: Evaluates `{{outputs.riskScore > 0.8}}` and template interpolations using safe AST traversals. **Strictly prohibits `eval()` or `new Function()`**.
- **`schema`**: JSON Schema v7 validation and form field derivation.
- **`sdk`**: Fluent builders `defineNode()` and `defineConnector()`.
- **`testkit`**: Mock contexts and isolated node runner `testNodeExecution()`.
- **`registry`**: Versioned catalog singleton with category indexing and search.

---

## 3. Node Manifest Interface Contract

```typescript
export interface NodeManifest<TConfig = Record<string, any>> {
  id: string;
  connectorId: string;
  version: string;
  displayName: string;
  description: string;
  category: 'triggers' | 'actions' | 'logic' | 'ai' | 'communication' | 'databases';
  kind: 'trigger' | 'action' | 'router';
  configSchema: JSONSchema7;
  inputSchema: JSONSchema7;
  outputSchema: JSONSchema7;
  uiSchema?: Record<string, any>;
  credentials?: {
    type: 'oauth2' | 'apiKey' | 'bearer' | 'basic' | 'custom';
    required: boolean;
    scopes?: string[];
  };
  execute: (context: OVRAExecutionContext) => Promise<NodeExecutionResult>;
}
```

---

## 4. The 15 Foundation Nodes

1. `core.webhook`: Inbound HTTP listener with HMAC-SHA256 signature verification.
2. `core.manual_trigger`: Test runner trigger with simulated input payloads.
3. `core.schedule`: Timezone-aware cron and interval dispatcher.
4. `core.http_request`: SSRF-defended universal HTTP/REST client.
5. `logic.if`: Dynamic conditional branching based on AST expressions.
6. `logic.switch`: Multi-path router evaluating case statements.
7. `logic.merge`: Confluence node synchronizing multiple upstream branches.
8. `logic.loop`: Bounded array iteration with max iteration ceilings.
9. `data.set_fields`: Variable projection, type conversion, and key mapping.
10. `data.json_parser`: JSON schema validation, XML to JSON, and stringify.
11. `ai.model`: Multi-model completion router (Gemini 2.5 Pro/Flash, Claude, GPT-4o).
12. `ai.agent`: Autonomous agent step with tool-calling capabilities.
13. `comm.slack`: Channel messages and interactive alert dispatch.
14. `comm.email`: Transactional email delivery via SMTP/Resend.
15. `db.postgres` & `app.google_sheets`: Parameterized SQL and spreadsheet row management.
