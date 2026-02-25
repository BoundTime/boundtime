# BoundTime

Netzwerk für diskrete und respektvolle BDSM-Kontakte – eine deutschsprachige Community-Plattform (nur lokale Entwicklung, keine Deployment- oder Backend-Integration).

## Voraussetzungen

- **Node.js** (Version 18.x oder 20.x empfohlen)

## Schritt-für-Schritt Anleitung

### 1. Node.js installieren

Falls noch nicht vorhanden:

- Unter [https://nodejs.org](https://nodejs.org) die LTS-Version herunterladen und installieren.
- Im Terminal prüfen: `node -v` und `npm -v`.

### 2. Abhängigkeiten installieren

Im Projektordner (dort, wo diese `README.md` liegt):

```bash
npm install
```

### 3. Entwicklungsserver starten

```bash
npm run dev
```

### 4. Im Browser öffnen

Im Browser aufrufen:

**http://localhost:3000**

Die Startseite von BoundTime erscheint. Von dort aus können Sie alle öffentlichen Seiten und das Dashboard (über `/dashboard`) nutzen.

---

## Projektstruktur (Auszug)

- `app/(public)/` – Öffentliche Seiten (Startseite, Login, Register, Impressum, Datenschutz, AGB, Community-Regeln)
- `app/(app)/` – Geschützter Bereich (Dashboard, nur UI)
- `components/` – Wiederverwendbare Komponenten (Navbar, Footer, AuthForm, Container)
- `lib/` – Hilfsfunktionen
- `types/` – TypeScript-Typen

## Wichtige Hinweise

- **Nur lokal:** Es wird nichts online deployt. Der Server läuft ausschließlich auf Ihrem Rechner.
- **Kein Backend:** Login/Register validieren nur im Frontend; es gibt keine Anbindung an Supabase oder andere Dienste.
- **Kein Payment:** Es sind keine Zahlungsfunktionen integriert.

## Verfügbare Skripte

| Befehl        | Beschreibung                    |
|---------------|----------------------------------|
| `npm run dev` | Startet den Dev-Server (Port 3000) |
| `npm run build` | Erstellt einen Production-Build |
| `npm run start` | Startet die gebaute App (nach `npm run build`) |
| `npm run lint` | Führt ESLint aus                |
