"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Fetch display name if user is logged in
        if (user) {
          const { data: displayNameResult, error: rpcError } = await supabase.rpc("get_display_name", {
            p_user_id: user.id,
          });
          
          if (rpcError) {
            console.error("RPC error fetching display name:", rpcError);
            setDisplayName("anon#????");
          } else {
            setDisplayName(displayNameResult || "anon#????");
          }
        }
      } catch (err) {
        console.error("Failed to get user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsLoading(true);
        setUser(session?.user ?? null);
        
        // Fetch display name on auth state change
        if (session?.user) {
          const { data: displayNameResult, error: rpcError } = await supabase.rpc("get_display_name", {
            p_user_id: session.user.id,
          });
          
          if (rpcError) {
            console.error("RPC error fetching display name:", rpcError);
            setDisplayName("anon#????");
          } else {
            setDisplayName(displayNameResult || "anon#????");
          }
        } else {
          setDisplayName(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        {/* Desktop: Collapsible navbar - expands on hover */}
        <nav className="hidden lg:block">
          <div className={`group/nav fixed top-4 left-1/2 -translate-x-1/2 ${isMenuOpen ? '[&>div>div]:w-auto [&>div>div]:max-w-2xl [&>div>div]:px-6 [&>div>div]:py-4 [&>div>div_span]:opacity-100 [&>div>div_.divider]:opacity-100 [&>div>div_.auth-section]:opacity-100' : ''}`}>
            {/* Collapsed state: just the logo circle */}
            <div className="relative">
              {/* Expanded navbar - hidden by default, shown on hover */}
              <div 
                className={`flex items-center bg-zinc-900/95 backdrop-blur-md border-2 border-zinc-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] px-2 py-2 transition-all duration-500 ease-out w-14 h-14 group-hover/nav:w-auto group-hover/nav:max-w-2xl group-hover/nav:px-6 group-hover/nav:py-4 ${isMenuOpen ? '' : 'overflow-hidden'}`}
                style={isMenuOpen ? {} : { clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
              >
                {/* Logo - always visible */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                  <div 
                    className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_2px_10px_rgba(37,99,235,0.5)] hover:shadow-[0_2px_15px_rgba(37,99,235,0.7)] transition-shadow border border-blue-500/50"
                    style={{ 
                      clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)',
                      fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    }}
                  >
                    C
                  </div>
                  <span 
                    className="text-xl font-black text-white uppercase tracking-tight opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap"
                    style={{ 
                      fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                      textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                    }}
                  >
                    CHUEF
                  </span>
                </Link>

                {/* Divider */}
                <div className="divider w-0.5 h-8 bg-zinc-600 mx-4 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-150 shrink-0" />

                {/* Nav Links */}
                <div className="nav-links flex items-center gap-1 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-150 mr-4">
                  <Link
                    href="/chatroom"
                    className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap uppercase tracking-wider"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Lobby
                  </Link>
                  <Link
                    href="/contact"
                    className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap uppercase tracking-wider"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Contact
                  </Link>
                </div>

                {/* Divider */}
                <div className="divider w-0.5 h-8 bg-zinc-600 mr-4 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-150 shrink-0" />

                {/* Right side - Auth */}
                <div className="auth-section flex items-center gap-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-200">
                  {isLoading ? (
                    <div className="w-8 h-8 bg-zinc-700 animate-pulse" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }} />
                  ) : user ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors"
                      >
                        <img
                          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                          alt="Avatar"
                          className="w-8 h-8 ring-2 ring-zinc-600"
                          style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
                        />
                        <span 
                          className="text-sm font-bold text-gray-300 max-w-[150px] truncate whitespace-nowrap uppercase tracking-wide"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {displayName || "anon#????"}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {isMenuOpen && (
                        <div 
                          className="absolute right-0 mt-2 w-56 py-2 bg-zinc-900/98 backdrop-blur-md border-2 border-zinc-700 shadow-[0_4px_20px_rgba(0,0,0,0.6)] z-50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
                        >
                          <div className="px-4 py-2 border-b-2 border-zinc-700">
                            <p 
                              className="text-sm font-bold text-white truncate uppercase"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {displayName || "anon#????"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Logged in
                            </p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wide"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors uppercase tracking-wide"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap uppercase tracking-wider"
                        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/login"
                        className="px-5 py-2.5 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-200 whitespace-nowrap uppercase tracking-wider border border-blue-500/50"
                        style={{ 
                          clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        Join Now
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile: Full navbar with hamburger menu */}
        <nav className="lg:hidden">
          <div 
            className="bg-zinc-900/95 backdrop-blur-md border-2 border-zinc-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] px-4 py-3"
            style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_2px_10px_rgba(37,99,235,0.5)] border border-blue-500/50"
                  style={{ 
                    clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)',
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                  }}
                >
                  C
                </div>
                <span 
                  className="text-xl font-black text-white uppercase tracking-tight"
                  style={{ 
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                  }}
                >
                  CHUEF
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile dropdown menu */}
            {isMobileMenuOpen && (
              <div className="mt-4 pt-4 border-t-2 border-zinc-700">
                {/* Nav Links */}
                <div className="space-y-1 mb-4 pb-4 border-b-2 border-zinc-700">
                  <Link
                    href="/chatroom"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase font-bold tracking-wider"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Lobby
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase font-bold tracking-wider"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-zinc-700 animate-pulse" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }} />
                    <div className="h-4 w-24 bg-zinc-700 animate-pulse" />
                  </div>
                ) : user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700">
                      <img
                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                        alt="Avatar"
                        className="w-10 h-10 ring-2 ring-zinc-600"
                        style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-bold text-white truncate uppercase"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {displayName || "anon#????"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Logged in
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase font-bold tracking-wider"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors uppercase font-bold tracking-wider"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full p-3 text-center text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full p-3 text-center text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all uppercase tracking-wider border border-blue-500/50"
                      style={{ 
                        clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
