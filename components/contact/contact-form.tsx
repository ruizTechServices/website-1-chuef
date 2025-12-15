"use client";

import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    if (typeof window === "undefined" || !RECAPTCHA_SITE_KEY) return;
    
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setRecaptchaLoaded(true);
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getCaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!recaptchaLoaded || !RECAPTCHA_SITE_KEY) {
      console.warn("reCAPTCHA not loaded");
      return null;
    }
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" });
    } catch (err) {
      console.error("reCAPTCHA error:", err);
      return null;
    }
  }, [recaptchaLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      // Get reCAPTCHA token
      const captchaToken = await getCaptchaToken();
      if (!captchaToken) {
        setStatus("error");
        setErrorMessage("Captcha verification failed. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact_submission",
          text: message.trim(),
          email: email.trim(),
          captchaToken,
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
      <div className="text-center py-4">
        <div 
          className="w-16 h-16 mx-auto mb-4 bg-green-600 flex items-center justify-center"
          style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 
          className="text-2xl font-black text-white uppercase tracking-tight mb-2"
          style={{ 
            fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          Message Received
        </h3>
        <p 
          className="text-gray-400 mb-6 uppercase tracking-wide text-sm"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          Thank you for reaching out. Your message has been stored and understood.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-3 text-sm font-bold text-white uppercase tracking-wider bg-zinc-700 border-2 border-zinc-600 hover:border-white hover:bg-zinc-600 transition-all"
          style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Email field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
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
            className="w-full px-4 py-3 text-sm text-white bg-zinc-800 border-2 border-zinc-600 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-gray-500"
            style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
          />
        </div>

        {/* Message field */}
        <div>
          <label 
            htmlFor="message" 
            className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
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
            className="w-full px-4 py-3 text-sm text-white bg-zinc-800 border-2 border-zinc-600 resize-none focus:outline-none focus:border-blue-500 focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-gray-500"
            style={{ clipPath: 'polygon(0 0, 100% 0, 99.5% 100%, 0.5% 100%)' }}
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <div 
            className="p-3 bg-red-900/30 border-2 border-red-700"
            style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
          >
            <p className="text-sm text-red-400 font-bold uppercase tracking-wide">{errorMessage}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!email.trim() || !message.trim() || isSubmitting}
          className="w-full px-6 py-4 text-sm font-black text-white uppercase tracking-wider bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none border border-blue-500/50"
          style={{ 
            clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
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

      <p 
        className="text-xs text-gray-500 mt-4 text-center uppercase tracking-wider"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        Your message will be stored and understood — not discarded.
      </p>
    </form>
  );
}
