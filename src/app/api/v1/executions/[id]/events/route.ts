import { NextResponse } from "next/server";
import { supabaseRealtimeProvider } from "@/lib/providers/supabase-realtime";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const since = parseInt(searchParams.get("since") || "0", 10);

    const events = await supabaseRealtimeProvider.getEventsSince(id, since);

    return NextResponse.json({
      success: true,
      data: {
        executionId: id,
        sinceSequenceNumber: since,
        events,
        count: events.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch execution events" },
      { status: 500 }
    );
  }
}
