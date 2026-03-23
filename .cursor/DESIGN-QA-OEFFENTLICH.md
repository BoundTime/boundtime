# Design-QA: Öffentliche Oberfläche (Pre-Login)

Checkliste für **Browser- und Mobile-Tests** nach Änderungen an Landing, Features, Regeln, Auth, Footer, Cookie-Banner.

## Breakpoints
- [ ] **320–390 px**: Kein horizontaler Scroll; Logo/Hero nicht abgeschnitten; CTAs min. 44 px Tap-Höhe.
- [ ] **768 px**: Zweispaltige Bereiche (Features) brechen sauber um.
- [ ] **1024+ px**: Max-Breiten (`max-w-3xl` / Container) wirken nicht „schwebend leer“.

## Lesbarkeit & Kontrast
- [ ] Fließtext **gray-300/400** auf dunklem Grund gut lesbar (kein zu schwaches Grau auf Gradienten).
- [ ] Links (Amber) erkennbar; **Focus-Ring** sichtbar bei Tab-Navigation.

## Tap-Ziele & Überlagerungen
- [ ] Cookie-Banner **überdeckt** keine primären CTAs dauerhaft unbenutzbar: Banner scrollbar/kompakt auf kleinen Höhen; **Safe Area** unten (Home-Indikator).
- [ ] Keine **z-index-Kollision** zwischen Banner (`z-[100]`), Navbar und Dialogen.

## CLS & LCP
- [ ] Logo/Hero-Bilder mit **festen Aspect-Ratios** oder `sizes`/`priority` wo sinnvoll; kein starkes Layout-Springen beim Laden.

## Motion
- [ ] **`prefers-reduced-motion: reduce`**: Keine störenden Hover-Scale-Animationen auf kritischen Pfaden (oder reduziert).
- [ ] Keine automatischen, ablenkenden Animationen im Hero.

## Konsistenz Public-Pages
- [ ] Landing, `/boundtime-features`, `/community-regeln` nutzen **gleiche Section-Eyebrow/Titel-Linie** (PublicSectionHeading).
- [ ] „Weiterlesen“-PFade: Links zu Features/Regeln von der Startseite **erkennbar** und konsistent benannt.

## Cookie-Banner (UX)
- [ ] Text in **max. 2–3 Zeilen** auf Mobile sichtbar; Rest scrollbar oder „Mehr in Datenschutz“.
- [ ] **Akzeptieren** klar als Primäraktion erkennbar.

---

*Erstellt im Rahmen Designerprompt (Testkontext). Rechtliche/SEO-Finalisierung separat (Assist/Testprompt).*
