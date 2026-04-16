import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory rate limiter (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false; // not limited
  }

  record.count++;
  if (record.count > limit) return true; // limited
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const userId = req.auth?.user?.id ?? req.ip ?? "anon";
  const isAuthenticated = !!req.auth;

  // Redirect authenticated users away from login/register pages
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Rate limiting — AI endpoint is strictest
  if (pathname.startsWith("/api/ai")) {
    const limit = parseInt(process.env.RATE_LIMIT_AI_RPM ?? "20");
    if (rateLimit(`ai:${userId}`, limit, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. AI rate limit exceeded." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  } else if (pathname.startsWith("/api")) {
    const limit = parseInt(process.env.RATE_LIMIT_GENERAL_RPM ?? "60");
    if (rateLimit(`api:${userId}`, limit, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // Auth protection — dashboard and protected API routes
  const protectedPaths = ["/dashboard", "/session", "/api/sessions", "/api/users", "/api/ai"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (req.auth?.user?.role !== "admin") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/session/:path*",
    "/admin/:path*", 
    "/api/:path*",
    "/login",
    "/register"
  ],
};
