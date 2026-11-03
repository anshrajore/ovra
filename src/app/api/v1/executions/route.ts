import { NextResponse } from "next/server";
import { defaultExecutionProvider } from "@/lib/simulator/engine";
import { initialWorkflow } from "@/lib/data/initial-workflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await defaultExecutionProvider.startExecution({
      workflowId: body.workflowId || initialWorkflow.id,
      workflowVersionId: "v1",
      triggerType: body.triggerType || "manual",
      triggerPayload: body.payload || {},
      workspaceId: body.workspaceId || "ws_team_workspace",
      organizationId: "org_default",
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to initiate execution" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get("id");

  if (!executionId) {
    return NextResponse.json(
      { success: false, error: "Missing execution id parameter" },
      { status: 400 }
    );
  }

  const result = await defaultExecutionProvider.getExecutionStatus(executionId);
  return NextResponse.json({
    success: true,
    data: result,
  });
}
