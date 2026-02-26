import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
  const messages = await getMessages();
  return (
    <html lang="de" className="dark">
      <body
        className={`${plusJakarta.variable} antialiased min-h-screen flex flex-col bg-background text-gray-200 font-sans text-base leading-relaxed`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer className="relative z-10" />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
