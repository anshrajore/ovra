import { NextResponse } from "next/server";
import { defaultExecutionProvider } from "@/lib/simulator/engine";
import { initialWorkflow } from "@/lib/data/initial-workflow";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ triggerId: string }> }
) {
  try {
    const { triggerId } = await params;
    const body = await request.json().catch(() => ({}));
    const signature = request.headers.get("x-ovra-signature") || "simulated_valid";

    // Immediate 202 Accepted response for webhook ingestion
    const execution = await defaultExecutionProvider.startExecution({
      workflowId: initialWorkflow.id,
      workflowVersionId: "v1",
      triggerType: "webhook",
      triggerPayload: body,
      workspaceId: "ws_team_workspace",
      organizationId: "org_default",
    });

    return NextResponse.json(
      {
        accepted: true,
        triggerId,
        executionId: execution.executionId,
        status: "QUEUED",
        receivedAt: new Date().toISOString(),
      },
      { status: 202 }
    );
  } catch (error) {
    return NextResponse.json(
      { accepted: false, error: "Internal webhook dispatch error" },
      { status: 500 }
    );
  }
}
