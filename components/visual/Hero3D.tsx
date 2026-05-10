"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

type Hero3DProps = {
  className?: string;
};

/**
 * Lazy-ladender 3D-Hintergrund f\u00fcr die Landing-Hero:
 * Schwebende "Queen of Spades" Spielkarte (Cuckold-Code, FSK-frei) +
 * aufsteigende Pik-Symbole.
 *
 * L\u00e4dt erst nach Idle, deaktiviert sich bei prefers-reduced-motion,
 * sehr kleinen Viewports und Ger\u00e4ten mit < 2 GB RAM.
 */
export function Hero3D({ className = "" }: Hero3DProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tooSmall = window.matchMedia("(max-width: 640px)").matches;
    const lowMemory =
      typeof navigator !== "undefined" &&
      "deviceMemory" in navigator &&
      typeof (navigator as { deviceMemory?: number }).deviceMemory === "number" &&
      ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) < 2;

    if (reduceMotion || tooSmall || lowMemory) return;

    type IdleWindow = Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(() => setShouldRender(true), {
        timeout: 1200,
      });
    } else {
      timeoutId = window.setTimeout(() => setShouldRender(true), 250);
    }

    return () => {
      if (idleId !== null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(127,31,43,0.35),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_50%,rgba(244,179,90,0.14),transparent_70%)]" />

      {shouldRender ? (
        <div className="absolute inset-0">
          <HeroScene />
        </div>
      ) : null}
    </div>
  );
}
