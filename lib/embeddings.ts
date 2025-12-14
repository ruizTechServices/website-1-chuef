/**
 * CHUEF EMBEDDINGS MODULE
 * Server-side only - generates embeddings using OpenAI text-embedding-3-small
 * 
 * This module is the SINGLE source of truth for embedding generation.
 * All input types (chat, contact, future) use this same module.
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embedding for a single text input
 * @param text - The text to embed
 * @returns EmbeddingResult with the embedding vector
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  return {
    embedding: response.data[0].embedding,
    model: response.model,
    usage: {
      prompt_tokens: response.usage.prompt_tokens,
      total_tokens: response.usage.total_tokens,
    },
  };
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @returns Array of EmbeddingResults
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const cleanTexts = texts.map(t => t.trim()).filter(t => t.length > 0);
  
  if (cleanTexts.length === 0) {
    return [];
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanTexts,
  });

  return response.data.map((item) => ({
    embedding: item.embedding,
    model: response.model,
    usage: {
      prompt_tokens: Math.floor(response.usage.prompt_tokens / cleanTexts.length),
      total_tokens: Math.floor(response.usage.total_tokens / cleanTexts.length),
    },
  }));
}

/**
 * Format embedding array for Supabase pgvector storage
 * @param embedding - The embedding array
 * @returns Formatted string for pgvector
 */
export function formatEmbeddingForPgvector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
