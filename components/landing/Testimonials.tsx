"use client";

import { motion } from "framer-motion";
import { RoleTag } from "./ui/RoleTag";

const testimonials = [
  {
    quote:
      "Endlich eine Plattform, die unsere Dynamik versteht. Der Cuckymode ist revolutionär — wir haben ihn sofort in unser Leben integriert.",
    attribution: "Hotwife · Paar · Rheinland",
    role: "Hotwife",
    initials: "H",
  },
  {
    quote:
      "Die Verifizierung gibt uns Sicherheit. Wir wissen, dass alle Profile real sind. Das ist bei anderen Plattformen nicht selbstverständlich.",
    attribution: "Cuckold · Einzel · Bayern",
    role: "Cuckold",
    initials: "C",
  },
  {
    quote:
      "Als Bull ist die Plattform ein Traum. Filter nach PLZ, Paar-Suche, und direkte Kontaktaufnahme — ohne Umwege.",
    attribution: "Bull · Einzel · Berlin",
    role: "Bull",
    initials: "B",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p
            className="mb-3 text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
          >
            Stimmen aus der Community
          </p>
          <h2
            className="text-4xl font-semibold md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Was unsere Mitglieder sagen
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, attribution, role, initials }, i) => (
            <motion.div
              key={attribution}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="block leading-[0.8] text-6xl font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "rgba(200,169,81,0.2)",
                  marginBottom: 16,
                }}
              >
                &ldquo;
              </span>
              <p
                className="mb-6 text-base italic leading-[1.7]"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-secondary)",
                }}
              >
                {quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shrink-0"
                  style={{
                    background: "rgba(200,169,81,0.10)",
                    color: "var(--text-gold)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                  >
                    {attribution}
                  </p>
                  <div className="mt-1">
                    <RoleTag role={role} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
