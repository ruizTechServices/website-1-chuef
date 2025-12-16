'use client';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Dark grungy background */}
      <div className="absolute inset-0 bg-zinc-950"></div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Subtle blue glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Grungy card container */}
          <div 
            className="relative p-8 sm:p-12 lg:p-16 bg-zinc-900/90 backdrop-blur-md border-2 border-zinc-700 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
          >
            {/* Scratched edge accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            <div className="relative text-center">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-600 mb-8"
                style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}
              >
                <span 
                  className="text-sm font-bold text-blue-400 uppercase tracking-wider"
                  style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
                >
                  Read Without Signing In
                </span>
              </div>

              {/* Headline */}
              <h2 
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white uppercase mb-6 leading-tight tracking-tight"
                style={{ 
                  fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                }}
              >
                Ready to Join the
                <span 
                  className="block mt-2 text-blue-400"
                  style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.5), 3px 3px 6px rgba(0,0,0,0.8)' }}
                >
                  Revolution?
                </span>
              </h2>

              {/* Subtext */}
              <p 
                className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed uppercase tracking-wide"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
              >
                Jump into live discussions. Read the lobby freely. Sign in only to post — your Google account stays private.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chatroom"
                  className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                  style={{ 
                    clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    Enter The Lobby
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                <Link 
                  href="/login"
                  className="group px-10 py-5 border-2 border-zinc-600 hover:border-white text-white font-bold text-lg uppercase tracking-wider hover:bg-white/10 transition-all duration-300"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Create Identity
                  </span>
                </Link>
              </div>
              <p 
                className="text-sm text-gray-400 mt-4 font-medium"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                Create a Chuef identity after signing in with Google.
              </p>

              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t-2 border-zinc-700">
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-500 uppercase tracking-wider font-bold">
                  <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Read the lobby anonymously</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Always Live</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Always Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      ></div>
    </section>
  );
}