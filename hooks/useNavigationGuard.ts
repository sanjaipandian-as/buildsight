"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavigationGuardOptions {
  preventBackToLogin?: boolean;
  redirectOnAuth?: string;
  allowedBackPaths?: string[];
}

export function useNavigationGuard(options: NavigationGuardOptions = {}) {
  const {
    preventBackToLogin = true,
    redirectOnAuth = "/dashboard",
    allowedBackPaths = ["/", "/projects", "/dashboard"]
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    // Prevent authenticated users from accessing login/register pages
    if (session && preventBackToLogin) {
      if (pathname === "/login" || pathname === "/register") {
        router.replace(redirectOnAuth);
        return;
      }
    }

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;
      
      // If user is authenticated and trying to go back to login
      if (session && preventBackToLogin && (currentPath === "/login" || currentPath === "/register")) {
        event.preventDefault();
        router.replace(redirectOnAuth);
        return;
      }

      // If current path is not in allowed back paths, redirect to safe path
      if (!allowedBackPaths.some(path => currentPath.startsWith(path))) {
        event.preventDefault();
        router.replace(session ? redirectOnAuth : "/");
        return;
      }
    };

    // Add event listener for browser back/forward buttons
    window.addEventListener("popstate", handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [session, status, pathname, router, preventBackToLogin, redirectOnAuth, allowedBackPaths]);

  // Helper function to navigate safely
  const navigateTo = (path: string, replace = false) => {
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };

  // Helper function to go back safely
  const goBack = (fallbackPath?: string) => {
    const fallback = fallbackPath || (session ? redirectOnAuth : "/");
    
    // Check if there's a valid history entry to go back to
    if (window.history.length > 1) {
      // Try to go back, but have a fallback ready
      const currentPath = window.location.pathname;
      router.back();
      
      // Set a timeout to check if we actually navigated back
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          // We didn't navigate back, use fallback
          router.replace(fallback);
        }
      }, 100);
    } else {
      // No history, use fallback
      router.replace(fallback);
    }
  };

  return {
    navigateTo,
    goBack,
    isAuthenticated: !!session,
    isLoading: status === "loading"
  };
}