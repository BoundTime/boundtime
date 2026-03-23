"use client";

import { useEffect, useRef, useState } from "react";
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
      className="relative overflow-hidden rounded-[1.35rem] border border-amber-200/[0.12] bg-black/45 p-6 shadow-[0_32px_70px_-42px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(212,175,55,0.06)] ring-1 ring-white/[0.05] backdrop-blur-xl md:p-8 lg:p-9"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,rgba(180,140,60,0.14),transparent_52%),radial-gradient(ellipse_90%_70%_at_100%_100%,rgba(0,0,0,0.85),transparent_50%),linear-gradient(165deg,rgba(25,22,20,0.97)_0%,rgba(8,8,10,0.98)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.04)_0%,transparent_42%,transparent_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[clamp(5rem,18vw,11rem)] font-bold leading-none text-amber-100/[0.07]"
        aria-hidden
      >
        BT
      </span>

      <div className="relative z-[1] flex flex-col gap-6 md:flex-row md:items-stretch md:gap-0 lg:gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center md:pr-6 lg:pr-10">
          <h1
            className={`text-lg font-semibold tracking-tight text-amber-100/90 sm:text-xl md:text-[1.35rem] ${motionClass} ${hiddenState}`}
            style={delay(0)}
          >
            Dein Feed
          </h1>
        </div>

        <div
          className="hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-amber-400/35 to-transparent md:block"
          aria-hidden
        />

        <div
          className={`flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:min-w-[220px] md:flex-col md:justify-center md:pl-6 lg:pl-10 ${motionClass} ${hiddenState}`}
          style={delay(1)}
        >
          <Link
            href="#post-form"
            className="inline-flex h-12 min-w-[min(100%,14rem)] flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/[0.04] px-5 text-sm font-medium text-gray-100 transition-[transform,border-color,background-color,color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-white/30 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_10px_28px_-18px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:hover:translate-y-0 sm:flex-initial md:w-full md:min-w-[13.5rem]"
          >
            <PenLine className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
            Direkt posten
          </Link>
          <Link
            href="/dashboard/entdecken"
            className="inline-flex h-12 min-w-[min(100%,14rem)] flex-1 items-center justify-center gap-2.5 rounded-xl border border-amber-400/35 bg-amber-950/15 px-5 text-sm font-medium text-amber-100/95 transition-[transform,border-color,background-color,color,box-shadow] duration-200 ease-out hover:-translate-y-px hover:border-amber-300/50 hover:bg-amber-950/30 hover:text-amber-50 hover:shadow-[0_10px_28px_-18px_rgba(180,140,60,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:hover:translate-y-0 sm:flex-initial md:w-full md:min-w-[13.5rem]"
          >
            <UserPlus className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
            Neue Kontakte
          </Link>
        </div>
      </div>
    </section>
  );
}
