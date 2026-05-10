"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

type Tilt3DCardProps = {
  children: ReactNode;
  className?: string;
  /** Stärke des Tilt-Effekts in Grad. Default 8. */
  intensity?: number;
  /** Glanz/Highlight-Reflex aktivieren. Default true. */
  withGlow?: boolean;
  style?: CSSProperties;
};

/**
 * Leichtgewichtiger 3D-Tilt-Hover ohne Library.
 * Verwendet CSS perspective + transform; bei prefers-reduced-motion deaktiviert
 * (über Media Query in JS – das Pointer-Tracking läuft erst bei Eingabe).
 */
export function Tilt3DCard({
  children,
  className = "",
  intensity = 8,
  withGlow = true,
  style,
}: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined") {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (m.matches) return;
    }
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    el.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--tilt-px", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-py", `${(py * 100).toFixed(1)}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-rx", "0deg");
    el.style.setProperty("--tilt-ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group/tilt relative [perspective:1100px] ${className}`}
      style={style}
    >
      <div
        className="relative h-full w-full transition-transform duration-300 ease-leather will-change-transform [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{
          transform:
            "rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg))",
        }}
      >
        {children}
        {withGlow ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100 motion-reduce:hidden"
            style={{
              background:
                "radial-gradient(circle at var(--tilt-px, 50%) var(--tilt-py, 50%), rgba(244,179,90,0.18), transparent 55%)",
              mixBlendMode: "screen",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
