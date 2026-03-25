"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
      className="relative min-h-[min(58vw,280px)] overflow-hidden rounded-[1.35rem] border border-amber-200/[0.12] p-8 shadow-[0_32px_70px_-42px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(212,175,55,0.06)] ring-1 ring-white/[0.05] sm:min-h-[min(52vw,340px)] sm:p-9 md:min-h-[380px] md:p-10 lg:min-h-[440px] lg:p-12"
    >
      {/* Foto: Motiv rechts stärker sichtbar, etwas luftiger */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/dashboard-brand-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-[65%_42%] [filter:brightness(1.07)_contrast(1.04)] max-sm:object-[55%_40%] sm:object-[62%_42%] md:object-[58%_38%] lg:object-[54%_36%] xl:object-[52%_34%]"
          sizes="(max-width: 768px) 100vw, min(1152px, 100vw)"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/82 via-black/36 via-[48%] to-black/14 to-[82%]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent via-[55%] to-transparent"
        aria-hidden
      />
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
      <span
        className="pointer-events-none absolute bottom-[8%] right-[5%] hidden translate-y-0 select-none text-5xl font-bold leading-none text-amber-100/[0.028] sm:text-6xl lg:block xl:bottom-[10%] xl:right-[7%] xl:text-7xl"
        aria-hidden
      >
        BT
      </span>

      <div className="relative z-[1] flex min-h-[8.5rem] flex-col justify-start sm:min-h-[10rem] md:min-h-[11rem]">
        <div
          className={`w-fit max-w-full rounded-xl border border-white/[0.1] bg-black/55 px-5 py-3.5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md sm:px-6 sm:py-4 md:bg-black/50 ${motionClass} ${hiddenState}`}
          style={delay(0)}
        >
          <h1 className="text-xl font-semibold tracking-tight text-amber-50 sm:text-2xl md:text-[1.5rem] drop-shadow-[0_1px_12px_rgba(0,0,0,0.75)]">
            Dein Feed
          </h1>
        </div>
      </div>
    </section>
  );
}
