import { NextResponse } from "next/server";
import { testNodeExecution } from "@/lib/node-platform";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nodeType, config = {}, input = {} } = body;

    if (!nodeType) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: nodeType" },
        { status: 400 }
      );
    }

    const result = await testNodeExecution(nodeType, input, config);

    return NextResponse.json({
      success: result.success,
      data: {
        output: result.output,
        logs: result.logs,
        error: result.error,
        durationMs: result.durationMs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute node test" },
      { status: 500 }
    );
  }
}
