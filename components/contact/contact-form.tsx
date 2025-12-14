"use client";

import { useState } from "react";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact_submission",
          text: message.trim(),
          email: email.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Failed to submit. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Message Received
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Thank you for reaching out. Your message has been stored and understood.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
      <div className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            required
            disabled={isSubmitting}
            rows={5}
            className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!email.trim() || !message.trim() || isSubmitting}
          className="w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
        Your message will be stored and understood — not discarded.
      </p>
    </form>
  );
}
