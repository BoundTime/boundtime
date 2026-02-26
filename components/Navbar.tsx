"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, Search, MessageSquare, User as UserIcon, LockKeyhole, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChastityNavBadge } from "@/components/chastity/ChastityNavBadge";
import { LockDurationBadge } from "@/components/LockDurationBadge";
import { NotificationBell } from "@/components/NotificationBell";
import { RefreshNavLink } from "@/components/RefreshNavLink";
import { RoleIcon } from "@/components/RoleIcon";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [nick, setNick] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMenu]);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("nick, avatar_url, avatar_photo_id, role, verified")
        .eq("id", userId)
        .single();

      setNick(data?.nick ?? null);
      setRole(data?.role ?? null);
      setVerified(data?.verified ?? false);
      const url = data
        ? await resolveProfileAvatarUrl(
            { avatar_url: data.avatar_url, avatar_photo_id: data.avatar_photo_id },
            supabase
          )
        : null;
      setAvatarUrl(url);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setNick(null);
        setAvatarUrl(null);
        setRole(null);
        setVerified(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setNick(null);
        setAvatarUrl(null);
        setRole(null);
        setVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-[60] border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-24 py-4 pl-4 pr-4 sm:pl-6 sm:pr-6">
        {user ? (
          <RefreshNavLink
            href="/dashboard"
            className="text-xl font-semibold tracking-tight text-white transition-colors duration-150 hover:text-accent"
          >
            BoundTime
          </RefreshNavLink>
        ) : (
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white transition-colors duration-150 hover:text-accent"
          >
            BoundTime
          </Link>
        )}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Desktop Nav – versteckt unter md */}
              <div className="hidden md:flex md:items-center md:gap-6">
                <RefreshNavLink
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
                >
                  <Home className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Start
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/entdecken"
                  className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                >
                  <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Entdecken
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/nachrichten"
                  className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Nachrichten
                </RefreshNavLink>
                <NotificationBell />
                <ChastityNavBadge
                  onClick={(e) => {
                    e.preventDefault();
                    if (pathname === "/dashboard/keuschhaltung") {
                      router.refresh();
                    } else {
                      router.push("/dashboard/keuschhaltung");
                      setTimeout(() => router.refresh(), 50);
                    }
                  }}
                />
                {verified && (role === "Dom" || role === "Switcher") && (
                  <RefreshNavLink
                    href="/dashboard/dom-bereich"
                    className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                  >
                    Dom(me)-Bereich
                  </RefreshNavLink>
                )}
                <RefreshNavLink
                  href="/dashboard/profil"
                  className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                >
                  <UserIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Profil
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/einstellungen"
                  className="flex items-center gap-2 text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                >
                  <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Einstellungen
                </RefreshNavLink>
              </div>
              <div className="hidden md:flex md:items-center md:gap-4 md:border-l md:border-gray-700 md:pl-6">
                <LockDurationBadge />
                {nick && (
                  <RefreshNavLink
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
                    title="Start"
                  >
                    <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-600 bg-background">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                          {nick.slice(0, 1).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5">
                      Hallo, {nick}
                      <RoleIcon role={role} size={14} />
                    </span>
                  </RefreshNavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
                >
                  Abmelden
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="hidden md:flex md:items-center md:gap-6">
              <Link
                href="/#community"
                className="text-sm text-gray-300 transition-colors duration-150 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
              >
                Community
              </Link>
              <Link
                href="/#sicherheit"
                className="text-sm text-gray-300 transition-colors duration-150 hover:text-white"
              >
                Sicherheit
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
              >
                Login
              </Link>
              </div>
            </>
          )}

          {/* Hamburger – nur unter md */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded p-2 text-gray-300 transition-colors duration-150 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-In Menü – per Portal, damit es über allem liegt */}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
          >
            <button
              type="button"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              aria-label="Menü schließen"
            />
            <div
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-gray-800 bg-card shadow-xl"
              style={{ backgroundColor: "var(--card)" }}
            >
            <div className="flex items-center justify-between border-b border-gray-700 p-4">
              <span className="font-semibold text-white">Menü</span>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded p-2 text-gray-400 hover:text-white"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
              {user ? (
                <>
                  <RefreshNavLink href="/dashboard" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                    <Home className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Start
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/entdecken" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                    <Search className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Entdecken
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/nachrichten" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                    <MessageSquare className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Nachrichten
                  </RefreshNavLink>
                  <NotificationBell variant="mobile" onNavigate={closeMenu} />
                  <ChastityNavBadge
                    onClick={(e) => {
                      e.preventDefault();
                      closeMenu();
                      if (pathname === "/dashboard/keuschhaltung") {
                        router.refresh();
                      } else {
                        router.push("/dashboard/keuschhaltung");
                        setTimeout(() => router.refresh(), 50);
                      }
                    }}
                    className="rounded-lg px-4 py-3 text-base text-gray-300 hover:bg-gray-800 hover:text-white"
                  />
                  {verified && (role === "Dom" || role === "Switcher") && (
                    <RefreshNavLink href="/dashboard/dom-bereich" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                      Dom(me)-Bereich
                    </RefreshNavLink>
                  )}
                  <RefreshNavLink href="/dashboard/profil" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                    <UserIcon className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Profil
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/einstellungen" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">
                    <Settings className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Einstellungen
                  </RefreshNavLink>
                  <div className="py-2" onClick={closeMenu}>
                    <LockDurationBadge onClick={closeMenu} />
                  </div>
                  {nick && (
                    <RefreshNavLink href="/dashboard" onClick={closeMenu} className="mt-4 flex items-center gap-3 rounded-lg border border-gray-700 p-3 hover:bg-gray-800">
                      <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-600 bg-background">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                            {nick.slice(0, 1).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-gray-300">
                        Hallo, {nick}
                        <RoleIcon role={role} size={14} />
                      </span>
                    </RefreshNavLink>
                  )}
                  <div className="mt-auto border-t border-gray-700 pt-4">
                    <button
                      type="button"
                      onClick={() => { closeMenu(); handleLogout(); }}
                      className="w-full rounded-lg border border-red-500/50 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
                    >
                      Abmelden
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/#community" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Community</Link>
                  <Link href="/#sicherheit" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Sicherheit</Link>
                  <Link href="/login" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Login</Link>
                </>
              )}
            </div>
          </div>
        </div>,
          document.body
        )}
    </header>
  );
}
