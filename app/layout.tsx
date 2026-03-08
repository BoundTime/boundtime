import type { Metadata } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RestrictionDot, RestrictionDotMobile } from "@/components/RestrictionDot";
import { CookieBanner } from "@/components/CookieBanner";
import { createClient } from "@/lib/supabase/server";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BoundTime – Netzwerk für diskrete und respektvolle BDSM-Kontakte",
  description:
    "Deutschsprachige BDSM-Community mit Keuschhaltung: Austausch, Begegnung und Vertrauen. Keuschhaltung mit Aufgaben und Belohnungen gemeinsam vereinbaren und umsetzen.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  verification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [messages, initialNavData] = await Promise.all([
    getMessages(),
    (async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nick, avatar_url, avatar_photo_id, role, verified, account_type, restriction_enabled")
          .eq("id", user.id)
          .single();
        const avatarUrl = profile
          ? await resolveProfileAvatarUrl(
              { avatar_url: profile.avatar_url, avatar_photo_id: profile.avatar_photo_id },
              supabase
            )
          : null;
        return {
          userId: user.id,
          nick: profile?.nick ?? null,
          avatarUrl,
          role: profile?.role ?? null,
          verified: profile?.verified ?? false,
          accountType: profile?.account_type ?? null,
          restrictionEnabled: profile?.restriction_enabled ?? false,
        };
      }
      const h = await headers();
      const headerUserId = h.get("x-bt-user-id");
      if (!headerUserId) return null;
      return {
        userId: headerUserId,
        nick: null,
        avatarUrl: null,
        role: null,
        verified: false,
        accountType: h.get("x-bt-account-type") ?? null,
        restrictionEnabled: h.get("x-bt-restriction-enabled") === "1",
      };
    })(),
  ]);

  const accountType = initialNavData?.accountType ?? null;
  const restrictionEnabled = initialNavData?.restrictionEnabled ?? false;
  const showRestrictionDot = accountType === "couple";

  return (
    <html lang="de" className="dark">
      <body
        className={`${plusJakarta.variable} antialiased min-h-screen flex flex-col overflow-x-hidden bg-background text-gray-200 font-sans text-base leading-relaxed`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar
            initialNavData={initialNavData}
            restrictionDotSlot={showRestrictionDot ? <RestrictionDot enabled={restrictionEnabled} /> : null}
            restrictionDotMobileSlot={showRestrictionDot ? <RestrictionDotMobile enabled={restrictionEnabled} /> : null}
          />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer className="relative z-10" />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
