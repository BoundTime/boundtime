import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield, FileCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ExpiredLinkBanner } from "@/components/landing/ExpiredLinkBanner";
import { getSiteUrl, SITE_DESCRIPTION_DEFAULT, SITE_NAME, SITE_TITLE_DEFAULT } from "@/lib/seo/site-config";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_DEFAULT },
  description: SITE_DESCRIPTION_DEFAULT,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION_DEFAULT,
    url: getSiteUrl(),
    images: [{ url: "/landing-brand-hero.png", alt: SITE_NAME }],
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <ExpiredLinkBanner />

      <section className="relative overflow-hidden py-12 sm:py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
                linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(180,140,60,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_60%,rgba(127,31,43,0.08),transparent_50%)]" />
        </div>

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="relative mx-auto w-full max-w-[min(100%,28rem)] sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 blur-3xl sm:blur-[64px]"
                aria-hidden
              >
                <div className="h-[min(52vw,22rem)] w-[min(90vw,28rem)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(180,140,60,0.35)_0%,rgba(127,31,43,0.12)_45%,transparent_70%)] sm:h-80 sm:w-[32rem]" />
              </div>
              <Link
                href="/"
                className="relative mx-auto block aspect-[4/5] w-full min-h-[220px] max-h-[min(72vh,640px)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[280px] md:min-h-[340px] md:max-h-[min(68vh,680px)]"
              >
                <Image
                  src="/landing-brand-hero.png"
                  alt="BoundTime"
                  fill
                  className="object-contain object-center drop-shadow-[0_12px_48px_rgba(0,0,0,0.55)] [filter:drop-shadow(0_0_40px_rgba(180,140,60,0.12))]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 48rem"
                  priority
                />
              </Link>
            </div>

            <h1 className="mt-8 text-balance text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.35rem] md:leading-tight">
              BoundTime – Cuckold Community
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-gray-400 sm:text-lg">
              Vernetzung, Austausch und Dating – diskret, verifiziert, respektvoll
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400/45 bg-amber-950/35 px-8 py-3.5 text-center text-sm font-semibold text-amber-50 shadow-[0_16px_40px_-24px_rgba(180,140,60,0.35)] transition-[transform,background-color,border-color] duration-200 hover:border-amber-300/55 hover:bg-amber-950/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transform-none sm:min-w-[200px]"
              >
                Kostenlos registrieren
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-8 py-3.5 text-center text-sm font-medium text-gray-100 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-w-[160px]"
              >
                Anmelden
              </Link>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
              <Link
                href="/community-regeln"
                className="text-sm font-medium text-amber-200/85 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
              >
                Über BoundTime
              </Link>
              <Link
                href="/boundtime-features"
                className="text-sm font-medium text-amber-200/85 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
              >
                Was sind BoundTime- Features?
              </Link>
            </div>

            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Link
                href="/community-regeln"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Community-Regeln
              </Link>
              <Link
                href="/boundtime-features"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Funktionen &amp; Ablauf
              </Link>
              <Link
                href="/datenschutz"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
              >
                <Shield className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                Datenschutz
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
