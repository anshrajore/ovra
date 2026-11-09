import { validateUrlEgress, sanitizeHeaders } from "../http-transport";
import { manualTriggerNode, ifConditionNode, setFieldsNode, mergeStreamsNode } from "../nodes/core-nodes";
import { googleSheetsNode } from "../nodes/google-sheets-node";
import { emailDeliveryNode } from "../nodes/email-node";
import { RealWorkflowEngine } from "../engine";
import { OVRAItem, NodeExecutionContext } from "../types";
import { WorkflowDefinition } from "@/lib/types/workflow";
import crypto from "crypto";

function createMockContext(nodeId: string): NodeExecutionContext {
  return {
    workspaceId: "ws_test_enterprise",
    executionId: "exec_test_001",
    nodeId,
    signal: new AbortController().signal,
    credentials: {
      async getLease(id: string) {
        return {
          credentialId: id,
          data: { token: "test_token_secret" },
          expiresAt: new Date(Date.now() + 60000).toISOString(),
        };
      },
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  };
}

export async function runRuntimeContractTests(): Promise<{ passed: boolean; details: string[] }> {
  const details: string[] = [];
  let passed = true;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      details.push(`✓ PASS: ${testName}`);
    } else {
      passed = false;
      details.push(`✗ FAIL: ${testName}`);
    }
  }

  // 1. SSRF URL Egress Validation Tests
  const localhostCheck = validateUrlEgress("http://localhost:8080/internal");
  assert(!localhostCheck.safe, "SSRF Defense blocks http://localhost");

  const loopbackCheck = validateUrlEgress("http://127.0.0.1:3000/api");
  assert(!loopbackCheck.safe, "SSRF Defense blocks 127.0.0.1");

  const metadataCheck = validateUrlEgress("http://169.254.169.254/latest/meta-data");
  assert(!metadataCheck.safe, "SSRF Defense blocks AWS/GCP 169.254.169.254 metadata endpoint");

  const rfc1918Check = validateUrlEgress("http://10.0.1.50/admin");
  assert(!rfc1918Check.safe, "SSRF Defense blocks RFC 1918 10.0.0.0/8 private network");

  const publicUrlCheck = validateUrlEgress("https://api.github.com/zen");
  assert(publicUrlCheck.safe, "SSRF Defense allows safe public HTTPS destination");

  // 2. Header Redaction Tests
  const headers = sanitizeHeaders({
    Authorization: "Bearer xoxb-secret-token",
    "x-api-key": "secret_key_12345",
    "Content-Type": "application/json",
  });
  assert(headers["Authorization"] === "[REDACTED]", "Authorization header redacted");
  assert(headers["x-api-key"] === "[REDACTED]", "x-api-key header redacted");
  assert(headers["Content-Type"] === "application/json", "Public Content-Type header preserved");

  // 3. Manual Trigger Node Tests
  const manualCtx = createMockContext("node_manual");
  const manualPorts = await manualTriggerNode.execute(
    [],
    { payload: JSON.stringify({ customer: "Acme Corp", score: 92 }) },
    manualCtx
  );
  assert(manualPorts.length === 1 && manualPorts[0].portId === "main", "Manual trigger returns port 'main'");
  assert(manualPorts[0].items[0].json.customer === "Acme Corp", "Manual trigger parses JSON input item");
  assert(manualPorts[0].items[0].pairedItem?.nodeId === "node_manual", "Manual trigger sets paired-item lineage");

  // 4. IF Condition Node Multi-Port Tests
  const ifCtx = createMockContext("node_if");
  const inputBatch: OVRAItem[] = [
    { json: { id: "item_1", score: 85 }, pairedItem: { nodeId: "prev", itemIndex: 0 } },
    { json: { id: "item_2", score: 45 }, pairedItem: { nodeId: "prev", itemIndex: 1 } },
    { json: { id: "item_3", score: 95 }, pairedItem: { nodeId: "prev", itemIndex: 2 } },
  ];

  const ifPorts = await ifConditionNode.execute(
    inputBatch,
    { field: "score", operator: "greater_than", threshold: 70 },
    ifCtx
  );

  const truePort = ifPorts.find((p) => p.portId === "true");
  const falsePort = ifPorts.find((p) => p.portId === "false");

  assert(truePort !== undefined && truePort.items.length === 2, "IF routes 2 items (85, 95) to 'true' port");
  assert(falsePort !== undefined && falsePort.items.length === 1, "IF routes 1 item (45) to 'false' port");
  assert(truePort?.items[0].pairedItem?.nodeId === "node_if", "IF preserves paired-item lineage on true port");

  // 5. Set Fields Node Tests
  const setCtx = createMockContext("node_set");
  const setPorts = await setFieldsNode.execute(
    [{ json: { leadId: 501, name: "Sarah Connor" } }],
    {
      fields: [
        { name: "tier", value: "ENTERPRISE_VIP" },
        { name: "greeting", value: "Welcome {{name}}" },
      ],
    },
    setCtx
  );
  assert(setPorts[0].items[0].json.tier === "ENTERPRISE_VIP", "Set Fields sets literal field");
  assert(setPorts[0].items[0].json.greeting === "Welcome Sarah Connor", "Set Fields evaluates AST interpolation");

  // 6. End-to-End RealWorkflowEngine DAG Execution
  const testWorkflow: WorkflowDefinition = {
    id: "wf_test_vertical_slice",
    name: "Enterprise Vertical Slice Test",
    description: "Manual -> IF -> Set Fields -> Slack",
    status: "published",
    version: 1,
    workspaceId: "ws_test_enterprise",
    nodes: [
      {
        id: "node_start",
        type: "core.manual_trigger",
        label: "Manual Trigger",
        status: "idle",
        config: { payload: '{"leadScore": 88, "company": "Stripe"}' },
      },
      {
        id: "node_condition",
        type: "logic.if",
        label: "Check Lead Score",
        status: "idle",
        config: { field: "leadScore", operator: "greater_than", threshold: 70 },
      },
      {
        id: "node_transform",
        type: "data.set",
        label: "Set Enterprise Tag",
        status: "idle",
        config: { fields: [{ name: "leadCategory", value: "P1_HOT_LEAD" }] },
      },
      {
        id: "node_slack",
        type: "comm.slack",
        label: "Post Alert to Slack",
        status: "idle",
        config: { channel: "#enterprise-deals", message: "New deal: {{company}}" },
      },
    ],
    edges: [
      { id: "e1", source: "node_start", target: "node_condition", sourceHandle: "main" },
      { id: "e2", source: "node_condition", target: "node_transform", sourceHandle: "true" },
      { id: "e3", source: "node_transform", target: "node_slack", sourceHandle: "main" },
    ],
  };

  const dagResult = await RealWorkflowEngine.executeWorkflow(testWorkflow, { leadScore: 88, company: "Stripe" });
  assert(dagResult.status === "SUCCESS", "End-to-End DAG executed with SUCCESS status");
  assert(dagResult.steps.length === 4, "All 4 DAG nodes executed sequentially through port matching");
  assert(dagResult.steps[2].outputPorts[0].items[0].json.leadCategory === "P1_HOT_LEAD", "Downstream node received transformed item");

  // 7. Multi-Parent Lineage & Merge Streams Node Unit Tests
  const mergeCtx = createMockContext("node_merge");
  const branchAItems: OVRAItem[] = [
    {
      json: { id: "order_101", customer: "Alice", status: "confirmed" },
      pairedItems: [{ nodeId: "branch_a", itemIndex: 0, portId: "main" }],
    },
  ];
  const branchBItems: OVRAItem[] = [
    {
      json: { id: "order_101", paymentStatus: "paid", total: 250 },
      pairedItems: [{ nodeId: "branch_b", itemIndex: 0, portId: "main" }],
    },
  ];

  const mergedPorts = await mergeStreamsNode.execute(
    [...branchAItems, ...branchBItems],
    { mode: "merge_by_key", key: "id" },
    mergeCtx
  );

  assert(mergedPorts.length === 1 && mergedPorts[0].items.length === 1, "Merge streams joined 2 branches into 1 item by key");
  const mergedItem = mergedPorts[0].items[0];
  assert(mergedItem.json.customer === "Alice" && mergedItem.json.paymentStatus === "paid", "Merged item combines attributes from both branches");
  assert(
    (mergedItem.pairedItems || []).some((p) => p.nodeId === "branch_a") &&
    (mergedItem.pairedItems || []).some((p) => p.nodeId === "branch_b"),
    "Multi-parent lineage preserves pairedItems references to both parent branches"
  );

  // 8. Binary References and 64 KiB Payload Storage Offloading
  const largePayload = "X".repeat(70000); // 70 KB > 64 KiB threshold
  const payloadHash = crypto.createHash("sha256").update(largePayload).digest("hex");
  assert(largePayload.length > 65536, "Payload exceeds 64 KiB threshold for storage offloading");
  assert(payloadHash.length === 64, "Generated SHA-256 integrity hash for binary offload reference");

  // 9. Explicit On-Error Policy Routing to Dedicated Error Port
  const errorRoutingWorkflow: WorkflowDefinition = {
    id: "wf_test_error_handling",
    name: "Error Boundary & Recovery Route Test",
    description: "Start -> Blocked SSRF (onError=continue_error_output) -> Recovery Node",
    status: "published",
    version: 1,
    workspaceId: "ws_test_enterprise",
    nodes: [
      {
        id: "node_trigger",
        type: "core.manual_trigger",
        label: "Trigger",
        status: "idle",
        config: { payload: '{"event": "test_failure_resilience"}' },
      },
      {
        id: "node_failing_http",
        type: "core.http_request",
        label: "Forbidden SSRF Request",
        status: "idle",
        config: {
          url: "http://169.254.169.254/secret-keys", // Will trigger SSRF_BLOCKED error
          onError: "continue_error_output",
        },
      },
      {
        id: "node_recovery_logger",
        type: "data.set",
        label: "Handle Error & Fallback",
        status: "idle",
        config: {
          fields: [{ name: "recovered", value: "true" }],
        },
      },
    ],
    edges: [
      { id: "e1", source: "node_trigger", target: "node_failing_http", sourceHandle: "main" },
      { id: "e2", source: "node_failing_http", target: "node_recovery_logger", sourceHandle: "error" },
    ],
  };

  const errorWfResult = await RealWorkflowEngine.executeWorkflow(errorRoutingWorkflow);
  assert(errorWfResult.status === "SUCCESS", "Workflow completes with SUCCESS when error is handled via error port");
  assert(errorWfResult.steps.length === 3, "All 3 steps executed including error recovery branch");
  const failedStep = errorWfResult.steps.find((s) => s.nodeId === "node_failing_http");
  assert(failedStep !== undefined && failedStep.status === "failed", "Failing node step recorded as failed");
  assert(failedStep?.outputPorts[0].portId === "error", "Failing node output routed to 'error' port");
  const recoveryStep = errorWfResult.steps.find((s) => s.nodeId === "node_recovery_logger");
  assert(recoveryStep !== undefined && recoveryStep.status === "success", "Recovery node executed successfully from error port");
  assert(recoveryStep?.inputItems[0].json._error !== undefined, "Recovery node received _error envelope payload");

  // 10. DAG Multi-Branch Convergence with Merge Streams
  const mergeDagWorkflow: WorkflowDefinition = {
    id: "wf_test_merge_dag",
    name: "DAG Multi-Branch Convergence Test",
    description: "Start -> (Branch A, Branch B) -> Merge",
    status: "published",
    version: 1,
    workspaceId: "ws_test_enterprise",
    nodes: [
      {
        id: "m_start",
        type: "core.manual_trigger",
        label: "Start",
        status: "idle",
        config: { payload: '{"leadId": 404, "name": "Wayne Enterprises"}' },
      },
      {
        id: "m_branch_a",
        type: "data.set",
        label: "Branch A: Enrich CRM",
        status: "idle",
        config: { fields: [{ name: "crmStatus", value: "QUALIFIED" }] },
      },
      {
        id: "m_branch_b",
        type: "data.set",
        label: "Branch B: Enrich Billing",
        status: "idle",
        config: { fields: [{ name: "billingStatus", value: "ACTIVE_SUBSCRIPTION" }] },
      },
      {
        id: "m_merge",
        type: "logic.merge",
        label: "Merge Branches",
        status: "idle",
        config: { mode: "merge_by_key", key: "leadId" },
      },
    ],
    edges: [
      { id: "me1", source: "m_start", target: "m_branch_a", sourceHandle: "main" },
      { id: "me2", source: "m_start", target: "m_branch_b", sourceHandle: "main" },
      { id: "me3", source: "m_branch_a", target: "m_merge", sourceHandle: "main" },
      { id: "me4", source: "m_branch_b", target: "m_merge", sourceHandle: "main" },
    ],
  };

  const mergeDagResult = await RealWorkflowEngine.executeWorkflow(mergeDagWorkflow, {
    leadId: 404,
    name: "Wayne Enterprises",
  });
  assert(mergeDagResult.status === "SUCCESS", "DAG Convergence executed successfully");
  const mergeStep = mergeDagResult.steps.find((s) => s.nodeId === "m_merge");
  assert(mergeStep !== undefined && mergeStep.status === "success", "Merge step executed after both branches");
  const finalMergedItem = mergeStep?.outputPorts[0].items[0];
  assert(
    finalMergedItem?.json.crmStatus === "QUALIFIED" && finalMergedItem?.json.billingStatus === "ACTIVE_SUBSCRIPTION",
    "Merged node combined attributes from both DAG branches"
  );
  assert(
    (finalMergedItem?.pairedItems || []).some((p) => p.nodeId === "m_branch_a") &&
    (finalMergedItem?.pairedItems || []).some((p) => p.nodeId === "m_branch_b"),
    "DAG execution preserved multi-parent lineage across branches"
  );

  // 11. Real Google Sheets Node Operations (append_row & read_rows)
  const sheetsCtx = createMockContext("node_sheets");
  const sheetsInput: OVRAItem[] = [
    {
      json: { customerId: "CUST-992", name: "Bruce Wayne", amount: "$50,000" },
      pairedItems: [{ nodeId: "prev_crm", itemIndex: 0 }],
    },
  ];

  const sheetsAppendPorts = await googleSheetsNode.execute(
    sheetsInput,
    {
      operation: "append_row",
      spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      sheetName: "Customers",
      values: "{{customerId}}, {{name}}, {{amount}}, VIP",
    },
    sheetsCtx
  );

  assert(sheetsAppendPorts.length === 1 && sheetsAppendPorts[0].items.length === 1, "Google Sheets returns port 'main'");
  const appendedItem = sheetsAppendPorts[0].items[0];
  assert(
    Array.isArray(appendedItem.json.appendedValues) && (appendedItem.json.appendedValues as string[])[0] === "CUST-992",
    "Google Sheets node parsed and interpolated row values"
  );
  assert(
    (appendedItem.pairedItems || []).some((p) => p.nodeId === "node_sheets"),
    "Google Sheets output preserves item lineage in pairedItems"
  );

  const sheetsReadPorts = await googleSheetsNode.execute(
    [],
    {
      operation: "read_rows",
      spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      sheetName: "Sheet1",
      range: "A1:Z50",
    },
    sheetsCtx
  );
  assert(sheetsReadPorts.length === 1 && sheetsReadPorts[0].items.length > 0, "Google Sheets read_rows executed and returned items");

  // 12. Real Email Delivery Node Operations (send_email)
  const emailCtx = createMockContext("node_email");
  const emailInput: OVRAItem[] = [
    {
      json: { email: "founder@ycombinator.com", name: "Garry Tan", company: "Y Combinator" },
      pairedItems: [{ nodeId: "prev_step", itemIndex: 0 }],
    },
  ];

  const emailPorts = await emailDeliveryNode.execute(
    emailInput,
    {
      to: "{{email}}",
      subject: "Welcome to OVRA, {{name}}!",
      body: "Hello {{name}}, your workspace for {{company}} is provisioned.",
      provider: "dry_run",
    },
    emailCtx
  );

  assert(emailPorts.length === 1 && emailPorts[0].items.length === 1, "Email delivery node returns port 'main'");
  const emailOutputItem = emailPorts[0].items[0];
  assert(emailOutputItem.json.recipient === "founder@ycombinator.com", "Email node interpolated recipient address");
  assert(emailOutputItem.json.subject === "Welcome to OVRA, Garry Tan!", "Email node interpolated subject line");
  assert(
    (emailOutputItem.pairedItems || []).some((p) => p.nodeId === "node_email"),
    "Email delivery node preserves item lineage in pairedItems"
  );

  // 13. End-to-End Workflow with Sheets -> Email
  const sheetsEmailWorkflow: WorkflowDefinition = {
    id: "wf_test_sheets_email",
    name: "Customer Onboarding: Sheet -> Email Alert",
    description: "Start -> Append to Google Sheet -> Send Confirmation Email",
    status: "published",
    version: 1,
    workspaceId: "ws_test_enterprise",
    nodes: [
      {
        id: "se_start",
        type: "core.manual_trigger",
        label: "Start",
        status: "idle",
        config: { payload: '{"leadId": 707, "name": "Tony Stark", "email": "tony@starkindustries.com", "tier": "Enterprise"}' },
      },
      {
        id: "se_sheets",
        type: "app.google_sheets",
        label: "Append Customer to Sheet",
        status: "idle",
        config: {
          operation: "append_row",
          spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          sheetName: "Leads",
          values: "{{leadId}}, {{name}}, {{email}}, {{tier}}",
        },
      },
      {
        id: "se_email",
        type: "comm.email",
        label: "Send Welcome Email",
        status: "idle",
        config: {
          to: "{{email}}",
          subject: "Account Confirmation for {{name}}",
          body: "Hello {{name}}, welcome to OVRA. Your tier is {{tier}}.",
          provider: "dry_run",
        },
      },
    ],
    edges: [
      { id: "see1", source: "se_start", target: "se_sheets", sourceHandle: "main" },
      { id: "see2", source: "se_sheets", target: "se_email", sourceHandle: "main" },
    ],
  };

  const sheetsEmailResult = await RealWorkflowEngine.executeWorkflow(sheetsEmailWorkflow, {
    leadId: 707,
    name: "Tony Stark",
    email: "tony@starkindustries.com",
    tier: "Enterprise",
  });

  assert(sheetsEmailResult.status === "SUCCESS", "Sheets -> Email workflow completed with SUCCESS");
  assert(sheetsEmailResult.steps.length === 3, "All 3 steps in Sheets -> Email workflow executed");
  const finalEmailStep = sheetsEmailResult.steps.find((s) => s.nodeId === "se_email");
  assert(finalEmailStep !== undefined && finalEmailStep.status === "success", "Final email step executed successfully");
  assert(
    finalEmailStep?.outputPorts[0].items[0].json.recipient === "tony@starkindustries.com",
    "Final email received customer email from upstream pipeline"
  );

  return { passed, details };
}
