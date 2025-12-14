"use client";

import { useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  display_name: string;
  avatar_url: string | null;
  user_id: string;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm mt-1">Be the first to say something</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start gap-3 group">
          <img
            src={message.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.display_name)}&background=random`}
            alt={message.display_name}
            className="w-8 h-8 rounded-full shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-slate-900 dark:text-white text-sm">
                {message.display_name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatTime(message.created_at)}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm mt-0.5 break-words">
              {message.text}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
