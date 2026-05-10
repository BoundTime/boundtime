import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield, FileCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { ExpiredLinkBanner } from "@/components/landing/ExpiredLinkBanner";
import { Hero3D } from "@/components/visual/Hero3D";
import { MotionStagger, MotionItem } from "@/components/visual/MotionPage";
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

        <Hero3D />

        <div
          className="pointer-events-none absolute -bottom-24 left-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(244,179,90,0.42)_0%,rgba(194,84,26,0.16)_45%,transparent_75%)] blur-2xl motion-safe:animate-candle-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 right-[10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(244,179,90,0.36)_0%,rgba(127,31,43,0.18)_50%,transparent_75%)] blur-2xl motion-safe:animate-candle-pulse-slow"
          style={{ animationDelay: "1.4s" }}
          aria-hidden
        />

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
                  className="object-contain object-center drop-shadow-[0_12px_48px_rgba(0,0,0,0.55)] [filter:drop-shadow(0_0_40px_rgba(180,140,60,0.12))] motion-safe:animate-hero-breathe"
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
                className="group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-xl border border-bronze-300/55 bg-gradient-to-b from-bronze-700/45 to-bronze-900/55 px-8 py-3.5 text-center text-sm font-semibold text-bronze-50 shadow-[0_18px_42px_-22px_rgba(194,134,46,0.55)] ring-1 ring-bronze-200/10 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-leather hover:border-bronze-200/65 hover:from-bronze-600/55 hover:to-bronze-800/65 hover:shadow-candle focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:shadow-bronze-press motion-reduce:transform-none sm:min-w-[200px]"
              >
                <span className="relative z-10">Kostenlos registrieren</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -inset-x-12 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(244,179,90,0.0)_30%,rgba(244,179,90,0.45)_50%,rgba(244,179,90,0.0)_70%,transparent_100%)] transition-transform duration-700 ease-leather group-hover:translate-x-full motion-reduce:hidden"
                />
              </Link>
              <Link
                href="/login"
                className="group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.05] px-8 py-3.5 text-center text-sm font-medium text-gray-100 transition-[transform,background-color,border-color] duration-200 ease-leather hover:border-bronze-200/35 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px sm:min-w-[160px]"
              >
                <span className="relative z-10">Anmelden</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -inset-x-10 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(244,179,90,0.0)_30%,rgba(244,179,90,0.18)_50%,rgba(244,179,90,0.0)_70%,transparent_100%)] transition-transform duration-700 ease-leather group-hover:translate-x-full motion-reduce:hidden"
                />
              </Link>
            </div>

            <MotionStagger
              className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3"
              delay={0.2}
              staggerChildren={0.1}
            >
              <MotionItem>
                <Link
                  href="/community-regeln"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
                >
                  <FileCheck className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                  Community-Regeln
                </Link>
              </MotionItem>
              <MotionItem>
                <Link
                  href="/boundtime-features"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                  Funktionen &amp; Ablauf
                </Link>
              </MotionItem>
              <MotionItem>
                <Link
                  href="/datenschutz"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-amber-400/25 hover:text-white sm:text-sm"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-200/70" strokeWidth={1.5} aria-hidden />
                  Datenschutz
                </Link>
              </MotionItem>
            </MotionStagger>
          </div>
        </Container>
      </section>
    </>
  );
}
