# Chuef Universal Input Ingestion System

## Overview

Chuef is an **input-first public space** where every piece of text is treated as data worth remembering. This document describes the universal input ingestion system that powers all text input across Chuef.

## Architecture

```
    HUMAN TEXT
         ↓
    Universal Ingest
    POST /api/ingest
         ↓
┌────────┴────────┐
↓                 ↓
Realtime Surface   Stored Meaning
(chat_messages)   (inputs + pgvector embeddings)
```

## Two-Layer Storage Model

### 1. Universal Input Ledger (`inputs` table)
- Stores **every** input with embeddings
- Single source of truth for all text data
- Enables semantic search across all input types

### 2. Domain Tables
- `chat_messages` - Chat-specific data
- `contact_submissions` - Contact form data
- All domain tables reference `inputs.id` via foreign key

## API Endpoints

### POST /api/ingest
The **single entry point** for all input ingestion.

#### Chat Message
```json
{
  "kind": "chat_message",
  "text": "Hello world!",
  "room": "lobby"
}
```
**Requires authentication.**

#### Contact Submission
```json
{
  "kind": "contact_submission",
  "text": "Your message here",
  "email": "user@example.com"
}
```
**Does NOT require authentication.**

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key
```

## Database Setup

Run the migration in Supabase SQL Editor:

```bash
supabase/migrations/001_chuef_input_system.sql
```

This creates:
- `inputs` table with pgvector embeddings
- `chat_messages` table
- `contact_submissions` table
- `chat_messages_with_user` view
- RLS policies for public read / auth write
- `match_inputs()` function for semantic search

## RLS Policies

### inputs
- **Public SELECT**: Only `chat_message` kind
- **Auth INSERT**: User can insert own inputs

### chat_messages
- **Public SELECT**: All messages readable
- **Auth INSERT**: User can insert own messages

### contact_submissions
- **Public INSERT**: Anyone can submit
- **No public SELECT**: Protected

## Realtime

Supabase Realtime is enabled on `chat_messages` table. Public users receive live updates without authentication.

## Files Structure

```
lib/
├── embeddings.ts          # OpenAI embedding generation
└── ingest/
    ├── index.ts           # Module exports
    ├── types.ts           # Type definitions
    └── handlers/
        ├── chat.ts        # Chat message handler
        └── contact.ts     # Contact submission handler

components/
├── chat/
│   ├── index.ts
│   ├── chat-room.tsx      # Main chat component
│   ├── chat-message-list.tsx
│   └── chat-input.tsx
└── contact/
    ├── index.ts
    └── contact-form.tsx

app/
├── api/
│   └── ingest/
│       └── route.ts       # Universal ingest endpoint
├── chatroom/
│   └── page.tsx           # Public lobby chat
└── contact/
    └── page.tsx           # Contact form
```

## Key Principles

1. **Single Ingest Endpoint**: All text input goes through `/api/ingest`
2. **Universal Embeddings**: Every input is embedded using `text-embedding-3-small`
3. **Two-Layer Storage**: Universal ledger + domain-specific tables
4. **Public Read, Auth Write**: Chat is publicly readable, writing requires auth
5. **Server-Side Embeddings Only**: Never generate embeddings on the client
