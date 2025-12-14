import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";


//Create a check. If the user is already signed in, redirect to the dashboard

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Chuef
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <GoogleSignInButton />
        </div>

        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
