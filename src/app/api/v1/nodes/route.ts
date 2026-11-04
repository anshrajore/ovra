import { NextResponse } from "next/server";
import { nodeRegistry } from "@/lib/node-platform";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category") || "all";
    const kind = searchParams.get("kind") || "all";
    const connectorId = searchParams.get("connectorId") || undefined;

    if (search) {
      const results = nodeRegistry.searchNodes(search);
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    const nodes = nodeRegistry.listNodes({
      category,
      kind,
      connectorId,
    });

    const connectors = nodeRegistry.listConnectors(category);

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        connectors,
        total: nodes.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch nodes" },
      { status: 500 }
    );
  }
}
