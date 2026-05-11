"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, MapPin, ChevronDown } from "lucide-react";
import { ButtonPrimary } from "./ui/ButtonPrimary";
import { ButtonGhost } from "./ui/ButtonGhost";
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

const uspBadges = [
  { icon: ShieldCheck, label: "Verifizierte Profile" },
  { icon: Lock, label: "DSGVO-konform" },
  { icon: MapPin, label: "Deutsche Server" },
];


export function HeroSection() {
  function scrollToFeatures(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 800,
          height: 800,
          top: -200,
          right: -200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,17,17,0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 600,
          bottom: -100,
          left: -100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,17,17,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 py-32 md:py-40 md:px-8 lg:py-48">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="mb-4 text-xs font-medium uppercase tracking-[0.12em]"
              style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
            >
              Die Community für Cuckold & Hotwife-Paare
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="mb-6 text-5xl font-semibold leading-[1.05] md:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Deine Welt.{" "}
              <span style={{ color: "var(--text-gold)" }}>
                <br className="hidden sm:block" />
                Deine Regeln.
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="mb-8 max-w-md text-lg font-light leading-[1.7] md:text-xl"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              Vernetzung, Austausch und Dating für Cuckoldpaare, Hotwives und Bulls
              — diskret, verifiziert, respektvoll.
            </motion.p>

            {/* USP badges */}
            <motion.div {...fadeUp(0.3)} className="mb-10 flex flex-wrap gap-3">
              {uspBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                  style={{
                    background: "rgba(200,169,81,0.06)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <Icon size={14} style={{ color: "var(--text-gold)" }} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              {...fadeUp(0.4)}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <ButtonPrimary href="/register" size="lg">
                Jetzt kostenlos registrieren
              </ButtonPrimary>
              <ButtonGhost size="lg" onClick={scrollToFeatures}>
                Plattform entdecken
                <ChevronDown size={16} />
              </ButtonGhost>
            </motion.div>

            <motion.p
              {...fadeUp(0.4)}
              className="mt-4 text-xs"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              Bereits Mitglied?{" "}
              <Link
                href="/login"
                className="transition-colors hover:text-[var(--text-gold)]"
                style={{ color: "var(--text-gold)" }}
              >
                Anmelden →
              </Link>
            </motion.p>

          </div>

          {/* Right: Hero Visual */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/landing-brand-hero.png"
                  alt="BoundTime – Plattform für Cuckold-Paare"
                  width={520}
                  height={520}
                  priority
                  className="rounded-2xl w-full h-auto"
                  style={{
                    border: "1px solid var(--border-default)",
                    boxShadow:
                      "0 0 60px rgba(123,17,17,0.25), 0 0 120px rgba(123,17,17,0.10)",
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Floating card 1 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -top-5 -right-10"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-[220px] rounded-2xl p-4"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <Lock size={20} style={{ color: "var(--text-gold)", marginBottom: 8 }} />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  Keuschhaltung aktiv
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                >
                  Bound: 14 Tage
                </p>
                <div
                  className="mt-3 h-1.5 w-full rounded-full"
                  style={{ background: "rgba(200,169,81,0.15)" }}
                >
                  <div
                    className="h-full w-[60%] rounded-full"
                    style={{
                      background: "var(--accent-gold)",
                      animation: "lp-pulse-glow 2s ease-in-out infinite",
                    }}
                  />
                </div>
                <p
                  className="mt-1 text-right text-[11px]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  14 / 21 Tage
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
