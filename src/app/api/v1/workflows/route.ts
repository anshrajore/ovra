import { NextResponse } from "next/server";
import { initialWorkflow } from "@/lib/data/initial-workflow";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [initialWorkflow],
    meta: {
      total: 1,
      workspaceId: "ws_team_workspace",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      data: {
        id: body.id || `wf_${Date.now()}`,
        name: body.name || "Untitled Flow",
        version: (body.version || 1) + 1,
        status: body.status || "draft",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
