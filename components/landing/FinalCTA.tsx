"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { ButtonPrimary } from "./ui/ButtonPrimary";
import { ButtonGhost } from "./ui/ButtonGhost";

export function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden py-32 text-center md:py-40"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,17,17,0.22) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%]"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,17,17,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span
            className="mb-8 inline-flex rounded-full px-5 py-2 text-sm font-medium"
            style={{
              background: "rgba(200,169,81,0.08)",
              border: "1px solid var(--border-default)",
              color: "var(--text-gold)",
              fontFamily: "var(--font-body)",
            }}
          >
            Die Plattform für deine Welt
          </span>

          <h2
            className="mb-6 mt-2 text-4xl font-semibold md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Bereit für eine Community,
            <br />
            die dich{" "}
            <span style={{ color: "var(--text-gold)" }}>versteht</span>?
          </h2>

          <p
            className="mb-12 text-lg font-light"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Kostenlos registrieren. Profil erstellen. Verbinden.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonPrimary href="/register" size="lg">
              Jetzt kostenlos starten
            </ButtonPrimary>
            <ButtonGhost href="/boundtime-features" size="lg">
              Mehr erfahren
            </ButtonGhost>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Check, text: "Kostenlos registrieren" },
              { icon: Lock, text: "Kein Abo nötig" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon size={16} style={{ color: "var(--text-gold)" }} />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
