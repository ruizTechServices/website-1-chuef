/**
 * CHUEF CONTACT PAGE
 * Uses the same universal ingest endpoint as chat
 * Demonstrates that all input flows through the same system
 */

import { ContactForm } from "@/components/contact";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header spacer for fixed nav */}
      <div className="h-20" />

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Get in Touch
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Have a question or want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact form */}
        <ContactForm />

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Contact | Chuef",
  description: "Get in touch with us. Every message is stored and understood.",
};
