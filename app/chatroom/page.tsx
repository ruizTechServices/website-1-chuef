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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header spacer for fixed nav */}
      <div className="h-20" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            The Lobby
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            A public, realtime text space. Read freely. Sign in to participate.
          </p>
        </div>

        {/* Chat container */}
        <div className="h-[calc(100vh-280px)] min-h-[500px]">
          <ChatRoom initialMessages={messages} room="lobby" />
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Every message is stored and understood — not discarded.
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "The Lobby | Chuef",
  description: "A public, realtime text space where every input is remembered.",
};
