"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, Search, MessageSquare, Settings, MessageSquarePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChastityNavBadge } from "@/components/chastity/ChastityNavBadge";
import { LockDurationBadge } from "@/components/LockDurationBadge";
import { NotificationBell } from "@/components/NotificationBell";
import { RefreshNavLink } from "@/components/RefreshNavLink";
import { RoleIcon } from "@/components/RoleIcon";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { useUnreadMessageCount } from "@/lib/useUnreadMessageCount";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";
import { NavbarDesktopMainNav } from "@/components/NavbarDesktopMainNav";
import type { User } from "@supabase/supabase-js";

type InitialNavData = {
  userId: string;
  nick: string | null;
  avatarUrl: string | null;
  role: string | null;
  verified: boolean;
  accountType?: string | null;
  restrictionEnabled?: boolean;
};

type NavbarProps = {
  initialNavData?: InitialNavData | null;
  restrictionDotSlot?: React.ReactNode;
  restrictionDotMobileSlot?: React.ReactNode;
};

export function Navbar({ initialNavData = null, restrictionDotSlot = null, restrictionDotMobileSlot = null }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(
    initialNavData ? ({ id: initialNavData.userId } as User) : null
  );
  const [nick, setNick] = useState<string | null>(initialNavData?.nick ?? null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialNavData?.avatarUrl ?? null);
  const [role, setRole] = useState<string | null>(initialNavData?.role ?? null);
  const [verified, setVerified] = useState(initialNavData?.verified ?? false);
  const [accountType, setAccountType] = useState<string | null>(initialNavData?.accountType ?? null);
  const [restrictionFromEvent, setRestrictionFromEvent] = useState<boolean | null>(null);
  const [restrictionFromApi, setRestrictionFromApi] = useState<boolean | null>(null);
  const [unlockedForDot, setUnlockedForDot] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deckReady, setDeckReady] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const unreadMessages = useUnreadMessageCount(user?.id ?? initialNavData?.userId);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const effectiveRestriction = restrictionFromEvent ?? restrictionFromApi;
  const dotGreen = effectiveRestriction === false || unlockedForDot;

  const nav = {
    isDashboard: pathname === "/dashboard",
    isEntdecken: pathname?.startsWith("/dashboard/entdecken") ?? false,
    isNachrichten: pathname?.startsWith("/dashboard/nachrichten") ?? false,
    isKeuschhaltung: pathname?.startsWith("/dashboard/keuschhaltung") ?? false,
    isDomBereich: pathname?.startsWith("/dashboard/dom-bereich") ?? false,
    isProfil: pathname?.startsWith("/dashboard/profil") ?? false,
    isEinstellungen: pathname?.startsWith("/dashboard/einstellungen") ?? false,
    isForum:
      (pathname?.startsWith("/dashboard/forum") ?? false) ||
      (pathname?.startsWith("/dashboard/dom-bereich") ?? false),
  };

  /** Dark Luxury – einheitlich Desktop-Zeile */
  const navFocus =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]";
  const navItemBase = `inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all duration-150 ${navFocus}`;
  const navItemActive =
    "border border-amber-500/35 bg-gradient-to-b from-amber-950/50 to-amber-950/30 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
  const navItemInactive =
    "border border-transparent text-gray-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white";

  /** Utility-Ghost: eine Familie (Nachrichten / Glocke / Keusch) */
  const utilGhost =
    "border-white/[0.14] bg-white/[0.02] text-gray-200 transition-[transform,border-color,background-color,color] duration-150 ease-out hover:-translate-y-px hover:border-amber-500/25 hover:bg-white/[0.06] motion-reduce:hover:translate-y-0";

  /** Mobile Sheet – gleiche Familie, vertikal */
  const mItem = "flex items-center gap-2 rounded-xl border px-4 py-3 text-base font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]";
  const mActive = "border-amber-500/35 bg-gradient-to-b from-amber-950/45 to-amber-950/25 text-amber-50";
  const mInactive = "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/15 hover:bg-white/[0.07] hover:text-white";

  /** Untere Zeile: nur übergreifende Bereiche – Nachrichten/Keusch nur oben, Profil nur über die Kachel (→ /dashboard/profil). */
  const mainNavItems = useMemo(() => {
    const list: { id: string; href: string; label: string; isActive: boolean }[] = [
      { id: "my", href: "/dashboard", label: "MyBound", isActive: nav.isDashboard },
      { id: "ent", href: "/dashboard/entdecken", label: "Entdecken", isActive: nav.isEntdecken },
      { id: "forum", href: "/dashboard/forum", label: "Forum", isActive: nav.isForum },
    ];
    list.push({ id: "ein", href: "/dashboard/einstellungen", label: "Einstellungen", isActive: nav.isEinstellungen });
    return list;
  }, [nav.isDashboard, nav.isEinstellungen, nav.isEntdecken, nav.isForum]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMenu]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Command Deck: dezentes Reveal nur Desktop, kein Motion bei reduced-motion */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeckReady(true);
      return;
    }
    const id = requestAnimationFrame(() => setDeckReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ restrictionEnabled?: boolean }>).detail;
      if (typeof d?.restrictionEnabled === "boolean") {
        setRestrictionFromEvent(d.restrictionEnabled);
        if (!d.restrictionEnabled) setUnlockedForDot(false);
      }
    };
    window.addEventListener("bt-restriction-changed", handler);
    return () => window.removeEventListener("bt-restriction-changed", handler);
  }, []);

  useEffect(() => {
    const onUnlocked = () => setUnlockedForDot(true);
    const onLocked = () => setUnlockedForDot(false);
    window.addEventListener("bt-restriction-unlocked", onUnlocked);
    window.addEventListener("bt-restriction-locked", onLocked);
    return () => {
      window.removeEventListener("bt-restriction-unlocked", onUnlocked);
      window.removeEventListener("bt-restriction-locked", onLocked);
    };
  }, []);

  // Nach Unlock-Status aus sessionStorage setzen (z. B. nach Refresh)
  useEffect(() => {
    if (effectiveRestriction !== true || !initialNavData?.userId) return;
    if (typeof sessionStorage === "undefined") return;
    const stored = sessionStorage.getItem("bt_restriction_unlocked");
    if (stored === initialNavData.userId) setUnlockedForDot(true);
  }, [effectiveRestriction, initialNavData?.userId]);

  // Nach Refresh: Layout sieht oft keine Middleware-Header (Next.js-Bug). Einmal API aufrufen –
  // die API bekommt die Cookies aus der Antwort, liefert den richtigen Restriction-Status.
  useEffect(() => {
    if (!initialNavData?.userId) return;
    fetch("/api/me/restriction", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { restrictionEnabled?: boolean; accountType?: string | null }) => {
        if (typeof data.restrictionEnabled === "boolean") setRestrictionFromApi(data.restrictionEnabled);
        if (data.accountType != null) setAccountType(data.accountType);
      })
      .catch(() => {});
  }, [initialNavData?.userId]);

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
        if (initialNavData) {
          setAccountType(initialNavData.accountType ?? null);
        }
      } else {
        setNick(null);
        setAvatarUrl(null);
        setRole(null);
        setVerified(false);
        setAccountType(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        if (initialNavData) {
          setAccountType(initialNavData.accountType ?? null);
        }
      } else {
        setNick(null);
        setAvatarUrl(null);
        setRole(null);
        setVerified(false);
        setAccountType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialNavData]);

  useEffect(() => {
    const uid = user?.id ?? initialNavData?.userId;
    if (!uid) {
      setUnreadNotifications(0);
      return;
    }
    const supabase = createClient();
    async function loadUnread() {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .is("read_at", null);
      setUnreadNotifications(count ?? 0);
    }
    loadUnread();
    const channel = supabase
      .channel("navbar-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => loadUnread())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, initialNavData?.userId]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-[60] isolate antialiased">
      <nav
        className={`mx-auto mt-2 flex w-full max-w-6xl gap-3 overflow-hidden rounded-[1.35rem] border border-white/[0.09] px-3 shadow-[0_28px_56px_-32px_rgba(0,0,0,0.88),0_0_0_1px_rgba(255,255,255,0.028)_inset,0_1px_0_rgba(255,255,255,0.055)_inset] ring-1 ring-white/[0.045] transition-[padding,box-shadow,backdrop-filter,background-color,border-color] duration-300 ease-out sm:px-4 ${
          user ? "items-center lg:flex-col lg:items-stretch" : "items-center"
        } ${
          scrolled
            ? "border-white/[0.11] bg-[#0c0c0c]/93 py-2 shadow-[0_22px_44px_-26px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl"
            : "border-white/[0.08] bg-[#121212]/86 py-3 backdrop-blur-md"
        }`}
      >
        {user ? (
          <>
            {/* Desktop: Command Deck – oben Instrumente (matter), unten Hauptnavigation */}
            <div
              className={`hidden w-full min-w-0 flex-col gap-0 lg:flex lg:transition-all lg:duration-[380ms] lg:ease-out motion-reduce:lg:transition-none ${
                deckReady ? "lg:translate-y-0 lg:opacity-100" : "lg:translate-y-2 lg:opacity-0"
              } motion-reduce:lg:translate-y-0 motion-reduce:lg:opacity-100`}
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-t-[1.15rem] bg-[#070707]/95 px-1 pb-2.5 pt-1.5 sm:px-2">
                <RefreshNavLink
                  href="/dashboard"
                  className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-1 py-1 text-white transition-colors duration-150 hover:text-amber-100/95 ${navFocus}`}
                >
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-600/30 bg-gradient-to-br from-amber-950/90 via-[#1c1612] to-black text-[11px] font-bold tracking-tight text-amber-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.45)]"
                    aria-hidden
                  >
                    BT
                  </span>
                  <span className="text-[15px] font-semibold tracking-[-0.03em]">BoundTime</span>
                </RefreshNavLink>
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:flex-nowrap">
                  <RefreshNavLink
                    href="/dashboard/nachrichten"
                    className={`relative inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${utilGhost} ${navFocus}`}
                  >
                    <MessageSquare className="h-[17px] w-[17px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    <span className="hidden sm:inline">Nachrichten</span>
                    {unreadMessages > 0 && (
                      <span
                        className="bt-nav-badge-enter absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-semibold text-white shadow-sm"
                      >
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </RefreshNavLink>
                  <div className="flex h-9 shrink-0 items-center">
                    <NotificationBell />
                  </div>
                  <div
                    className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-white/[0.14] bg-black/45 px-1.5 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    title="Keuschhaltung & Lock-Status"
                  >
                    <ChastityNavBadge
                      className={`relative flex h-8 items-center gap-2 rounded-md px-2.5 text-sm font-medium ${nav.isKeuschhaltung ? navItemActive : `${navItemInactive} !border-transparent`} ${navFocus}`}
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
                    <span className="flex shrink-0 items-center [&_a]:my-0 [&_a]:flex [&_a]:h-8 [&_a]:items-center [&_a]:rounded-md [&_a]:border-amber-600/25 [&_a]:px-2 [&_a]:py-0 [&_a]:text-[11px] [&_a]:leading-none">
                      <LockDurationBadge />
                    </span>
                  </div>
                  {accountType === "couple" &&
                    (effectiveRestriction !== null ? (
                      <span
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.02] px-2.5"
                        title={
                          dotGreen
                            ? effectiveRestriction
                              ? "Freigeschaltet – Schreiben erlaubt"
                              : "Cuckymode aus"
                            : "Cuckymode aktiv – Passwort nötig zum Schreiben"
                        }
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: dotGreen ? "#22c55e" : "#ef4444",
                            boxShadow: dotGreen
                              ? "0 0 12px 2px rgba(34, 197, 94, 0.42)"
                              : "0 0 12px 2px rgba(239, 68, 68, 0.38)",
                          }}
                          aria-hidden
                        />
                        <span className="hidden text-[10px] font-medium text-gray-500 xl:inline">
                          {dotGreen ? (effectiveRestriction ? "Frei" : "Aus") : "Cucky"}
                        </span>
                      </span>
                    ) : (
                      restrictionDotSlot
                    ))}
                  {nick && (
                    <RefreshNavLink
                      href="/dashboard/profil"
                      className={`group relative flex min-w-0 max-w-[248px] items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.1] border-l-2 border-l-amber-500/45 bg-[#101010]/95 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(120%_80%_at_0%_0%,rgba(251,191,36,0.12),transparent_55%)] before:opacity-90 after:pointer-events-none after:absolute after:inset-0 after:bg-[url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.45'/%3E%3C/svg%3E")] after:opacity-[0.04] ${navFocus} ${
                        nav.isProfil
                          ? "border-l-amber-400/70 ring-1 ring-amber-500/20"
                          : "hover:border-l-amber-500/55 hover:bg-[#131313]"
                      }`}
                      title={nick}
                    >
                      <AvatarWithVerified verified={verified} size="sm" className="relative z-[1] h-10 w-10 shrink-0 ring-2 ring-amber-600/25 ring-offset-2 ring-offset-[#101010]">
                        <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-600/70 bg-background">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt="" fill className="object-cover" sizes="40px" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-amber-200/90">
                              {nick.slice(0, 1).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                      </AvatarWithVerified>
                      <span className="relative z-[1] flex min-w-0 flex-1 flex-col items-start text-left">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-200/45">
                          Profil
                        </span>
                        <span className="flex min-w-0 max-w-full items-center gap-1 text-sm font-semibold leading-tight text-white/95">
                          <span className="min-w-0 truncate" title={nick}>
                            {nick}
                          </span>
                          <RoleIcon role={role} size={14} className="shrink-0 opacity-90" />
                        </span>
                      </span>
                    </RefreshNavLink>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-lg border border-red-500/55 bg-transparent px-3 text-sm font-medium text-red-300/95 transition-[transform,border-color,background-color,color] duration-150 ease-out hover:-translate-y-px hover:border-red-400/60 hover:bg-red-500/[0.09] motion-reduce:hover:translate-y-0 ${navFocus}`}
                  >
                    Abmelden
                  </button>
                </div>
              </div>
              <div
                className="pointer-events-none h-px w-full shrink-0 bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
                aria-hidden
              />
              <div
                className={`relative rounded-b-[1.15rem] bg-[#0f0f0f]/88 px-1 pb-1 sm:px-2 lg:transition-all lg:duration-[380ms] lg:ease-out lg:delay-75 motion-reduce:lg:transition-none motion-reduce:lg:delay-0 ${
                  deckReady ? "lg:translate-y-0 lg:opacity-100" : "lg:translate-y-2 lg:opacity-0"
                } motion-reduce:lg:translate-y-0 motion-reduce:lg:opacity-100`}
              >
                <NavbarDesktopMainNav items={mainNavItems} navFocus={navFocus} />
              </div>
            </div>

            {/* Mobile: eine Zeile – Logo, Nachrichten, Menü (kein Scroll in der Leiste) */}
            <div className="flex w-full min-w-0 items-center gap-2 lg:hidden">
              <RefreshNavLink
                href="/dashboard"
                className={`flex shrink-0 items-center gap-2 rounded-xl px-1 py-1 text-white transition-colors duration-150 hover:text-amber-100/95 ${navFocus}`}
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-600/30 bg-gradient-to-br from-amber-950/90 via-[#1c1612] to-black text-[11px] font-bold tracking-tight text-amber-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.45)]"
                  aria-hidden
                >
                  BT
                </span>
                <span className="text-base font-semibold tracking-[-0.03em]">BoundTime</span>
              </RefreshNavLink>
              <div className="min-w-0 flex-1" aria-hidden />
            </div>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="flex shrink-0 text-lg font-semibold tracking-tight text-white transition-colors duration-150 hover:text-accent"
              >
                BoundTime
              </Link>
              <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 min-w-0">
              <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/community-regeln"
                className={`inline-flex h-9 items-center rounded-lg border border-transparent px-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white ${navFocus}`}
              >
                Community
              </Link>
              <Link
                href="/datenschutz"
                className={`inline-flex h-9 items-center rounded-lg border border-transparent px-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white ${navFocus}`}
              >
                Sicherheit
              </Link>
              <Link
                href="/boundtime-features"
                className={`inline-flex h-9 items-center rounded-lg border border-transparent px-3 text-sm font-medium text-gray-300 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white ${navFocus}`}
              >
                Boundtime- Features
              </Link>
              <Link
                href="/login"
                className={`inline-flex h-9 items-center rounded-lg border border-amber-500/25 bg-amber-950/25 px-3 text-sm font-semibold text-amber-100 transition-colors hover:border-amber-400/40 hover:bg-amber-950/40 ${navFocus}`}
              >
                Login
              </Link>
              </div>
              </div>
            </>
          )}

          {user && (
            <RefreshNavLink
              href="/dashboard/nachrichten"
              className={`relative mr-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-gray-200 transition-colors hover:border-white/18 hover:bg-white/[0.08] lg:hidden ${navFocus}`}
              aria-label="Nachrichten"
            >
              <MessageSquare className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              {unreadMessages > 0 && (
                <span className="bt-nav-badge-enter absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-semibold text-white shadow-sm">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </RefreshNavLink>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Menü schließen" : unreadNotifications > 0 ? "Menü öffnen (ungelesene Benachrichtigungen)" : "Menü öffnen"}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] p-2 text-gray-300 transition-colors duration-150 hover:border-white/18 hover:bg-white/[0.08] hover:text-white lg:hidden ${navFocus}`}
          >
            {menuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            {unreadNotifications > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
            )}
          </button>
      </nav>

      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] lg:hidden"
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
            <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-white/12 bg-[#141414] shadow-[0_0_48px_-12px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm font-semibold tracking-wide text-white">Navigation</span>
              <button
                type="button"
                onClick={closeMenu}
                className={`rounded-lg border border-white/12 bg-white/[0.04] p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white ${navFocus}`}
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-4">
              {user ? (
                <>
                  <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Hauptnavigation</p>
                  <RefreshNavLink href="/dashboard" onClick={closeMenu} className={`${mItem} ${nav.isDashboard ? mActive : mInactive}`}>
                    <Home className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    MyBound
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/entdecken" onClick={closeMenu} className={`${mItem} ${nav.isEntdecken ? mActive : mInactive}`}>
                    <Search className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    Entdecken
                  </RefreshNavLink>
                  <div className="rounded-xl border border-white/12 bg-black/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">Keuschhaltung &amp; Lock</p>
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
                      className={`${mItem} w-full !justify-start !py-2.5 ${nav.isKeuschhaltung ? mActive : mInactive}`}
                    />
                    <div className="mt-2 flex justify-start">
                      <LockDurationBadge onClick={closeMenu} />
                    </div>
                  </div>
                  <RefreshNavLink href="/dashboard/forum" onClick={closeMenu} className={`${mItem} ${nav.isForum ? mActive : mInactive}`}>
                    <MessageSquarePlus className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    Forum
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/einstellungen" onClick={closeMenu} className={`${mItem} ${nav.isEinstellungen ? mActive : mInactive}`}>
                    <Settings className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    Einstellungen
                  </RefreshNavLink>
                  <p className="mt-3 px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Konto &amp; Status</p>
                  <NotificationBell variant="mobile" onNavigate={closeMenu} />
                  {accountType === "couple" && (restrictionDotMobileSlot || effectiveRestriction !== null) && (
                    <p className="mt-2 flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400">
                      {effectiveRestriction !== null ? (
                        <span className="flex items-center gap-1.5 shrink-0" title={dotGreen ? (effectiveRestriction ? "Freigeschaltet" : "Cuckymode aus") : "Cuckymode aktiv"}>
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dotGreen ? "#22c55e" : "#ef4444" }} aria-hidden />
                          <span>{dotGreen ? (effectiveRestriction ? "Freigeschaltet" : "Cuckymode aus") : "Cuckymode aktiv"}</span>
                        </span>
                      ) : (
                        restrictionDotMobileSlot
                      )}
                    </p>
                  )}
                  {nick && (
                    <RefreshNavLink
                      href="/dashboard/profil"
                      onClick={closeMenu}
                      className={`mt-3 flex items-center gap-3 rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.9)] transition-colors hover:border-amber-500/25 ${navFocus}`}
                    >
                      <AvatarWithVerified verified={verified} size="sm" className="h-11 w-11 shrink-0 ring-1 ring-white/10">
                        <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-600/80 bg-background">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt="" fill className="object-cover" sizes="44px" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-amber-200/90">
                              {nick.slice(0, 1).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                      </AvatarWithVerified>
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">Profil</span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                          <span className="min-w-0 truncate">{nick}</span>
                          <RoleIcon role={role} size={14} className="shrink-0 text-gray-400" />
                        </span>
                      </span>
                    </RefreshNavLink>
                  )}
                  <div className="mt-auto border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        handleLogout();
                      }}
                      className={`w-full rounded-xl border border-red-500/45 bg-red-500/[0.12] py-3 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/25 ${navFocus}`}
                    >
                      Abmelden
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/community-regeln" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Community</Link>
                  <Link href="/datenschutz" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Sicherheit</Link>
                  <Link href="/boundtime-features" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Boundtime- Features</Link>
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
