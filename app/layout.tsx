import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { createClient } from "@/lib/supabase/server";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BoundTime – Netzwerk für diskrete und respektvolle BDSM-Kontakte",
  description:
    "Deutschsprachige BDSM-Community mit Keuschhaltung: Austausch, Begegnung und Vertrauen. Keuschhaltung mit Aufgaben und Belohnungen gemeinsam vereinbaren und umsetzen.",
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
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("nick, avatar_url, avatar_photo_id, role, verified, verification_tier")
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
        verificationTier: (profile?.verification_tier as "bronze" | "silver" | "gold") ?? (profile?.verified ? "gold" : "bronze"),
      };
    })(),
  ]);

  return (
    <html lang="de" className="dark">
      <body
        className={`${plusJakarta.variable} antialiased min-h-screen flex flex-col bg-background text-gray-200 font-sans text-base leading-relaxed`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar initialNavData={initialNavData} />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer className="relative z-10" />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
