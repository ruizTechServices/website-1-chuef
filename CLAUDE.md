# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Chuef is a Next.js 16 web application that serves as an "input-first platform" - every user interaction (chat messages, contact submissions) is stored in a universal input ledger with OpenAI embeddings for semantic search. The app features a public chatroom (The Lobby) where anonymous users can read but only authenticated users can write, plus a contact form and user dashboard.

## Technology Stack

- **Framework**: Next.js 16.0.10 with App Router
- **Runtime**: React 19.2.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database**: Supabase (PostgreSQL with pgvector extension)
- **Authentication**: Supabase Auth with Google OAuth
- **AI/ML**: OpenAI API (text-embedding-3-small for embeddings)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Security**: Google reCAPTCHA v3, rate limiting, RLS policies

## Common Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Production
npm run build        # Build for production (creates .next directory)
npm start            # Start production server

# Linting
npm run lint         # Run ESLint with Next.js config
```

## Environment Variables

Required environment variables (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=              # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=             # Server-side admin key (ingest handlers)
OPENAI_API_KEY=                        # OpenAI API key for embeddings
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=        # reCAPTCHA site key (public)
RECAPTCHA_SECRET_KEY=                  # reCAPTCHA secret key (server-only)
```

## Core Architecture

### Universal Input Ingestion System

All user inputs flow through a centralized ingestion pipeline:

1. **Single Entry Point**: `/api/ingest` (POST) - routes all input types
2. **Input Types**: Defined in `lib/ingest/types.ts` as `InputKind` union type
3. **Handlers**: Domain-specific handlers in `lib/ingest/handlers/`
4. **Storage**: Dual write pattern - universal `inputs` table + domain tables (`chat_messages`, `contact_submissions`)
5. **Embeddings**: All text generates OpenAI embeddings via `lib/embeddings.ts`

**Flow for chat messages**:
```
Client → /api/ingest → handleChatMessage() → OpenAI embedding → Supabase (inputs + chat_messages)
```

**Flow for contact submissions**:
```
Client → reCAPTCHA → /api/ingest → handleContactSubmission() → OpenAI embedding → Supabase (inputs + contact_submissions)
```

### Authentication & Authorization

- **Client-side auth**: `utils/supabase/client.ts` creates browser client
- **Server-side auth**: `utils/supabase/server.ts` creates server client with cookies
- **Service role**: Ingest handlers use service role client for bypassing RLS
- **Google OAuth**: Flow in `lib/auth.ts` with redirect to `/auth/callback`
- **Protected routes**: Dashboard requires auth, chatroom read is public, write requires auth

### Database Schema (Supabase)

Key tables:
- `inputs` - Universal input ledger with embeddings (pgvector)
- `chat_messages` - Chat-specific data, references `inputs.id`
- `contact_submissions` - Contact form data, references `inputs.id`
- `chat_messages_with_user` - View joining chat messages with user profiles

Row-Level Security (RLS):
- Chatroom: 30-second cooldown enforced via RLS policy
- Contact: No auth required, protected by reCAPTCHA + rate limits
- Dashboard: Admin users see contact submissions, regular users see stats

### Real-time Updates

Chatroom uses Supabase Realtime channels:
```typescript
supabase.channel(`chat:${room}`)
  .on('postgres_changes', { event: 'INSERT', table: 'chat_messages' }, callback)
```

New messages trigger client-side updates without page reload.

### Rate Limiting & Security

- **Client-side rate limits**: Enforced in `/api/ingest` using `lib/rate-limit.ts`
  - Chat: 30 messages/minute per client
  - Contact: 5 submissions/minute per client
- **Server-side cooldown**: 30-second cooldown between chat messages (RLS)
- **reCAPTCHA**: Required for contact form submissions
- **Optimistic updates**: Chat input shows message immediately, rolls back on error

## File Structure

```
app/
  page.tsx                    # Homepage with Hero + CTA
  layout.tsx                  # Root layout with Header
  chatroom/page.tsx           # The Lobby - public chat room
  dashboard/page.tsx          # User dashboard (auth required)
  contact/page.tsx            # Contact form page
  login/page.tsx              # Login page with Google OAuth
  auth/callback/route.ts      # OAuth callback handler
  api/ingest/route.ts         # Universal input ingestion endpoint

components/
  auth/                       # Google sign-in, sign-out buttons
  chat/                       # ChatRoom, ChatMessageList, ChatInput
  contact/                    # ContactForm
  homepage/                   # Hero, CallToAction
  layout/                     # Header
  effects/                    # Paint splat visual effects

lib/
  auth.ts                     # Authentication helpers
  embeddings.ts               # OpenAI embedding generation (server-only)
  rate-limit.ts               # In-memory rate limiting
  captcha/                    # reCAPTCHA verification
  ingest/
    index.ts                  # Exports for ingest module
    types.ts                  # TypeScript types for input system
    handlers/
      chat.ts                 # Chat message handler
      contact.ts              # Contact submission handler

utils/supabase/
  client.ts                   # Browser Supabase client
  server.ts                   # Server Supabase client
  proxy.ts                    # Proxy client (if needed)
```

## Design System

The site uses a "grungy cyberpunk" aesthetic:
- **Fonts**: Impact, Haettenschweiler for headings (uppercase, bold)
- **Colors**: Zinc-950 backgrounds, blue/red accent colors, heavy shadows
- **Effects**: SVG noise textures, vignette overlays, angled clip-paths
- **Components**: Angular UI elements with `clipPath: 'polygon(...)'` for skewed edges

## Key Implementation Patterns

### Adding New Input Types

To add a new input type (e.g., "poll_vote"):

1. Add type to `lib/ingest/types.ts`:
   ```typescript
   export type InputKind = "chat_message" | "contact_submission" | "poll_vote";
   export interface PollVotePayload extends BaseIngestPayload {
     kind: "poll_vote";
     pollId: string;
     choice: string;
   }
   ```

2. Create handler in `lib/ingest/handlers/poll.ts`:
   ```typescript
   export async function handlePollVote(payload: PollVotePayload, userId?: string) {
     // Generate embedding, insert to inputs + poll_votes tables
   }
   ```

3. Add route case in `app/api/ingest/route.ts`:
   ```typescript
   case "poll_vote": {
     const result = await handlePollVote(body, user?.id);
     // ...
   }
   ```

### Supabase Client Usage

- **Client Components**: Use `createClient()` from `utils/supabase/client.ts`
- **Server Components/Actions**: Use `createClient(await cookies())` from `utils/supabase/server.ts`
- **API Routes (ingest)**: Create admin client directly with service role key

### Embeddings

All embedding generation MUST use `lib/embeddings.ts`:
```typescript
import { generateEmbedding, formatEmbeddingForPgvector } from "@/lib/embeddings";

const { embedding } = await generateEmbedding(text);
const embeddingVector = formatEmbeddingForPgvector(embedding);

// Insert with embeddingVector
```

Model: `text-embedding-3-small` (1536 dimensions)

## TypeScript Configuration

- **Path aliases**: `@/*` maps to project root
- **Strict mode**: Enabled
- **JSX**: `react-jsx` (not preserve)
- **Target**: ES2017

## Important Notes

- **Never commit `.env`** - secrets are gitignored
- **Service role key**: Only use in server-side code, never expose to client
- **RLS policies**: Database enforces 30-second cooldown on chat, handlers assume RLS active
- **Realtime channels**: Must unsubscribe in cleanup to avoid memory leaks
- **Optimistic updates**: Used in chatroom for instant feedback, rollback on failure
- **Admin role**: Determined by `user.app_metadata.role === "admin"` - set in Supabase Auth
