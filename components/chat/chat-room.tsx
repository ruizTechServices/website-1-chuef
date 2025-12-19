"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChatMessageList, ChatMessage } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import type { User } from "@supabase/supabase-js";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

interface ChatRoomProps {
  initialMessages: ChatMessage[];
  room?: string;
}

interface RealtimeChatMessage {
  id: string;
  input_id: string;
  user_id: string;
  room: string;
  text: string;
  created_at: string;
}

export function ChatRoom({ initialMessages, room = "lobby" }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [user, setUser] = useState<User | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const supabase = createClient();

  // Get current user and their display name
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch display name for the current user
      if (user) {
        const { data: displayName } = await supabase.rpc("get_display_name", {
          p_user_id: user.id,
        });
        setUserDisplayName(displayName || "anon#????");
      }
      
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        // Fetch display name on auth state change
        if (session?.user) {
          const { data: displayName } = await supabase.rpc("get_display_name", {
            p_user_id: session.user.id,
          });
          setUserDisplayName(displayName || "anon#????");
        } else {
          setUserDisplayName(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Clear cooldown after timeout
  useEffect(() => {
    if (!cooldownUntil) return;
    
    const remaining = cooldownUntil - Date.now();
    if (remaining <= 0) {
      setCooldownUntil(null);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      setCooldownUntil(null);
      setError(null);
    }, remaining);

    return () => clearTimeout(timer);
  }, [cooldownUntil]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${room}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room=eq.${room}`,
        },
        async (payload: RealtimePostgresInsertPayload<RealtimeChatMessage>) => {
          const newMessage = payload.new;
          
          // Don't add if we already have this message (e.g., from optimistic update)
          if (messages.some(m => m.id === newMessage.id)) {
            return;
          }

          // Fetch user info for the new message
          const { data: userData } = await supabase
            .from("chat_messages_with_user")
            .select("display_name, avatar_url")
            .eq("id", newMessage.id)
            .single();

          const messageWithUser: ChatMessage = {
            id: newMessage.id,
            text: newMessage.text,
            created_at: newMessage.created_at,
            user_id: newMessage.user_id,
            display_name: userData?.display_name || "Anonymous",
            avatar_url: userData?.avatar_url || null,
          };

          setMessages((prev) => [...prev, messageWithUser]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, room, messages]);

  // Send message handler
  const handleSendMessage = useCallback(async (text: string) => {
    if (!user) return;

    setError(null);

    // Optimistic update - use the fetched display name (username or anon#)
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text,
      created_at: new Date().toISOString(),
      user_id: user.id,
      display_name: userDisplayName || "anon#????",
      avatar_url: user.user_metadata?.avatar_url || null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "chat_message",
          text,
          room,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        
        // Check if it's a cooldown error
        if (response.status === 429 || result.code === "COOLDOWN") {
          setCooldownUntil(Date.now() + 30000); // 30 seconds from now
          setError("Cooldown: please wait 30 seconds between messages.");
        } else {
          setError(result.error || "Failed to send message");
        }
      } else {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id
              ? { ...m, id: result.domainId }
              : m
          )
        );
      }
    } catch (err) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setError("Failed to send message. Please try again.");
    }
  }, [user, userDisplayName, room]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Lobby
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{messages.length} messages</span>
            <span>•</span>
            <span>Public</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Messages */}
      <ChatMessageList messages={messages} />

      {/* Input */}
      <ChatInput
        user={user}
        onSend={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}
