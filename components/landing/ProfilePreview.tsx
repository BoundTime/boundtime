"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { RoleTag } from "./ui/RoleTag";
import { VerifiedBadge } from "./ui/VerifiedBadge";
import { ButtonPrimary } from "./ui/ButtonPrimary";

const demoProfiles = [
  { initials: "HW", nick: "HW_Munich", role: "Hotwife", plz: "80331 München", verified: true },
  { initials: "CK", nick: "CK_Hamburg", role: "Cuckold", plz: "20095 Hamburg", verified: false },
  { initials: "BB", nick: "BullBerlin", role: "Bull", plz: "10115 Berlin", verified: true },
  { initials: "SP", nick: "SwitchPaar", role: "Paar", plz: "70173 Stuttgart", verified: false },
];

export function ProfilePreview() {
  return (
    <section className="py-24 md:py-32" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-2 text-center"
        >
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
          >
            Die Community
          </p>
          <h2
            className="text-4xl font-semibold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Verifizierte Mitglieder warten auf dich
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-sm leading-[1.7]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            Alle Beispiele sind fiktive Demo-Profile. Echte Mitglieder sind ausschließlich für
            registrierte Nutzer sichtbar.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {demoProfiles.map(({ initials, nick, role, plz, verified }, i) => (
            <motion.div
              key={nick}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="relative h-56 overflow-hidden rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Initials avatar */}
              <div
                className="absolute left-1/2 top-8 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-xl font-semibold"
                style={{
                  background: "rgba(200,169,81,0.10)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-gold)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {initials}
              </div>

              {/* Bottom info */}
              <div
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                  background: "linear-gradient(to top, rgba(10,8,16,0.95), transparent)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                >
                  {nick}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <RoleTag role={role} />
                  {verified && <VerifiedBadge />}
                </div>
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  {plz}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Blurred locked cards */}
          {[5, 6].map((n) => (
            <motion.div
              key={`blur-${n}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: n * 0.08, ease: "easeOut" }}
              className="relative h-56 overflow-hidden rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(10,8,16,0.4)",
                }}
              >
                <Lock size={24} style={{ color: "var(--text-gold)" }} />
                <p
                  className="mt-2 text-xs text-center"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                >
                  Nur für Mitglieder
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <p
            className="text-sm text-center"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            Weitere Profile und echte Fotos nach der Registrierung
          </p>
          <ButtonPrimary href="/register">
            Jetzt registrieren und entdecken
          </ButtonPrimary>
        </div>
      </div>
    </section>
  );
}
