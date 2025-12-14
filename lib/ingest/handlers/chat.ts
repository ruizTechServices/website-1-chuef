/**
 * CHAT MESSAGE INGEST HANDLER
 * Handles ingestion of chat messages into the universal input system
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ChatMessagePayload, IngestResult, IngestError } from "../types";
import { generateEmbedding, formatEmbeddingForPgvector } from "../../embeddings";

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  }
  
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function handleChatMessage(
  payload: ChatMessagePayload,
  userId: string
): Promise<IngestResult | IngestError> {
  const { text, room = "lobby", meta = {} } = payload;

  // Validate
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: "Message text is required",
      code: "VALIDATION_ERROR",
    };
  }

  if (text.length > 2000) {
    return {
      success: false,
      error: "Message exceeds 2000 character limit",
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
        user_id: userId,
        kind: "chat_message",
        text: text.trim(),
        embedding: embeddingVector,
        meta: {
          ...meta,
          room,
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

    // Insert into chat_messages domain table
    const { data: chatData, error: chatError } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        input_id: inputData.id,
        user_id: userId,
        room,
        text: text.trim(),
      })
      .select("id")
      .single();

    if (chatError) {
      console.error("Chat message insert error:", chatError);
      // Rollback input
      await supabaseAdmin.from("inputs").delete().eq("id", inputData.id);
      return {
        success: false,
        error: "Failed to store chat message",
        code: "DATABASE_ERROR",
      };
    }

    return {
      success: true,
      inputId: inputData.id,
      domainId: chatData.id,
      kind: "chat_message",
      embeddingGenerated: true,
    };
  } catch (error) {
    console.error("Chat ingest error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "UNKNOWN_ERROR",
    };
  }
}
