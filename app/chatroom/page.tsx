/**
 * CHUEF LOBBY CHATROOM
 * The first visible surface of the input-first platform
 * 
 * - Public users: CAN read, CANNOT write
 * - Auth users: CAN read and write
 * - Realtime updates via Supabase
 * - All messages are embedded and stored in universal input ledger
 */

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ChatRoom, ChatMessage } from "@/components/chat";

async function getInitialMessages(room: string = "lobby"): Promise<ChatMessage[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("chat_messages_with_user")
    .select("id, text, created_at, user_id, display_name, avatar_url")
    .eq("room", room)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }

  return data || [];
}

export default async function ChatroomPage() {
  const messages = await getInitialMessages();

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header spacer for fixed nav */}
      <div className="h-24" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider"
              style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
            >
              Live
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight"
            style={{ 
              fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            }}
          >
            The Lobby
          </h1>
          <p 
            className="text-gray-400 mt-2 uppercase tracking-wide text-sm"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            A public, realtime text space. Read freely. Sign in to participate.
          </p>
        </div>

        {/* Chat container */}
        <div 
          className="h-[calc(100vh-320px)] min-h-[500px] bg-zinc-900/80 border-2 border-zinc-700 backdrop-blur-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 99.5% 100%, 0.5% 100%)' }}
        >
          <ChatRoom initialMessages={messages} room="lobby" />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p 
            className="text-xs text-gray-500 uppercase tracking-wider"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            Every message is stored and understood — not discarded.
          </p>
        </div>
      </div>

      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}

export const metadata = {
  title: "The Lobby | Chuef",
  description: "A public, realtime text space where every input is remembered.",
};
