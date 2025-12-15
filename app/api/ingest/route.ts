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
  SurfaceMetadata,
  isIngestError,
  handleChatMessage,
  handleContactSubmission,
} from "@/lib/ingest";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/captcha";

// Rate limit configs per kind
const RATE_LIMITS = {
  chat_message: { windowMs: 60 * 1000, maxRequests: 30 },      // 30/min for chat
  contact_submission: { windowMs: 60 * 1000, maxRequests: 5 }, // 5/min for contact
};

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

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitKey = `${body.kind}:${clientId}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS[body.kind] || RATE_LIMITS.chat_message);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Rate limited. Try again in ${rateLimit.resetIn} seconds.`, 
          code: "VALIDATION_ERROR" 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetIn),
          }
        }
      );
    }

    // Extract surface metadata from request if not provided
    if (!body.surface) {
      body.surface = {
        surface: body.kind === "chat_message" ? "chatroom" : "contact",
        userAgent: request.headers.get("user-agent") || undefined,
        referrer: request.headers.get("referer") || undefined,
      } as SurfaceMetadata;
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
        
        // Check for cooldown violation (DB enforced via RLS)
        if (isIngestError(result) && result.error?.includes("violates row-level security")) {
          return NextResponse.json(
            { success: false, error: "Cooldown: please wait 30 seconds between messages.", code: "COOLDOWN" } as const,
            { status: 429 }
          );
        }
        
        const status = result.success ? 201 : 400;
        return NextResponse.json(result, { status });
      }

      case "contact_submission": {
        // Verify reCAPTCHA before processing
        if (!body.captchaToken) {
          return NextResponse.json(
            { success: false, error: "Captcha verification required", code: "CAPTCHA_REQUIRED" },
            { status: 400 }
          );
        }

        const captchaResult = await verifyRecaptcha(body.captchaToken, clientId);
        if (!captchaResult.ok) {
          return NextResponse.json(
            { success: false, error: captchaResult.reason || "Captcha verification failed", code: "CAPTCHA_FAILED" },
            { status: 403 }
          );
        }

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
