"use client";

import { useState, useRef, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

interface ChatInputProps {
  user: User | null;
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ user, onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user && inputRef.current) {
      inputRef.current.focus();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending || !user) return;

    setIsSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to join the conversation
          </span>
          <a
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <img
          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
          alt="You"
          className="w-8 h-8 rounded-full shrink-0"
        />
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isSending}
            rows={1}
            className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || disabled || isSending}
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isSending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
}
