# Design-Referenz: Joyclub & Instagram – Analyse für BoundTime

Recherche zu Joyclub.de und Instagram zur Orientierung für das BoundTime-Layout (Profilkacheln, Feed).

**Nicht übernehmen:** Die rechte Sidebar „Meine Kontakte“ von Joyclub – wird für BoundTime (erstmal) nicht gewünscht.

---

## 1. Joyclub.de – was sichtbar war

### Öffentlich zugänglich (ohne Login)
- **Landing:** Hero-Bereich, Onboarding-Felder (Geschlecht, Interessen, Ort, Geburtstag), CTA-Buttons, Sektionen (Livestreams, Community, Dates, Events).
- **Mitglieder-/Explore-Seiten:** Erfordern Login – die eigentlichen **Profil-Kacheln** und das **Grid-Layout** sind von außen nicht einsehbar.

### Bekanntes zu Joyclub (aus Recherche)
- **Profiltypen:** Single, Paar, Trans*, Non-binary, Fotografen.
- **Profil-Inhalte:** Beziehungsstatus, Ort, Links, Pinnwand-Posts.
- **Navigation:** Erleben (Dates, Events, Clubs), Eintauchen (Mitglieder, Livestreams, Forum, Gruppen, Fotos), Entdecken (Magazin, Sex Education).
- **Layout-Diskussionen:** Es gab Community-Debatten zu „Neues Layout“ – Joyclub iteriert am Design.

### Einschränkung
Ohne Login können die **konkreten Profilkacheln** (Größe, Spalten, Abstände, Bildformat) nicht analysiert werden.  
**Alternative:** Screenshots von Joyclub (Mitgliedersuche/Explore) würden helfen – diese können hier als Referenz genutzt werden.

---

## 2. Instagram – Feed & Profil-Grid

### Feed-Layout
- **Struktur:** Ein Post = eine Karte; oben Avatar + Name + Zeit, darunter Inhalt (Bild/Video), darunter Like/Kommentar/Teilen.
- **Bildformate:** Aktuell **4:5 (1080×1350)** dominiert – vertikal, mobil-optimiert; 1:1 wird seltener.
- **Spacing:** Klare Abstände zwischen Posts; einheitliche Karten-Höhe je Post; keine Überlappungen.
- **Mobile First:** Feed ist vertikal scrollbar; Karten nutzen fast die volle Breite; konsistente Paddings.

### Profil-Grid (3-Spalten)
- **Layout:** 3 Spalten, quadratische Vorschaubilder (1:1).
- **Abstände:** Minimale Lücken zwischen den Kacheln (1–2 px).
- **Optik:** Ruhiges, gleichmäßiges Raster.

---

## 3. BoundTime aktuell vs. Empfehlungen

### Entdecken – Profilkacheln

| Aspekt | BoundTime aktuell | Empfehlung (Joyclub/Instagram-Stil) |
|--------|-------------------|-------------------------------------|
| **Grid** | `gap-3`, sm:3, md:4, lg:5, xl:6 Spalten | Weniger Spalten auf Desktop (z.B. 4–5 max), mehr Abstand – weniger „gestopft“ |
| **Bild** | `aspect-square` (1:1) | Entweder 1:1 beibehalten (wie Instagram-Profil) oder leicht hochformatig (4:5) für mehr Präsenz |
| **Kachelgröße** | Variiert stark mit Spaltenzahl | Einheitlichere Kacheln; auf Mobile 2 Spalten, klare Touch-Ziele |
| **Info-Bereich** | `p-2`, Rolle/Geschlecht/Ort | Etwas mehr Platz; Nick prominenter; ggf. Badge/Online-Status deutlicher |
| **Abstände** | `gap-3` / `gap-2` | `gap-4` für mehr Luft; harmonischeres Grid |

### Feed

| Aspekt | BoundTime aktuell | Empfehlung (Instagram-Stil) |
|--------|-------------------|-----------------------------|
| **Post-Karten** | Avatar + Nick + Zeit, dann Content, dann Like | Struktur passt; Abstände prüfen |
| **Bilder** | `max-h-[28rem]`, object-contain | Einheitlicheres Bildformat (z.B. max. Höhe/Breite); ggf. 4:5-Ratio für neue Posts |
| **Spacing** | `space-y-6` zwischen Posts | Kann bleiben; evtl. `space-y-4` auf Mobile für kompakteren Feed |
| **Karten-Optik** | Border, rounded-xl | Beibehalten; klare Trennung der Posts |

### Allgemein
- **Mobile:** Weniger Spalten, größere Kacheln, mehr Abstand.
- **Desktop:** Nicht zu viele Spalten (4–5 statt 6); Kacheln wirken sonst zu klein.
- **Einheitlichkeit:** Gleiche Abstände, gleiche Rundungen, konsistente Schriften.

---

## 4. Konkrete Anpassungen für BoundTime (Priorisiert)

### Hoch
1. **Entdecken-Grid:** Weniger Spalten (z.B. 2 mobile, 3 sm, 4 md, 5 lg, max. 5 xl); `gap-4` für mehr Luft.
2. **Profil-Kacheln:** Nick größer/sichtbarer; Info-Bereich mit etwas mehr Padding.
3. **Mobile Entdecken:** 2 Spalten, größere Kacheln, klarere Touch-Flächen.

### Mittel
4. **Feed:** Einheitlicheres Bildformat; Abstände zwischen Posts prüfen.
5. **Karten-Stil:** Einheitliche Rundungen (`rounded-lg` oder `rounded-xl`) und Borders.

### Optional (wenn Joyclub-Screenshots vorliegen)
6. Joyclub-spezifische Details übernehmen (z.B. Badge-Platzierung, Hover-Effekte).

---

## 5. Nächster Schritt

**Option A:** Du schickst **Screenshots** von Joyclub (Mitgliedersuche, Profil-Übersicht) – dann kann die Analyse verfeinert und der Prompt für den Hauptagenten präzisiert werden.

**Option B:** Der Hauptagent setzt die obigen Empfehlungen um (ohne Joyclub-Login); die Anpassungen orientieren sich an Instagram und üblichen Dating-Grid-Best-Practices.

**Hinweis:** Zugangsdaten für Joyclub sind aus Sicherheitsgründen nicht nötig. Screenshots der relevanten Bereiche reichen vollkommen.

---

*Stand: Recherche ohne Joyclub-Login; Instagram-Standards 2024/25.*
