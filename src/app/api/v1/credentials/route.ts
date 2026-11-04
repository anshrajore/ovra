import { NextResponse } from "next/server";
import { credentialBroker } from "@/lib/security/credential-broker";
import { db } from "@/lib/db";
import { credentialConnections } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "ws_team_workspace";

    const sampleCredentials = [
      {
        id: "cred_sample_slack",
        connectorId: "slack",
        accountLabel: "Enterprise Slack Bot",
        authType: "oauth2",
        maskedKey: "xoxb...91FA",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cred_sample_gemini",
        connectorId: "ai.agent",
        accountLabel: "Google Gemini 2.5 API Key",
        authType: "api_key",
        maskedKey: "AIza...4b01",
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      if (db) {
        const rows = await db
          .select({
            id: credentialConnections.id,
            connectorId: credentialConnections.connectorId,
            accountLabel: credentialConnections.accountLabel,
            authType: credentialConnections.authType,
            maskedKey: credentialConnections.maskedKey,
            createdAt: credentialConnections.createdAt,
            lastTestedAt: credentialConnections.lastTestedAt,
            expiresAt: credentialConnections.expiresAt,
          })
          .from(credentialConnections)
          .where(
            and(
              eq(credentialConnections.workspaceId, workspaceId as any),
              isNull(credentialConnections.revokedAt)
            )
          );

        return NextResponse.json({
          success: true,
          data: rows,
        });
      }
    } catch {
      // In-memory fallback if database query fails
    }

    return NextResponse.json({
      success: true,
      data: sampleCredentials,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId = "ws_team_workspace",
      connectorId,
      accountLabel,
      authType = "api_key",
      secret,
    } = body;

    if (!connectorId || !accountLabel || !secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: connectorId, accountLabel, secret",
        },
        { status: 400 }
      );
    }

    const { id, maskedKey } = await credentialBroker.storeCredential({
      workspaceId,
      connectorId,
      accountLabel,
      authType,
      secret,
    });

    return NextResponse.json({
      success: true,
      data: {
        id,
        accountLabel,
        connectorId,
        maskedKey,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to store credential" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get("id");
    const workspaceId = searchParams.get("workspaceId") || "ws_team_workspace";

    if (!credentialId) {
      return NextResponse.json(
        { success: false, error: "Missing credential id" },
        { status: 400 }
      );
    }

    const revoked = await credentialBroker.revokeCredential(credentialId, workspaceId);

    return NextResponse.json({
      success: true,
      revoked,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke credential" },
      { status: 500 }
    );
  }
}
