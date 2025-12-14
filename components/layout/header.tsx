"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
          <div className={`group/nav fixed top-4 left-1/2 -translate-x-1/2 ${isMenuOpen ? '[&>div>div]:w-auto [&>div>div]:max-w-2xl [&>div>div]:px-6 [&>div>div]:py-4 [&>div>div]:rounded-2xl [&>div>div_span]:opacity-100 [&>div>div_.divider]:opacity-100 [&>div>div_.auth-section]:opacity-100' : ''}`}>
            {/* Collapsed state: just the logo circle */}
            <div className="relative">
              {/* Expanded navbar - hidden by default, shown on hover */}
              <div className={`flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-black/20 rounded-full px-2 py-2 transition-all duration-500 ease-out w-14 h-14 group-hover/nav:w-auto group-hover/nav:max-w-2xl group-hover/nav:px-6 group-hover/nav:py-4 group-hover/nav:rounded-2xl ${isMenuOpen ? '' : 'overflow-hidden'}`}>
                {/* Logo - always visible */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow">
                    C
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">
                    Chuef
                  </span>
                </Link>

                {/* Divider */}
                <div className="divider w-px h-8 bg-slate-200 dark:bg-slate-700 mx-4 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-150 shrink-0" />

                {/* Right side - Auth */}
                <div className="auth-section flex items-center gap-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 delay-200">
                  {isLoading ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  ) : user ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <img
                          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[150px] truncate whitespace-nowrap">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50">
                          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {user.user_metadata?.full_name || "User"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/login"
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-200 whitespace-nowrap"
                      >
                        Get Started
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
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-black/20 px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/25">
                  C
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Chuef
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile dropdown menu */}
            {isMobileMenuOpen && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {isLoading ? (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                ) : user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <img
                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full p-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full p-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                      Get Started
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
