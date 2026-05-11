import Link from "next/link";

const cols = [
  {
    header: "Community",
    links: [
      { label: "Community-Regeln", href: "/community-regeln" },
      { label: "BoundTime-Features", href: "/boundtime-features" },
      { label: "Über uns", href: "/ueber-uns" },
    ],
  },
  {
    header: "Rechtliches",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
    ],
  },
  {
    header: "Account",
    links: [
      { label: "Anmelden", href: "/login" },
      { label: "Registrieren", href: "/register" },
      { label: "Verifizierung", href: "/register" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer
      className="py-16 md:py-20"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
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
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
              >
                BoundTime
              </span>
            </Link>
            <p
              className="mt-4 max-w-xs text-sm leading-[1.6]"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              Vernetzung, Austausch und Dating für Cuckoldpaare — diskret, verifiziert,
              respektvoll.
            </p>
            <p
              className="mt-6 text-xs"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
            >
              © {new Date().getFullYear()} BoundTime. Alle Rechte vorbehalten.
            </p>
          </div>

          {/* Columns */}
          {cols.map(({ header, links }) => (
            <div key={header}>
              <p
                className="mb-4 text-xs font-medium uppercase tracking-[0.1em]"
                style={{ color: "var(--text-gold)", fontFamily: "var(--font-body)" }}
              >
                {header}
              </p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors hover:text-[var(--text-secondary)]"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            Made with care in Germany 🇩🇪
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
          >
            DSGVO · Deutsche Server
          </span>
        </div>
      </div>
    </footer>
  );
}
