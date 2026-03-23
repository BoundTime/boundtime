# Design-QA: Öffentliche Oberfläche (Pre-Login)

Checkliste für **Browser- und Mobile-Tests** nach Änderungen an Landing, Features, Regeln, Auth, Footer, Cookie-Banner.

## Breakpoints
- [x] **320–390 px**: Kein horizontaler Scroll; Logo/Hero nicht abgeschnitten; CTAs min. 44 px Tap-Höhe. *(Code: `body` `overflow-x-hidden`, Hero `sizes`/`max-w`/Aspect; CTAs `min-h-[48px]` / `min-h-[44px]`; Kurztest auf 320 px empfohlen.)*
- [x] **768 px**: Zweispaltige Bereiche (Features) brechen sauber um. *(Grid `lg:grid-cols-*` / `sm:grid-cols-2` in boundtime-features.)*
- [x] **1024+ px**: Max-Breiten (`max-w-3xl` / Container) wirken nicht „schwebend leer“. *(Container `max-w-6xl`, Landing `max-w-3xl`.)*

## Lesbarkeit & Kontrast
- [x] Fließtext **gray-300/400** auf dunklem Grund gut lesbar (kein zu schwaches Grau auf Gradienten).
- [x] Links (Amber) erkennbar; **Focus-Ring** sichtbar bei Tab-Navigation. *(Footer-Links ergänzt; Cookie/öffentliche CTAs hatten bereits `focus-visible:ring`.)*

## Tap-Ziele & Überlagerungen
- [x] Cookie-Banner **überdeckt** keine primären CTAs dauerhaft unbenutzbar: Banner scrollbar/kompakt auf kleinen Höhen; **Safe Area** unten (Home-Indikator). *(Spacer im Flow, `max-h`+Scroll, `pb` mit `env(safe-area-inset-bottom)`; Mobile: Aktionen oben via `flex-col-reverse`.)*
- [x] Keine **z-index-Kollision** zwischen Banner (`z-[100]`), Navbar und Dialogen. *(Mobile-Nav-Portal `z-[110]`, liegt über Cookie.)*

## CLS & LCP
- [x] Logo/Hero-Bilder mit **festen Aspect-Ratios** oder `sizes`/`priority` wo sinnvoll; kein starkes Layout-Springen beim Laden. *(Landing-Hero `priority`, `sizes`, Aspect-Container.)*

## Motion
- [x] **`prefers-reduced-motion: reduce`**: Keine störenden Hover-Scale-Animationen auf kritischen Pfaden (oder reduziert). *(Landing-CTAs `motion-reduce:transform-none`; Step-Cards boundtime-features; Nav-Badge in `globals.css`.)*
- [x] Keine automatischen, ablenkenden Animationen im Hero.

## Konsistenz Public-Pages
- [x] Landing, `/boundtime-features`, `/community-regeln` nutzen **gleiche Section-Eyebrow/Titel-Linie** (`PublicSectionHeading` wo vorgesehen).
- [x] „Weiterlesen“-PFade: Links zu Features/Regeln von der Startseite **erkennbar** und konsistent benannt.

## Cookie-Banner (UX)
- [x] Text auf Mobile **kompakter** (`text-xs`), Bereich **begrenzte Höhe + Scroll**; Aktionen **oben** auf schmalen Viewports.
- [x] **„Verstanden“** klar als Primäraktion (Button-Stil Amber/Accent).

---

## Testprotokoll (Code-Review, März 2026)

| Maßnahme | Kurz |
|----------|------|
| Navbar Mobile-Menü | `z-[110]` statt `z-[100]`, damit Cookie-Banner (`z-[100]`) das Vollbildmenü nicht überdeckt. |
| Footer | `pb-[max(2.25rem,env(safe-area-inset-bottom))]`; `focus-visible`-Ringe; `motion-reduce` bei Hover-Transition. |
| Cookie-Banner | `flex-col-reverse` (sm: row), kleinere Schrift xs→sm, `max-h-[min(40vh,16rem)]` + Scroll. |

**Hinweis:** Checkboxen basieren auf **Code-Audit**; abschließender **Smoke-Test auf echtem iPhone/Android** (Safe Area, Scroll zum Footer, Tab-Fokus) weiterhin empfohlen.

---

*Rechtliche/SEO-Finalisierung: Assist/Testprompt.*
