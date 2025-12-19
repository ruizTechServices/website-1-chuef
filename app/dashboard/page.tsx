import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { UsernameEditor } from "@/components/profile/username-editor";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const isAdmin = user.app_metadata?.role === "admin";

  // Fetch user's chat message count
  const { count: messageCount } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch user profile (username, etc.)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("username, username_changed")
    .eq("id", user.id)
    .single();

  // Get display name using the database function
  const { data: displayName } = await supabase.rpc("get_display_name", {
    p_user_id: user.id,
  });

  // Admin-only: Fetch contact submissions
  let contactSubmissions: any[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    contactSubmissions = data || [];
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <main className="mx-auto max-w-6xl px-4 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            {isAdmin && (
              <span 
                className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider"
                style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
              >
                Admin
              </span>
            )}
            <span 
              className="px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider"
              style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
            >
              Dashboard
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight"
            style={{ 
              fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            }}
          >
            Welcome Back, {user.user_metadata?.full_name?.split(" ")[0] || "User"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div 
            className="lg:col-span-1 bg-zinc-900/90 border-2 border-zinc-700 p-6"
            style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 ring-2 ring-blue-500"
                  style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
                />
              ) : (
                <div 
                  className="w-16 h-16 bg-blue-600 flex items-center justify-center text-white text-2xl font-black"
                  style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
                >
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </div>
              )}
              <div>
                <h2 
                  className="text-xl font-black text-white uppercase"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {user.user_metadata?.full_name || "Anonymous"}
                </h2>
                <p className="text-gray-500 text-sm">{isAdmin ? "Administrator" : "Member"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 
                className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-700 pb-2"
                style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              >
                Public Identity
              </h3>
              
              {/* Username Editor Component */}
              <UsernameEditor
                initialUsername={profile?.username || null}
                initialDisplayName={displayName || "anon#????"}
                canChangeUsername={!profile?.username_changed}
              />
            </div>

            <div className="space-y-4 mt-6 pt-4 border-t border-zinc-700">
              <h3 
                className="text-sm font-bold text-green-400 uppercase tracking-wider border-b border-zinc-700 pb-2"
                style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.3)' }}
              >
                Private Info
                <span className="text-xs text-gray-500 normal-case font-normal ml-2">(only you can see this)</span>
              </h3>
              
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">Full Name</dt>
                  <dd className="text-white font-medium mt-1">{user.user_metadata?.full_name || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">Email</dt>
                  <dd className="text-white font-medium mt-1 break-all">{user.email}</dd>
                </div>
                <div>
                  <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">User ID</dt>
                  <dd className="text-gray-400 font-mono text-xs mt-1 break-all">{user.id}</dd>
                </div>
                <div>
                  <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">Provider</dt>
                  <dd className="text-white font-medium mt-1 capitalize">{user.app_metadata?.provider || "email"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-gray-500 uppercase tracking-wider text-xs">Member Since</dt>
                  <dd className="text-white font-medium mt-1">{formatDate(user.created_at)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-700">
              <SignOutButton />
            </div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div 
                className="bg-zinc-900/90 border-2 border-zinc-700 p-4 text-center"
                style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)' }}
              >
                <div 
                  className="text-3xl font-black text-blue-400"
                  style={{ 
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    textShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                  }}
                >
                  {messageCount || 0}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Messages Sent</div>
              </div>
              
              <div 
                className="bg-zinc-900/90 border-2 border-zinc-700 p-4 text-center"
                style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)' }}
              >
                <div 
                  className="text-3xl font-black text-green-400"
                  style={{ 
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    textShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
                  }}
                >
                  Active
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Account Status</div>
              </div>
              
              <div 
                className="bg-zinc-900/90 border-2 border-zinc-700 p-4 text-center"
                style={{ clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)' }}
              >
                <div 
                  className={`text-3xl font-black ${isAdmin ? 'text-red-400' : 'text-purple-400'}`}
                  style={{ 
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    textShadow: `0 0 15px ${isAdmin ? 'rgba(248, 113, 113, 0.5)' : 'rgba(192, 132, 252, 0.5)'}`,
                  }}
                >
                  {isAdmin ? "Admin" : "User"}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Access Level</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div 
              className="bg-zinc-900/90 border-2 border-zinc-700 p-6"
              style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
            >
              <h3 
                className="text-lg font-black text-white uppercase tracking-tight mb-4"
                style={{ 
                  fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/chatroom"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-sm transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                  style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }}
                >
                  Enter Lobby
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 border-2 border-zinc-600 hover:border-white text-white font-bold uppercase tracking-wider text-sm transition-all hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Admin Section: Contact Submissions */}
            {isAdmin && (
              <div 
                className="bg-zinc-900/90 border-2 border-red-900/50 p-6"
                style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="px-2 py-1 bg-red-600 text-white text-xs font-black uppercase"
                    style={{ clipPath: 'polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)' }}
                  >
                    Admin Only
                  </span>
                  <h3 
                    className="text-lg font-black text-white uppercase tracking-tight"
                    style={{ 
                      fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    }}
                  >
                    Recent Contact Submissions
                  </h3>
                </div>
                
                {contactSubmissions.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {contactSubmissions.map((submission) => (
                      <div 
                        key={submission.id}
                        className="bg-zinc-800/50 border border-zinc-700 p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-blue-400 font-bold text-sm">{submission.email}</span>
                          <span className="text-gray-500 text-xs">{formatDate(submission.created_at)}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{submission.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm uppercase tracking-wider">No contact submissions yet.</p>
                )}
              </div>
            )}

            {/* Regular User: Activity Summary */}
            {!isAdmin && (
              <div 
                className="bg-zinc-900/90 border-2 border-zinc-700 p-6"
                style={{ clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)' }}
              >
                <h3 
                  className="text-lg font-black text-white uppercase tracking-tight mb-4"
                  style={{ 
                    fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  Your Activity
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  You&apos;ve sent <span className="text-blue-400 font-bold">{messageCount || 0}</span> messages in the lobby. 
                  Keep the conversation going!
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Account verified</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      ></div>
    </div>
  );
}
