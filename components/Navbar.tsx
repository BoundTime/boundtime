"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, Search, MessageSquare, User as UserIcon, LockKeyhole, Settings, MessageSquarePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChastityNavBadge } from "@/components/chastity/ChastityNavBadge";
import { LockDurationBadge } from "@/components/LockDurationBadge";
import { NotificationBell } from "@/components/NotificationBell";
import { RefreshNavLink } from "@/components/RefreshNavLink";
import { RoleIcon } from "@/components/RoleIcon";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
import { useUnreadMessageCount } from "@/lib/useUnreadMessageCount";
import { AvatarWithVerified } from "@/components/AvatarWithVerified";
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
  };
  const activeLink =
    "rounded-md border border-white/15 bg-white/10 px-2 py-1 text-white font-semibold shadow-sm";
  const inactiveLink =
    "rounded-md px-2 py-1 text-gray-300 transition-colors duration-150 hover:bg-white/5 hover:text-white";

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
        className={`mx-auto mt-2 flex w-full max-w-6xl items-center gap-3 overflow-hidden rounded-2xl border px-3 transition-all duration-200 sm:px-4 ${
          scrolled
            ? "border-white/10 bg-[#111111]/95 py-2 shadow-[0_16px_30px_-22px_rgba(0,0,0,0.95)] backdrop-blur"
            : "border-white/8 bg-[#141414]/92 py-3 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.95)] backdrop-blur"
        }`}
      >
        {user ? (
          <>
            <div className="hidden lg:mr-2 lg:flex lg:shrink-0 lg:items-center lg:justify-start">
              <RefreshNavLink
                href="/dashboard"
                className="group flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-white transition-colors duration-150 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/5 text-xs font-bold text-amber-100">
                  BT
                </span>
                <span className="text-base font-semibold tracking-[0.01em]">BoundTime</span>
              </RefreshNavLink>
            </div>
            <div className="flex shrink-0 lg:hidden">
              <RefreshNavLink
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-1 py-1 text-white transition-colors duration-150 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/5 text-xs font-bold text-amber-100">
                  BT
                </span>
                <span className="text-base font-semibold tracking-tight">BoundTime</span>
              </RefreshNavLink>
            </div>
            <div className="hidden min-w-0 lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-1 lg:pl-1">
                <RefreshNavLink
                  href="/dashboard"
                  className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isDashboard ? activeLink : inactiveLink}`}
                >
                  <Home className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  MyBound
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/entdecken"
                  className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isEntdecken ? activeLink : inactiveLink}`}
                >
                  <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  Entdecken
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/nachrichten"
                  className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isNachrichten ? activeLink : inactiveLink}`}
                >
                  <span className="relative shrink-0">
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    {unreadMessages > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-medium text-white">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </span>
                  Nachrichten
                </RefreshNavLink>
                <div className="mx-1">
                  <NotificationBell />
                </div>
                <ChastityNavBadge
                  className="rounded-md px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
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
                    className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isDomBereich ? activeLink : inactiveLink}`}
                    title="Dom(me)-Forum – Themen erstellen und diskutieren"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                    Forum
                  </RefreshNavLink>
                )}
                <RefreshNavLink
                  href="/dashboard/profil"
                  className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isProfil ? activeLink : inactiveLink}`}
                >
                  <UserIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  Profil
                </RefreshNavLink>
                <RefreshNavLink
                  href="/dashboard/einstellungen"
                  className={`flex shrink-0 items-center gap-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${nav.isEinstellungen ? activeLink : inactiveLink}`}
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                  Einstellungen
                </RefreshNavLink>
            </div>
            <div className="hidden min-w-0 lg:flex lg:shrink-0 lg:min-w-[260px] lg:basis-[260px] lg:items-center lg:justify-end">
              <div className="flex min-w-0 flex-shrink-0 items-center gap-2 border-l border-white/10 pl-3">
                {accountType === "couple" && (
                  effectiveRestriction !== null ? (
                    <span className="flex items-center gap-1.5 shrink-0" title={dotGreen ? (effectiveRestriction ? "Freigeschaltet – Schreiben erlaubt" : "Cuckymode aus") : "Cuckymode aktiv – Passwort nötig zum Schreiben"}>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dotGreen ? "#22c55e" : "#ef4444" }} aria-hidden />
                      <span className="hidden text-[10px] text-gray-400 lg:inline" aria-label={dotGreen ? (effectiveRestriction ? "Freigeschaltet" : "Cuckymode aus") : "Cuckymode an"}>
                        {dotGreen ? (effectiveRestriction ? "Freigeschaltet" : "Cuckymode aus") : "Cuckymode an"}
                      </span>
                    </span>
                  ) : (
                    restrictionDotSlot
                  )
                )}
                <LockDurationBadge />
                {nick && (
                    <RefreshNavLink
                      href="/dashboard"
                      className={`flex min-w-0 items-center gap-1.5 rounded-lg border px-1.5 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300/70 ${
                        nav.isDashboard
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                      title={nick}
                    >
                    <AvatarWithVerified verified={verified} size="sm" className="h-8 w-8 shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-600 bg-background">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-accent">
                          {nick.slice(0, 1).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    </AvatarWithVerified>
                    <span className="flex min-w-0 max-w-[180px] items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium">
                      <span className="min-w-0 truncate" title={nick}>{nick}</span>
                      <span className="shrink-0"><RoleIcon role={role} size={12} /></span>
                    </span>
                  </RefreshNavLink>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 whitespace-nowrap rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-300/60"
                >
                  Abmelden
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0 lg:hidden" aria-hidden />
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
              <div className="hidden lg:flex lg:items-center lg:gap-4">
              <Link
                href="/community-regeln"
                className="text-sm text-gray-300 transition-colors duration-150 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded"
              >
                Community
              </Link>
              <Link
                href="/datenschutz"
                className="text-sm text-gray-300 transition-colors duration-150 hover:text-white"
              >
                Sicherheit
              </Link>
              <Link
                href="/boundtime-features"
                className="text-sm text-gray-300 transition-colors duration-150 hover:text-white"
              >
                boundtime-features
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
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
              className="relative mr-1 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-200 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-300/70 lg:hidden"
              aria-label="Nachrichten"
            >
              <MessageSquare className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              {unreadMessages > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-medium text-white">
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
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2 text-gray-300 transition-colors duration-150 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300/70 lg:hidden"
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
            <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#161616] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <span className="font-semibold text-white">Navigation</span>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
              {user ? (
                <>
                  <RefreshNavLink href="/dashboard" onClick={closeMenu} className={`rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isDashboard ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <Home className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    MyBound
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/entdecken" onClick={closeMenu} className={`rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isEntdecken ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <Search className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Entdecken
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/nachrichten" onClick={closeMenu} className={`relative flex items-center rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isNachrichten ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <MessageSquare className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Nachrichten
                    {unreadMessages > 0 && (
                      <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
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
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  />
                  {verified && (role === "Dom" || role === "Switcher") && (
                    <RefreshNavLink href="/dashboard/dom-bereich" onClick={closeMenu} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isDomBereich ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                      <MessageSquarePlus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                      Dom(me)-Forum
                    </RefreshNavLink>
                  )}
                  <RefreshNavLink href="/dashboard/profil" onClick={closeMenu} className={`rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isProfil ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <UserIcon className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Profil
                  </RefreshNavLink>
                  <RefreshNavLink href="/dashboard/einstellungen" onClick={closeMenu} className={`rounded-xl border px-4 py-3 text-base transition-colors duration-150 ${nav.isEinstellungen ? "border-white/20 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                    <Settings className="mr-2 inline-block h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Einstellungen
                  </RefreshNavLink>
                  <div className="py-2" onClick={closeMenu}>
                    <LockDurationBadge onClick={closeMenu} />
                  </div>
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
                    <RefreshNavLink href="/dashboard" onClick={closeMenu} className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/10">
                      <AvatarWithVerified verified={verified} size="sm" className="h-10 w-10 shrink-0">
                      <div className="relative h-full w-full overflow-hidden rounded-full border border-gray-600 bg-background">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-accent">
                            {nick.slice(0, 1).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      </AvatarWithVerified>
                      <span className="flex items-center gap-1.5 text-sm text-gray-300">
                        Hallo, {nick}
                        <RoleIcon role={role} size={14} />
                      </span>
                    </RefreshNavLink>
                  )}
                  <div className="mt-auto border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => { closeMenu(); handleLogout(); }}
                      className="w-full rounded-xl border border-red-500/50 bg-red-500/10 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      Abmelden
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/community-regeln" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Community</Link>
                  <Link href="/datenschutz" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">Sicherheit</Link>
                  <Link href="/boundtime-features" onClick={closeMenu} className="rounded-lg px-4 py-3 text-base text-gray-300 transition-colors duration-150 hover:bg-gray-800 hover:text-white">boundtime-features</Link>
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
