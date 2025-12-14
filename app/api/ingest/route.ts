/**
 * CHUEF UNIVERSAL INGEST API
 * POST /api/ingest
 * 
 * This is the SINGLE entry point for ALL input ingestion.
 * Chat messages, contact submissions, and all future input types
 * MUST go through this endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  IngestPayload,
  IngestResponse,
  handleChatMessage,
  handleContactSubmission,
} from "@/lib/ingest";

export async function POST(request: NextRequest): Promise<NextResponse<IngestResponse>> {
  try {
    const body = await request.json() as IngestPayload;

    // Validate kind
    if (!body.kind) {
      return NextResponse.json(
        { success: false, error: "Missing 'kind' field", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Route to appropriate handler based on kind
    switch (body.kind) {
      case "chat_message": {
        // Chat messages REQUIRE authentication
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.json(
            { success: false, error: "Authentication required to send messages", code: "UNAUTHORIZED" },
            { status: 401 }
          );
        }

        const result = await handleChatMessage(body, user.id);
        const status = result.success ? 201 : 400;
        return NextResponse.json(result, { status });
      }

      case "contact_submission": {
        // Contact submissions do NOT require authentication
        const result = await handleContactSubmission(body);
        const status = result.success ? 201 : 400;
        return NextResponse.json(result, { status });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown input kind: ${(body as { kind: string }).kind}`, code: "VALIDATION_ERROR" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
