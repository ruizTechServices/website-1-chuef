import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900">
            Welcome, {user.user_metadata?.full_name || user.email}!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You are successfully signed in with Google.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-700">User Info</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">Email:</dt>
                <dd className="text-gray-900">{user.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-gray-500">User ID:</dt>
                <dd className="text-gray-900 font-mono text-xs">{user.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
