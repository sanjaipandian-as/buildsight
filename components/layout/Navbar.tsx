"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, Menu, X, Zap, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const publicLinks = [
    { href: "/projects", label: "Projects" },
    { href: "/docs", label: "Docs" },
  ];

  const authenticatedLinks = [
    { href: "/projects", label: "Projects" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/history", label: "History" },
  ];

  const links = session ? authenticatedLinks : publicLinks;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setOpen(false);
    };

    if (userMenuOpen || open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen, open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-volt flex items-center justify-center">
            <Camera size={14} className="text-ink" />
          </div>
          <span className="font-display font-bold text-white tracking-tight">BuildSight</span>
          <span className="tag ml-1">BETA</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-1.5 text-sm font-body transition-colors ${
                path === l.href || (l.href !== "/" && path.startsWith(l.href)) 
                  ? "text-volt" 
                  : "text-ink-300 hover:text-white"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth section */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-white transition-colors"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-volt/20 rounded-full flex items-center justify-center">
                    <User size={14} className="text-volt" />
                  </div>
                )}
                <span className="max-w-24 truncate">{session.user?.name || session.user?.email}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-ink-700 border border-white/10 rounded-lg shadow-xl py-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-200 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={14} />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-200 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <hr className="my-2 border-white/10" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-xs py-2 px-4">Sign In</Link>
              <Link href="/login" className="btn-primary text-xs py-2 px-4">
                <Zap size={13} />
                Start Building
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }} 
          className="md:hidden text-ink-300"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-ink-700 border-t border-white/5 px-6 py-4">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`text-sm py-2 border-b border-white/5 transition-colors ${
                  path === l.href || (l.href !== "/" && path.startsWith(l.href))
                    ? "text-volt"
                    : "text-ink-200 hover:text-volt"
                }`}>
                {l.label}
              </Link>
            ))}
            
            {session ? (
              <>
                <div className="flex items-center gap-2 py-2 border-b border-white/5">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-volt/20 rounded-full flex items-center justify-center">
                      <User size={14} className="text-volt" />
                    </div>
                  )}
                  <span className="text-sm text-ink-200">{session.user?.name || session.user?.email}</span>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="text-sm text-ink-200 hover:text-volt py-2 border-b border-white/5"
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-red-400 hover:text-red-300 py-2 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary mt-2 justify-center" onClick={() => setOpen(false)}>
                Start Building
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
