/**
 * CHUEF INGEST TYPES
 * Type definitions for the universal input ingestion system
 */

export type InputKind = "chat_message" | "contact_submission";

export interface SurfaceMetadata {
  surface: string;       // e.g., "chatroom", "contact", "api"
  page?: string;         // e.g., "/chatroom", "/contact"
  userAgent?: string;
  referrer?: string;
}

export interface BaseIngestPayload {
  kind: InputKind;
  text: string;
  meta?: Record<string, unknown>;
  surface?: SurfaceMetadata;
}

export interface ChatMessagePayload extends BaseIngestPayload {
  kind: "chat_message";
  room?: string;
}

export interface ContactSubmissionPayload extends BaseIngestPayload {
  kind: "contact_submission";
  email: string;
}

export type IngestPayload = ChatMessagePayload | ContactSubmissionPayload;

export interface IngestResult {
  success: boolean;
  inputId: string;
  domainId: string;
  kind: InputKind;
  embeddingGenerated: boolean;
}

export interface IngestError {
  success: false;
  error: string;
  code: "UNAUTHORIZED" | "VALIDATION_ERROR" | "EMBEDDING_ERROR" | "DATABASE_ERROR" | "UNKNOWN_ERROR";
}

export type IngestResponse = IngestResult | IngestError;

export function isIngestError(response: IngestResponse): response is IngestError {
  return !response.success;
}
