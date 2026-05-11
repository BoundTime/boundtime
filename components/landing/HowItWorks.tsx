"use client";

import { motion } from "framer-motion";
import { UserPlus, Shield, Heart } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Kostenlos registrieren",
    text: "Wähle deinen Nickname, deine Rolle und starte — in unter 2 Minuten. Keine E-Mail-Verifizierung vorab nötig.",
  },
  {
    num: "02",
    icon: Shield,
    title: "Profil verifizieren lassen",
    text: "Lade ein Verifizierungsfoto hoch. Nach Prüfung erhältst du den blauen Haken — und Zugang zu verifizierten Mitgliedern.",
  },
  {
    num: "03",
    icon: Heart,
    title: "Verbinden & Entdecken",
    text: "Filtere nach Rolle, Vorlieben und PLZ. Schreibe direkt, biete Keuschhaltungs-Dynamiken an — deine Regeln.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="so-funktioniert-es"
      className="relative py-24 md:py-32"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
          >
            In 3 Schritten
          </p>
          <h2
            className="text-4xl font-semibold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Von der Registrierung zur Verbindung
          </h2>
          <p
            className="mx-auto mt-5 max-w-md text-base font-light leading-[1.7]"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Diskret, sicher und in wenigen Minuten.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ num, icon: Icon, title, text }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="rounded-2xl p-8"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p
                className="mb-4 text-5xl font-semibold leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "rgba(200,169,81,0.2)",
                }}
              >
                {num}
              </p>
              <div
                className="mb-4 inline-flex rounded-xl p-3"
                style={{
                  background: "rgba(200,169,81,0.08)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Icon size={24} style={{ color: "var(--text-gold)" }} />
              </div>
              <h3
                className="mb-2 text-base font-medium"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-[1.6]"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
              >
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
