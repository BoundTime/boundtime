# Verifizierung – Alternativen zum Foto mit Ausweis

**Status:** Brainstorming  
**Zweck:** Vertrauen erhöhen, Hürden anpassen, Datenschutz verbessern

---

## Aktueller Stand

- Nutzer lädt **Foto von sich mit Personalausweis** hoch (Gesicht + Name, Geburtsdatum sichtbar)
- Manuelle Prüfung durch BoundTime-Team
- Verifizierte User können Album-Zugriffe anfragen
- Badge „Verifiziert“ im Profil

**Hürden:** Hoher Datenschutz-Einwand, Angst vor Datenlecks, Scham (BDSM-Kontext)

---

## Alternative Methoden

### 1. Stufenweise Verifizierung (Tiers)

| Stufe | Anforderung | Badge / Label | Funktionen |
|-------|-------------|---------------|------------|
| **Bronze** | E-Mail bestätigt | – | Basis-Nutzung |
| **Silber** | + Telefon bestätigt, Profil vollständig | „Profil bestätigt“ | Erweiterte Sichtbarkeit |
| **Gold** | + ID + Gesicht (wie bisher) | „Verifiziert“ | Album-Anfragen, Dom-Bereich |

**Vorteil:** Niedrigere Einstiegshürde, klare Abstufung. **Nachteil:** „Verifiziert“ bleibt die höchste Stufe.

---

### 2. Video-Selfie / Liveness Check (ohne Ausweis)

- Kurzes Video: z.B. „Sage ‚BoundTime‘“ oder „Blicke nach links, rechts“
- Beweist: Person ist echt, Live-Aufnahme
- **Ohne** Ausweis – nur Gesicht zur Übereinstimmung mit Profilfotos

**Services:** Jumio, Onfido, Veriff, IDnow (oft mit Ausweis-KYC kombiniert; reine Liveness ist seltener)  
**Pro:** Weniger sensibel als Ausweis. **Con:** Kosten, DSGVO (Verarbeitung durch Drittanbieter).

---

### 3. Ausweis ohne Gesicht (nur Dokument)

- Nur Foto des Ausweises (Vorderseite) – Name, Geburtsdatum, Foto des Ausweises
- **Kein** Selfie mit Ausweis
- Vergleich: Profilfoto vs. Ausweisfoto (optional automatisiert)

**Pro:** Weniger intim. **Con:** Schwächere Verifikation, Profilfoto könnte von Drittem stammen.

---

### 4. Bank-Verification (Kontoverifizierung)

- Micro-Überweisung (z.B. 0,01 €) oder SEPA-Lastschrift
- Bestätigt: Konto existiert, Person hat Zugriff
- **Services:** Stripe Identity, Klarna, FinAPI

**Pro:** Starker Identitätsnachweis. **Con:** Datenschutz-Bedenken, Gebühren, nicht jeder will Bank verknüpfen.

---

### 5. eID / AusweisApp2 (Deutschland)

- Deutscher Personalausweis mit NFC-Chip
- Offiziell, DSGVO-konform, hohe Sicherheit
- **Services:** Bundesdruckerei, yes®-Komponente, Anbieter wie Verimi

**Pro:** Hohe Zuverlässigkeit. **Con:** Nur neue Ausweise, Setup-Aufwand, ggf. Hardware (NFC).

---

### 6. Referral durch verifizierten User

- Verifizierter Nutzer „bürgt“ für neuen Nutzer (Einladungslink + Bestätigung)
- Neuer Nutzer erhält abgestuftes Vertrauen (z.B. „Empfohlen von X“)

**Pro:** Community-getrieben. **Con:** Missbrauchsrisiko, schwächere Absicherung.

---

### 7. Community-Bewährung (reputationsbasiert)

- Nach X erfolgreichen Interaktionen (Nachrichten, Keuschhaltungs-Arrangements, positive Rückmeldungen)
- Label: z.B. „Aktiv seit X Monaten“, „X erfolgreiche Arrangements“
- **Ergänzt** ID-Verifikation, ersetzt sie nicht

**Pro:** Zeigt langfristiges Verhalten. **Con:** Braucht Zeit, kein Identitätsnachweis.

---

### 8. Social-Media-Verknüpfung

- Verifizierter Instagram/Twitter/LinkedIn verknüpfen (OAuth, Read-Only)
- Zeigt: Account existiert, ist aktiv

**Pro:** Schnell. **Con:** Fake-Accounts, Datenschutz, nicht jeder will Social verknüpfen.

---

### 9. Post-Ident (Brief an Adresse)

- Code wird per Post zugestellt, User gibt ihn ein
- Bestätigt Adresse, indirekt Identität

**Pro:** Starker Adressnachweis. **Con:** Langsam, Kosten, Aufwand.

---

### 10. Video-Call mit Moderator

- Kurzer Live-Call: Mod sieht Ausweis, vergleicht mit Gesicht
- Wie Video-KYC bei Banken

**Pro:** Sehr sicher. **Con:** Personalaufwand, Skalierung schwierig.

---

## Empfehlung für BoundTime

**Phase 1 – Schnell umsetzbar:**
- **Stufen-Modell (Tiers):** Bronze (E-Mail) → Silber (Telefon + Profil) → Gold (ID + Gesicht wie bisher)
- Klare Bezeichnungen, damit User verstehen, was „Verifiziert“ bedeutet

**Phase 2 – Mittelfristig:**
- **Video-Selfie/Liveness** als Option neben Ausweis (weniger sensibel, aber technisch aufwendiger)
- **Community-Bewährung:** Badges wie „Aktiv seit 6 Monaten“, „10 Arrangements“ als Zusatz-Trust

**Phase 3 – Langfristig:**
- **eID** prüfen, wenn Plattform wächst und Compliance-Anforderungen steigen

---

## Offene Fragen

1. Sollen mehrere Verifizierungswege parallel angeboten werden (User wählt)?
2. Braucht BoundTime rechtlich zwingend Identitätsnachweis (z.B. für Zahlungen, FSK18)?
3. Budget für Drittanbieter (Jumio, Onfido etc.)?
4. Soll „Verifiziert“ weiterhin nur ID + Gesicht bedeuten, oder auch Silber-Tier?

---

**Nächster Schritt:** Nutzer wählt Richtung → Prompt für Hauptagent (Datenschema, UI, Logik).
