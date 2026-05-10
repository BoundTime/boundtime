import type { CSSProperties } from "react";

type RedRoomBackgroundProps = {
  variant?: "hero" | "section" | "subtle";
  withGrid?: boolean;
  withCandles?: boolean;
  className?: string;
};

/**
 * Wiederverwendbarer Hintergrund-Layer für die "Red Room"-Atmosphäre.
 * - Sehr dezenter Lederlook (radiales Burgund-Glow + dunkles Vignette).
 * - Optional: feines Grid (für Hero), zwei pulsierende Kerzen am unteren Rand.
 * Kein Bild-Asset nötig, alles CSS – läuft auf jedem Gerät performant.
 */
export function RedRoomBackground({
  variant = "section",
  withGrid = false,
  withCandles = false,
  className = "",
}: RedRoomBackgroundProps) {
  const burgundyOpacity =
    variant === "hero" ? 0.16 : variant === "section" ? 0.1 : 0.06;
  const amberOpacity =
    variant === "hero" ? 0.12 : variant === "section" ? 0.08 : 0.04;

  const burgundy: CSSProperties = {
    background: `radial-gradient(ellipse 90% 60% at 50% -20%, rgba(127,31,43,${burgundyOpacity}), transparent 55%)`,
  };
  const amber: CSSProperties = {
    background: `radial-gradient(ellipse 70% 50% at 100% 60%, rgba(180,140,60,${amberOpacity}), transparent 50%)`,
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    >
      {withGrid ? (
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      ) : null}

      <div className="absolute inset-0" style={burgundy} />
      <div className="absolute inset-0" style={amber} />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {withCandles ? (
        <>
          <div
            className="absolute -bottom-12 left-[8%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(244,179,90,0.55)_0%,rgba(194,84,26,0.2)_45%,transparent_75%)] blur-2xl animate-candle-pulse"
          />
          <div
            className="absolute -bottom-16 right-[10%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(244,179,90,0.45)_0%,rgba(127,31,43,0.18)_50%,transparent_75%)] blur-2xl animate-candle-pulse-slow"
            style={{ animationDelay: "1.4s" }}
          />
        </>
      ) : null}
    </div>
  );
}
