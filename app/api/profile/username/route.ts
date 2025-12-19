/**
 * USERNAME UPDATE API
 * POST /api/profile/username
 * 
 * Allows authenticated users to set their username ONE TIME ONLY.
 * Uses the set_username database function which enforces:
 * - Authentication required
 * - Username uniqueness (case-insensitive)
 * - One-time change limit
 * - Length constraints (3-30 chars)
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface UsernameRequest {
  username: string;
}

interface UsernameResponse {
  success: boolean;
  username?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UsernameResponse>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as UsernameRequest;
    
    if (!body.username || typeof body.username !== "string") {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const username = body.username.trim();

    // Call the database function to set username
    const { data, error } = await supabase.rpc("set_username", {
      p_username: username,
    });

    if (error) {
      console.error("Set username error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update username" },
        { status: 500 }
      );
    }

    // The function returns JSONB with success/error
    const result = data as { success: boolean; username?: string; error?: string };

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to set username" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      username: result.username,
    });

  } catch (error) {
    console.error("Username API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/username
 * 
 * Returns the current user's profile info including username and display name
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("username, username_changed")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError);
    }

    // Get display name using the database function
    const { data: displayNameResult } = await supabase.rpc("get_display_name", {
      p_user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      profile: {
        username: profile?.username || null,
        usernameChanged: profile?.username_changed || false,
        displayName: displayNameResult || "anon#????",
        canChangeUsername: !profile?.username_changed,
      },
    });

  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
