"use client";

import { motion } from "framer-motion";
import { Users, Sliders, MapPin, MessageSquare, Crown, Gift, Coins } from "lucide-react";
import { ButtonGhost } from "./ui/ButtonGhost";
import { VerifiedBadge } from "./ui/VerifiedBadge";

/* ── Shared helpers ─────────────────────────────────────── */
function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded"
        style={{
          background: "rgba(200,169,81,0.10)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden>
          <path d="M1 3.5L3.5 6L8 1" stroke="#C8A951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span
        className="text-sm leading-[1.5]"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        {text}
      </span>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
      style={{ background: on ? "#1D9E75" : "rgba(255,255,255,0.10)" }}
    >
      <span
        className="absolute h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </div>
  );
}

function SectionHeader({ eyebrow, h2, h2Gold, sub }: { eyebrow: string; h2: string; h2Gold?: string; sub: string }) {
  return (
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
        {eyebrow}
      </p>
      <h2
        className="text-4xl font-semibold md:text-5xl"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        {h2Gold ? (
          <>
            {h2}{" "}
            <span style={{ color: "var(--text-gold)" }}>{h2Gold}</span>
          </>
        ) : (
          h2
        )}
      </h2>
      <p
        className="mx-auto mt-5 max-w-lg text-base font-light leading-[1.7]"
        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
      >
        {sub}
      </p>
    </motion.div>
  );
}

/* ── Cuckymode Mockup ───────────────────────────────────── */
function CuckymodeMockup() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 0 40px rgba(123,17,17,0.18)",
      }}
    >
      <p
        className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "rgba(200,169,81,0.5)", fontFamily: "var(--font-body)" }}
      >
        Cuckymode Aktiv
      </p>

      {/* Hotwife panel */}
      <p className="mb-2 text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
        Hotwife — Steuerung
      </p>
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: "rgba(200,169,81,0.04)", border: "1px solid var(--border-subtle)" }}
      >
        {[
          { label: "Nachrichten lesen", on: true },
          { label: "Nachrichten schreiben", on: false },
          { label: "Bilder anzeigen", on: false },
        ].map(({ label, on }, i, arr) => (
          <div
            key={label}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
          >
            <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              {label}
            </span>
            <Toggle on={on} />
          </div>
        ))}
      </div>

      <hr style={{ borderColor: "var(--border-subtle)", marginBottom: 16 }} />

      {/* Cuckold status */}
      <p className="mb-2 text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
        Cuckold — Aktueller Zustand
      </p>
      <div
        className="rounded-xl p-4"
        style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.20)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "#E24B4A" }} />
          <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>Schreiben gesperrt</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: "#1D9E75" }} />
          <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>Lesen erlaubt</span>
        </div>
        <p className="mt-3 text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
          Um zu schreiben, Passwort eingeben:
        </p>
        <input
          readOnly
          value=""
          placeholder="••••••••"
          aria-label="Passwort-Eingabe"
          className="mt-2 w-full rounded-lg px-3 py-2 text-[13px] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        />
      </div>
      <p className="mt-4 text-right text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
        Powered by BoundTime Cuckymode™
      </p>
    </div>
  );
}

/* ── BoundDollars Mockup ────────────────────────────────── */
function BoundDollarsMockup() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 0 40px rgba(123,17,17,0.18)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
          Aktive Dynamik
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[11px]"
          style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.3)", color: "#1D9E75", fontFamily: "var(--font-body)" }}
        >
          Aktiv
        </span>
      </div>

      <div
        className="mb-4 rounded-xl p-4"
        style={{ background: "rgba(200,169,81,0.04)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex justify-between">
          <span className="text-[13px]" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
            Keuschhaltung · 21 Tage
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
            Läuft ab: 01.07.2026
          </span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full" style={{ background: "rgba(200,169,81,0.10)" }}>
          <div className="h-full w-[67%] rounded-full" style={{ background: "var(--accent-gold)" }} />
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>14 / 21 Tage</span>
          <span className="text-[11px]" style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}>67%</span>
        </div>
      </div>

      <p className="mb-2 text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Bei Erfüllung</p>
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{ background: "rgba(200,169,81,0.08)", border: "1px solid var(--border-subtle)" }}
      >
        <Gift size={14} style={{ color: "var(--text-gold)" }} />
        <span className="text-[13px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>Orgasmus-Erlaubnis</span>
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t pt-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <p className="text-[12px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>BoundDollars-Guthaben</p>
          <p className="mt-0.5 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-gold)" }}>340 BD</p>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "rgba(200,169,81,0.10)" }}
        >
          <Coins size={16} style={{ color: "var(--text-gold)" }} />
        </div>
      </div>
    </div>
  );
}

/* ── Vorlieben Tag Cloud ─────────────────────────────────── */
const sampleTags = [
  "Keuschhaltung", "Demütigung", "24/7-Dynamik", "Cuckold", "Findom",
  "Bondage", "Orgasmuskontrolle", "Mindfuck", "Befehle", "Langzeit-Cage",
];

/* ── Main Export ─────────────────────────────────────────── */
export function FeatureShowcase() {
  return (
    <section
      id="features"
      className="py-24 md:py-32"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section header */}
        <SectionHeader
          eyebrow="Was BoundTime einzigartig macht"
          h2="Features, die es"
          h2Gold="nirgendwo sonst gibt"
          sub="BoundTime ist die erste Plattform, die die Dynamik einer Cuckoldbeziehung als Features abbildet — nicht als Tabu."
        />

        {/* Feature 1 — Cuckymode */}
        <div className="mb-32 grid items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span
              className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
              style={{ background: "rgba(200,169,81,0.10)", border: "1px solid var(--border-default)", color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
            >
              BoundTime Exclusive
            </span>
            <h3
              className="mb-4 text-3xl font-semibold md:text-4xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Cuckymode
            </h3>
            <p className="mb-8 text-base font-light leading-[1.7]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Die Hotwife wird zur Administratorin. Sie entscheidet, was ihr Cuckold sehen, schreiben
              und tun darf — in Echtzeit, innerhalb der Plattform.
            </p>
            <div className="mb-8 space-y-3">
              <FeatureCheck text="Hotwife verwaltet Lese- und Schreibrechte des Cuckolds" />
              <FeatureCheck text="Nachrichten sperren, freigeben oder einschränken" />
              <FeatureCheck text="Zugriff auf Profilbereiche individuell steuern" />
              <FeatureCheck text="Cuckold-Passwort für temporäre Entsperrung" />
            </div>
            <ButtonGhost href="/boundtime-features#cuckymode" size="sm">Mehr zu Cuckymode</ButtonGhost>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <CuckymodeMockup />
          </motion.div>
        </div>

        {/* Feature 2 — BoundDollars (gespiegelt) */}
        <div className="mb-32 grid items-center gap-16 lg:grid-cols-2">
          {/* Mockup left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            <BoundDollarsMockup />
          </motion.div>

          {/* Text right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="order-1 lg:order-2"
          >
            <span
              className="mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
              style={{ background: "rgba(200,169,81,0.10)", border: "1px solid var(--border-default)", color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
            >
              Gamification
            </span>
            <h3
              className="mb-4 text-3xl font-semibold md:text-4xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              BoundDollars & Keuschhaltung
            </h3>
            <p className="mb-8 text-base font-light leading-[1.7]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Vereinbarungen zwischen Hotwife und Cuckold werden zur lebendigen Dynamik. BoundDollars
              belohnen Gehorsam — als sichtbares Zeichen innerhalb der Community.
            </p>
            <div className="space-y-3">
              <FeatureCheck text="Keuschhaltungs-Dynamiken mit frei definierbarem Zeitraum" />
              <FeatureCheck text="BoundDollars als Fantasywährung für Belohnungen" />
              <FeatureCheck text="Dreiecksvereinbarungen: Hotwife + Bull + Cuckold" />
              <FeatureCheck text="Öffentlicher BD-Status zeigt Gehorsam des Cuckolds" />
            </div>
            <div className="mt-8">
              <ButtonGhost href="/boundtime-features#keuschhaltung-bounddollars" size="sm">
                Mehr zu Keuschhaltung &amp; BoundDollars
              </ButtonGhost>
            </div>
          </motion.div>
        </div>

        {/* Feature 3 — Entdecken */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}>Community</p>
            <h3 className="text-3xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Finde, was du wirklich suchst
            </h3>
            <p className="mx-auto mt-4 max-w-lg text-base font-light leading-[1.7]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              40+ BDSM-Vorlieben, Rollenfilter, PLZ-Umkreissuche. Nicht generisches Dating — echte Nische.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Users, title: "Dom · Sub · Switcher · Bull", text: "Wähle deine Rolle und finde Gleichgesinnte in deiner Umgebung.", featured: false },
              { icon: Sliders, title: "40+ Vorlieben-Filter", text: "Von Keuschhaltung über Findom bis 24/7-Dynamik — du definierst, was passt.", featured: true },
              { icon: MapPin, title: "PLZ-Umkreissuche", text: "Finde Mitglieder in deiner Nähe in Deutschland, Österreich und der Schweiz.", featured: false },
            ].map(({ icon: Icon, title, text, featured }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 md:p-8"
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${featured ? "var(--border-default)" : "var(--border-subtle)"}`,
                  boxShadow: featured ? "0 0 30px rgba(200,169,81,0.08)" : "none",
                }}
              >
                <Icon size={28} className="mb-4" style={{ color: "var(--text-gold)" }} />
                <h4 className="mb-3 text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                  {title}
                </h4>
                <p className="text-sm leading-[1.6]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  {text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tag cloud */}
          <div className="mt-8 hidden justify-center gap-2 md:flex md:flex-wrap">
            {sampleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Feature 4 — Forum */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}>Forum</p>
            <h3 className="text-3xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              Dein sicherer Raum für Austausch
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-[1.7]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              Allgemeines Forum für alle Mitglieder. Separater Dom(me)-Bereich — serverseitig geschützt, nur für verifizierte Doms zugänglich.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
              {/* Allgemeines Forum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl p-6 text-left"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
              >
                <MessageSquare size={24} className="mb-3" style={{ color: "var(--text-gold)" }} />
                <h4 className="mb-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Allgemeines Forum</h4>
                <p className="text-sm leading-[1.6]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  Offen für alle eingeloggten Mitglieder. Diskussionen, Fragen, Erfahrungen.
                </p>
              </motion.div>

              {/* Dom Forum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="relative rounded-2xl p-6 text-left"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
              >
                <span
                  className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: "rgba(200,169,81,0.10)", border: "1px solid var(--border-default)", color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
                >
                  Exklusiv
                </span>
                <Crown size={24} className="mb-3" style={{ color: "var(--text-gold)" }} />
                <h4 className="mb-2 text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Dom(me)-Forum</h4>
                <p className="mb-3 text-sm leading-[1.6]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
                  Nur für verifizierte Doms zugänglich. Serverseitig geschützt.
                </p>
                <VerifiedBadge label="Verifizierung erforderlich" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
