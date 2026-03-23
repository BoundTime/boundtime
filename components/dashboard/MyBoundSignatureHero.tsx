"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PenLine, UserPlus } from "lucide-react";

const STAGGER_MS = 55;
const DURATION_MS = 420;

export function MyBoundSignatureHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const motionClass = reduceMotion
    ? ""
    : `transition-[opacity,transform] ease-out motion-reduce:transition-none`;
  const hiddenState = !reduceMotion && !inView ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0";

  function delay(step: number) {
    if (reduceMotion || !inView) return { transitionDelay: "0ms", transitionDuration: `${DURATION_MS}ms` };
    return { transitionDelay: `${step * STAGGER_MS}ms`, transitionDuration: `${DURATION_MS}ms` };
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[1.35rem] border border-amber-200/[0.12] p-6 shadow-[0_32px_70px_-42px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(212,175,55,0.06)] ring-1 ring-white/[0.05] md:p-8 lg:p-9"
    >
      {/* Foto: rechts Motiv (Paar, Symbol) stärker sichtbar */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/dashboard-brand-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-[68%_44%] [filter:brightness(1.07)_contrast(1.04)] max-sm:object-[58%_42%] sm:object-[64%_44%] md:object-[60%_40%] lg:object-[56%_38%]"
          sizes="(max-width: 768px) 100vw, min(1152px, 100vw)"
        />
      </div>

      {/* Horizontal: links Lesefläche, rechte Hälfte deutlich offener */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/38 via-[42%] to-black/12 to-[78%]"
        aria-hidden
      />
      {/* Unten nur leichter Scrim (Buttons / gestapeltes Mobile) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent via-[58%] to-transparent"
        aria-hidden
      />
      {/* Sehr dezentes Gold nur oben links – kein Vollflächen-Matsch */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,rgba(180,140,60,0.07),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.025)_0%,transparent_38%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      {/* Watermark nur großer Viewport, außerhalb Bildzentrum, kaum sichtbar */}
      <span
        className="pointer-events-none absolute bottom-[8%] right-[5%] hidden translate-y-0 select-none text-5xl font-bold leading-none text-amber-100/[0.028] sm:text-6xl lg:block xl:bottom-[10%] xl:right-[7%] xl:text-7xl"
        aria-hidden
      >
        BT
      </span>

      <div className="relative z-[1] flex flex-col gap-6 md:flex-row md:items-stretch md:gap-0 lg:gap-3">
        <div className="flex min-w-0 flex-1 flex-col justify-center md:pr-4 lg:pr-8">
          <div
            className={`w-fit max-w-full rounded-xl border border-white/[0.1] bg-black/55 px-4 py-3 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md sm:px-5 sm:py-3.5 md:bg-black/50 ${motionClass} ${hiddenState}`}
            style={delay(0)}
          >
            <h1 className="text-lg font-semibold tracking-tight text-amber-50 sm:text-xl md:text-[1.35rem] drop-shadow-[0_1px_12px_rgba(0,0,0,0.75)]">
              Dein Feed
            </h1>
          </div>
        </div>

        <div
          className="hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-amber-400/35 to-transparent md:block"
          aria-hidden
        />

        <div
          className={`flex w-full flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/45 p-3 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md sm:flex-row sm:items-center md:w-auto md:min-w-[220px] md:flex-col md:justify-center md:bg-black/42 md:pl-2 md:pr-2 lg:pl-4 lg:pr-4 ${motionClass} ${hiddenState}`}
          style={delay(1)}
        >
          <Link
            href="#post-form"
            className="inline-flex h-12 min-w-[min(100%,14rem)] flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/22 bg-white/[0.08] px-5 text-sm font-medium text-white transition-[transform,border-color,background-color,color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-white/32 hover:bg-white/[0.12] hover:shadow-[0_10px_28px_-18px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:hover:translate-y-0 sm:flex-initial md:w-full md:min-w-[13.5rem]"
          >
            <PenLine className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
            Direkt posten
          </Link>
          <Link
            href="/dashboard/entdecken"
            className="inline-flex h-12 min-w-[min(100%,14rem)] flex-1 items-center justify-center gap-2.5 rounded-xl border border-amber-400/40 bg-amber-950/35 px-5 text-sm font-medium text-amber-50 transition-[transform,border-color,background-color,color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-amber-300/55 hover:bg-amber-950/45 hover:shadow-[0_10px_28px_-18px_rgba(180,140,60,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:hover:translate-y-0 sm:flex-initial md:w-full md:min-w-[13.5rem]"
          >
            <UserPlus className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
            Neue Kontakte
          </Link>
        </div>
      </div>
    </section>
  );
}
