"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ButtonPrimary } from "./ui/ButtonPrimary";
import { ButtonGhost } from "./ui/ButtonGhost";

export function LandingNav() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <motion.div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          backgroundColor: `rgba(10, 8, 16, ${bgOpacity})`,
          borderBottom: "1px solid rgba(200,169,81,0.12)",
        }}
      />

      <nav
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8"
        aria-label="Hauptnavigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="BoundTime – Startseite"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tracking-widest"
            style={{
              background: "linear-gradient(135deg,#C8A951,#8A6D2E)",
              color: "#0A0810",
            }}
          >
            BT
          </span>
          <span
            className="text-lg font-semibold tracking-wide transition-opacity group-hover:opacity-80"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
          >
            BoundTime
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex" style={{ fontFamily: "var(--font-body)" }}>
          {[
            { href: "#features", label: "Features" },
            { href: "#so-funktioniert-es", label: "So funktioniert es" },
            { href: "#diskretion", label: "Diskretion" },
          ].map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm transition-colors hover:text-[var(--text-gold)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <ButtonGhost href="/login" size="sm">
            Anmelden
          </ButtonGhost>
          <ButtonPrimary href="/register" size="sm">
            Kostenlos starten
          </ButtonPrimary>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
        >
          <span
            className="h-0.5 w-5 rounded-full transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "translateY(4px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="h-0.5 w-5 rounded-full transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="h-0.5 w-5 rounded-full transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "translateY(-4px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="overflow-hidden md:hidden"
        style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex flex-col gap-4 px-5 py-5" style={{ fontFamily: "var(--font-body)" }}>
          {[
            { href: "#features", label: "Features" },
            { href: "#so-funktioniert-es", label: "So funktioniert es" },
            { href: "#diskretion", label: "Diskretion" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-sm transition-colors hover:text-[var(--text-gold)]"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </a>
          ))}
          <hr style={{ borderColor: "var(--border-subtle)" }} />
          <ButtonGhost href="/login" size="sm" className="w-full justify-center">
            Anmelden
          </ButtonGhost>
          <ButtonPrimary href="/register" size="sm" className="w-full justify-center">
            Kostenlos starten
          </ButtonPrimary>
        </div>
      </motion.div>
    </header>
  );
}
