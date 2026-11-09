import { NextResponse } from "next/server";
import { runRuntimeContractTests } from "@/lib/runtime/__tests__/runtime-contracts.test";

export async function GET() {
  try {
    const result = await runRuntimeContractTests();
    return NextResponse.json({
      status: result.passed ? "passed" : "failed",
      summary: result.passed ? "All runtime contract tests passed (100%)" : "Some contract tests failed",
      details: result.details,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
