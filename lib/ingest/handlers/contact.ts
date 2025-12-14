/**
 * CONTACT SUBMISSION INGEST HANDLER
 * Handles ingestion of contact form submissions into the universal input system
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ContactSubmissionPayload, IngestResult, IngestError } from "../types";
import { generateEmbedding, formatEmbeddingForPgvector } from "../../embeddings";

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  }
  
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function handleContactSubmission(
  payload: ContactSubmissionPayload
): Promise<IngestResult | IngestError> {
  const { text, email, meta = {} } = payload;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      error: "Valid email is required",
      code: "VALIDATION_ERROR",
    };
  }

  // Validate message
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: "Message is required",
      code: "VALIDATION_ERROR",
    };
  }

  if (text.length > 5000) {
    return {
      success: false,
      error: "Message exceeds 5000 character limit",
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Generate embedding
    const { embedding } = await generateEmbedding(text);
    const embeddingVector = formatEmbeddingForPgvector(embedding);

    // Insert into universal inputs table
    const { data: inputData, error: inputError } = await supabaseAdmin
      .from("inputs")
      .insert({
        user_id: null, // Contact submissions can be anonymous
        kind: "contact_submission",
        text: text.trim(),
        embedding: embeddingVector,
        meta: {
          ...meta,
          email,
          surface: payload.surface,
        },
      })
      .select("id")
      .single();

    if (inputError) {
      console.error("Input insert error:", inputError);
      return {
        success: false,
        error: "Failed to store input",
        code: "DATABASE_ERROR",
      };
    }

    // Insert into contact_submissions domain table
    const { data: contactData, error: contactError } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        input_id: inputData.id,
        email,
        message: text.trim(),
      })
      .select("id")
      .single();

    if (contactError) {
      console.error("Contact submission insert error:", contactError);
      // Rollback input
      await supabaseAdmin.from("inputs").delete().eq("id", inputData.id);
      return {
        success: false,
        error: "Failed to store contact submission",
        code: "DATABASE_ERROR",
      };
    }

    return {
      success: true,
      inputId: inputData.id,
      domainId: contactData.id,
      kind: "contact_submission",
      embeddingGenerated: true,
    };
  } catch (error) {
    console.error("Contact ingest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "UNKNOWN_ERROR",
    };
  }
}
