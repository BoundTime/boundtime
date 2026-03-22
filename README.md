# BoundTime

Deutschsprachige **Community-Plattform** mit Fokus auf **Cuckolding, Keuschhaltung und verwandte Rollen** (u. a. Bulls, Paare, Dom/Sub) – mit Profilen, Entdecken, Feed, Nachrichten, Alben, Verifizierung und Keuschhaltungs-Features. Die App läuft auf **Next.js** mit **Supabase** (Authentifizierung, Postgres, Storage).

---

## Voraussetzungen

- **Node.js** 18.x oder 20.x (LTS empfohlen)
- Ein **Supabase-Projekt** (URL + Anon Key; für einige Server-Aktionen optional die **Service Role**)
- Für E-Mail-Flows (z. B. Restriction/Cuckymode, Bestätigungen): **SMTP** oder **Resend** (siehe `.env.example`)

---

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen

Datei **`.env.example`** nach **`.env.local`** kopieren und Werte setzen. **`.env.local`** wird nicht ins Git committet.

| Variable | Zweck |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-Projekt-URL (erforderlich) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon/Public Key (erforderlich) |
| `NEXT_PUBLIC_APP_URL` | Öffentliche Basis-URL der App (z. B. für Links in E-Mails; in Produktion setzen) |
| `SUPABASE_SERVICE_ROLE_KEY` | Nur serverseitig; u. a. für kontogestütztes Löschen (`/api/account/delete`) |
| `SMTP_*` oder `RESEND_*` | Versand transaktionaler Mails (siehe Kommentare in `.env.example`) |
| `NEXT_PUBLIC_SITE_URL` / `SITE_URL` | Optional: kanonische URL für Sitemap/Robots |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional: Meta-Tag für Google Search Console |

Details und Beispiele stehen in **`.env.example`**.

### 3. Datenbank (Supabase)

SQL-Migrationen liegen unter **`supabase/migrations/`**. Sie müssen auf dein Supabase-Projekt angewendet werden, z. B. mit der **Supabase CLI** (`supabase link` / `supabase db push`) oder durch Ausführen der Migrationen im **SQL-Editor** des Dashboards – je nachdem, wie ihr das Projekt pflegt.

Zusätzlich sind in Supabase **Authentication** (E-Mail/Passwort etc.), **Storage-Buckets** und **Row Level Security** wie in den Migrationen vorgesehen einzurichten.

### 4. Entwicklungsserver

```bash
npm run dev
```

Im Browser: **http://localhost:3000**

Öffentliche Seiten (Startseite, Login, Register, AGB, Datenschutz, …) sind ohne Login erreichbar. Der Bereich unter **`/dashboard`** erfordert eine angemeldete Nutzerin bzw. einen angemeldeten Nutzer.

---

## Verfügbare Skripte

| Befehl | Beschreibung |
|--------|----------------|
| `npm run dev` | Dev-Server (Standard: Port 3000) |
| `npm run build` | Production-Build |
| `npm run start` | Produktionsserver (nach `build`) |
| `npm run lint` | ESLint |

Hinweis: In **`next.config.mjs`** ist `eslint.ignoreDuringBuilds: true` gesetzt; `npm run build` schlägt bei Lint-Warnungen nicht automatisch fehl.

---

## Projektstruktur (Auszug)

| Pfad | Inhalt |
|------|--------|
| `app/(public)/` | Öffentliche Routen (Startseite, Login, Register, Impressum, Datenschutz, AGB, Community-Regeln, Features-Seite, …) |
| `app/(app)/dashboard/` | Geschützter App-Bereich (Dashboard, Feed, Entdecken, Profil, Nachrichten, Keuschhaltung, Einstellungen, Verifizierung, …) |
| `app/api/` | Route Handlers (z. B. Account, Restriction, Geocode) |
| `components/` | UI-Komponenten |
| `lib/` | Hilfen (Supabase-Clients, E-Mail, Profil-Utils, …) |
| `supabase/migrations/` | Schema- und Policy-Migrationen für Postgres |
| `i18n/` | Konfiguration **next-intl** (Mehrsprachigkeit) |

---

## Weitere Hinweise

- **Zahlungen:** Es sind keine Zahlungs- oder Abo-Integrationen im Sinne von Checkout/Payment-Anbietern eingebunden (kein Stripe & Co. im üblichen Sinne). „BoundDollars“ o. Ä. sind **in-app** konzipiert, nicht als Fiat-Zahlung.
- **E-Mail:** Registrierungs- und Auth-Mails können über **Supabase Auth → SMTP** konfiguriert werden; zusätzliche Mails nutzen `lib/send-email.ts` (Resend oder SMTP).
- **Deployment:** Typisch ist **Vercel** (oder vergleichbar) für die Next.js-App plus gehostetes **Supabase**. Setze dabei alle **Production-**Umgebungsvariablen und `NEXT_PUBLIC_APP_URL` auf die echte Domain.
- **Git:** Siehe **`GIT-SETUP.md`** für eine generische GitHub-Einrichtung.

---

## Produktvision (intern)

Die ausführlichere Zielrichtung (Joyclub-ähnliche Entdeckung + Feed/Social) steht in **`.cursor/PRODUKTVISION-BOUNDTIME.md`** – die öffentliche Positionierung auf der Startseite kann sich davon in Schwerpunkten unterscheiden; bei größeren Änderungen sollten Vision und Copy abgestimmt werden.
