/**
 * CHUEF CONTACT PAGE
 * Uses the same universal ingest endpoint as chat
 * Demonstrates that all input flows through the same system
 */

import { ContactForm } from "@/components/contact";

export default function ContactPage() {
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

      <div className="max-w-xl mx-auto px-4 py-12 relative z-10">
        {/* Page header */}
        <div className="text-center mb-8">
          <span 
            className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider mb-4"
            style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
          >
            Contact
          </span>
          <h1 
            className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight"
            style={{ 
              fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            }}
          >
            Get in Touch
          </h1>
          <p 
            className="text-gray-400 mt-3 uppercase tracking-wide text-sm"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            Have a question or want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact form container with grungy styling */}
        <div 
          className="bg-zinc-900/80 border-2 border-zinc-700 p-6 sm:p-8 backdrop-blur-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
        >
          {/* Contact form */}
          <ContactForm />
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-wider font-bold"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
          >
            ← Back to home
          </a>
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
  title: "Contact | Chuef",
  description: "Get in touch with us. Every message is stored and understood.",
};
