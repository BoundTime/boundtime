"use client";

import { motion } from "framer-motion";
import { EyeOff, Server, Shield, Lock } from "lucide-react";

const features = [
  {
    icon: EyeOff,
    title: "Kein Klarname nötig",
    text: "Nickname statt Klarname. Du entscheidest, was sichtbar ist.",
  },
  {
    icon: Server,
    title: "Deutsche Server · DSGVO",
    text: "Alle Daten liegen auf deutschen Servern. Vollständig DSGVO-konform.",
  },
  {
    icon: Shield,
    title: "Ende-zu-Ende Nachrichten",
    text: "Private Nachrichten sind nur zwischen Sender und Empfänger lesbar.",
  },
];

export function DiscretionSection() {
  return (
    <section
      id="diskretion"
      className="py-24 md:py-32"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p
              className="mb-3 text-xs font-medium uppercase tracking-[0.12em]"
              style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
            >
              Diskretheit zuerst
            </p>
            <h2
              className="mb-4 text-4xl font-semibold md:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Dein Privatleben bleibt{" "}
              <span style={{ color: "var(--text-gold)" }}>privat</span>
            </h2>
            <p
              className="mb-10 text-base font-light leading-[1.7]"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              BoundTime wurde von Anfang an für maximale Diskretheit gebaut.
            </p>

            <div className="space-y-6">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(200,169,81,0.08)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--text-gold)" }} />
                  </div>
                  <div>
                    <h4
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                    >
                      {title}
                    </h4>
                    <p
                      className="mt-1 text-sm leading-[1.5]"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Stacked cards visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative hidden h-80 lg:block"
          >
            {/* Card 3 – back */}
            <div
              className="absolute left-5 right-5 top-5 rounded-2xl p-5"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                opacity: 0.5,
                transform: "rotate(-3deg)",
              }}
            >
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="mb-2 h-3 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", width: `${90 - n * 15}%` }}
                />
              ))}
            </div>

            {/* Card 2 – middle */}
            <div
              className="absolute left-2.5 right-2.5 top-2.5 rounded-2xl p-5"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                opacity: 0.75,
                transform: "rotate(1.5deg)",
              }}
            >
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="mb-2 h-3 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", width: `${75 - n * 10}%` }}
                />
              ))}
            </div>

            {/* Card 1 – front */}
            <div
              className="absolute inset-0 rounded-2xl p-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              {/* Header */}
              <div className="mb-6 flex items-center gap-2">
                <Lock size={18} style={{ color: "var(--text-gold)" }} />
                <span
                  className="text-xs uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                >
                  Datenschutz-Status
                </span>
              </div>

              {/* Rows */}
              {[
                { label: "Server-Standort", value: "Deutschland 🇩🇪", type: "text" },
                { label: "DSGVO-Status", value: "Konform", type: "badge" },
                { label: "Profilsichtbarkeit", value: "Nur für Mitglieder", type: "text" },
              ].map(({ label, value, type }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b py-3 last:border-b-0"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
                  >
                    {label}
                  </span>
                  {type === "badge" ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        background: "rgba(29,158,117,0.12)",
                        border: "1px solid rgba(29,158,117,0.3)",
                        color: "#1D9E75",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {value}
                    </span>
                  ) : (
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
                    >
                      {value}
                    </span>
                  )}
                </div>
              ))}

              {/* Footer */}
              <div
                className="mt-6 flex items-center gap-2 rounded-xl p-3"
                style={{
                  background: "rgba(29,158,117,0.06)",
                  border: "1px solid rgba(29,158,117,0.15)",
                }}
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: "#1D9E75" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "#1D9E75", fontFamily: "var(--font-body)" }}
                >
                  Alle Systeme aktiv · Stand heute
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
