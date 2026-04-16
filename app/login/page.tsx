"use client";
import { Camera } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  const handleGitHubSignIn = () => {
    signIn("github", { callbackUrl });
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-volt flex items-center justify-center mx-auto mb-4">
            <Camera size={15} className="text-ink" />
          </div>
          <p className="text-ink-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-ink-700 border-r border-white/5 p-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{ 
            backgroundImage: "linear-gradient(#C8FF00 1px, transparent 1px), linear-gradient(90deg, #C8FF00 1px, transparent 1px)", 
            backgroundSize: "48px 48px" 
          }} 
        />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-volt/5 rounded-full blur-[100px]" />

        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-volt flex items-center justify-center">
            <Camera size={15} className="text-ink" />
          </div>
          <span className="font-display font-bold text-white text-lg">BuildSight</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center z-10">
          <div className="mb-4">
            <span className="text-xs font-mono tracking-widest text-volt uppercase">AI Assembly Guide</span>
          </div>
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Build with<br />confidence.
          </h2>
          <p className="font-body text-ink-300 text-base leading-relaxed max-w-sm">
            Sign in to save your progress, access all 500+ project guides, and resume any build on any device.
          </p>

          <div className="mt-12 space-y-4">
            {["Arduino Starter Kit", "IKEA KALLAX Shelf", "Mechanical Keyboard Build"].map((p) => (
              <div key={p} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 bg-volt" />
                <span className="font-body text-sm text-ink-200">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-volt flex items-center justify-center">
              <Camera size={13} className="text-ink" />
            </div>
            <span className="font-display font-bold text-white">BuildSight</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-1">Sign in</h1>
          <p className="font-body text-sm text-ink-300 mb-8">Continue with your account.</p>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white text-ink font-body font-500 text-sm hover:bg-ink-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <button 
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 bg-ink-600 border border-white/10 text-white font-body text-sm hover:border-white/20 transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-ink-400 font-mono">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="space-y-3">
            <input type="email" placeholder="you@example.com" className="input" />
            <input type="password" placeholder="Password" className="input" />
            <button className="btn-primary w-full justify-center py-3 font-display font-bold">
              Sign in with email
            </button>
          </div>

          <p className="text-center text-xs text-ink-400 mt-6 font-body">
            No account?{" "}
            <Link href="/register" className="text-volt hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
