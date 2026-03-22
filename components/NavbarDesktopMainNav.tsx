"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { RefreshNavLink } from "@/components/RefreshNavLink";

export type MainNavItem = {
  id: string;
  href: string;
  label: string;
  isActive: boolean;
};

/** Entspricht ungefähr `gap-6` (24px) zwischen den Textlinks */
const GAP_PX = 24;
const MIN_VISIBLE = 2;

type Props = {
  items: MainNavItem[];
  navFocus: string;
};

/**
 * Untere Navbar-Zeile: Text-Links, aktiver Zustand per Unterstrich (Amber).
 * Kein horizontales Scrollen – bei Platzmangel „Mehr ▾“-Dropdown.
 */
export function NavbarDesktopMainNav({ items, navFocus }: Props) {
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [mehrOpen, setMehrOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const mehrBtnRef = useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const textInactive = "text-gray-400 transition-colors duration-150 hover:text-white";
  const textActive =
    "font-bold text-white after:pointer-events-none after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-amber-400/95 after:shadow-[0_0_14px_rgba(251,191,36,0.38)] after:content-['']";

  const itemKey = items.map((i) => `${i.id}:${i.href}`).join("|");

  useLayoutEffect(() => {
    if (items.length === 0) return;
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const run = () => {
      const itemSpans = Array.from(measure.querySelectorAll("[data-nav-measure]")) as HTMLElement[];
      const mehrProbe = measure.querySelector("[data-mehr-measure]") as HTMLElement | null;
      if (itemSpans.length === 0) return;

      const widths = itemSpans.map((el) => el.offsetWidth);
      const mehrW = (mehrProbe?.offsetWidth ?? 0) + GAP_PX;
      const fullW = container.clientWidth;

      const totalAll = widths.reduce((acc, w, i) => acc + w + (i > 0 ? GAP_PX : 0), 0);
      if (totalAll <= fullW) {
        setVisibleCount(items.length);
        return;
      }

      let avail = fullW - mehrW;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const w = widths[i];
        const g = count > 0 ? GAP_PX : 0;
        if (sum + g + w <= avail) {
          sum += g + w;
          count++;
        } else {
          break;
        }
      }

      const minV = Math.min(MIN_VISIBLE, Math.max(1, items.length));
      if (count >= items.length) {
        setVisibleCount(items.length);
        return;
      }
      if (items.length <= 1) {
        setVisibleCount(items.length);
        return;
      }
      setVisibleCount(Math.max(minV, Math.min(count, items.length - 1)));
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(run));
    ro.observe(container);
    requestAnimationFrame(run);
    return () => ro.disconnect();
  }, [items.length, itemKey]);

  useEffect(() => {
    setVisibleCount((c) => Math.min(c, items.length));
  }, [items.length]);

  useEffect(() => {
    setMehrOpen(false);
  }, [itemKey]);

  useEffect(() => {
    if (!mehrOpen || !mehrBtnRef.current) return;
    function position() {
      const rect = mehrBtnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelW = 220;
      const left = Math.min(Math.max(8, rect.right - panelW), window.innerWidth - panelW - 8);
      setPanelPos({ top: rect.bottom + 6, left });
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [mehrOpen]);

  useEffect(() => {
    if (!mehrOpen) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (mehrBtnRef.current?.contains(t)) return;
      const panel = document.getElementById("navbar-mehr-panel");
      if (panel?.contains(t)) return;
      setMehrOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [mehrOpen]);

  useEffect(() => {
    if (!mehrOpen) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMehrOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [mehrOpen]);

  if (items.length === 0) return null;

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);
  const showMehr = overflow.length > 0;

  return (
    <div className="flex w-full min-w-0 items-center pt-2.5">
      {/* Symmetrisch: freie Fläche links/rechts, Links mittig; „Mehr“ rechts */}
      <div className="min-h-9 min-w-0 flex-1" aria-hidden />
      <div
        ref={containerRef}
        className="relative flex min-w-0 max-w-[min(100%,42rem)] flex-nowrap items-center justify-center gap-6 overflow-hidden sm:gap-8"
      >
        <div
          ref={measureRef}
          aria-hidden
          className="pointer-events-none absolute bottom-full left-0 right-0 flex justify-center gap-6 whitespace-nowrap opacity-0 sm:gap-8"
        >
          {items.map((item) => (
            <span key={item.id} data-nav-measure className="inline-block">
              <span className={`px-2 py-2 text-sm ${item.isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </span>
          ))}
          <span data-mehr-measure className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium">
            Mehr
            <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </span>
        </div>
        {visible.map((item) => (
          <RefreshNavLink
            key={item.id}
            href={item.href}
            className={`relative shrink-0 px-2 py-2 text-sm font-medium transition-colors ${navFocus} ${
              item.isActive ? textActive : textInactive
            }`}
          >
            {item.label}
          </RefreshNavLink>
        ))}
      </div>
      <div className="flex min-h-9 min-w-0 flex-1 items-center justify-end">
        {showMehr && (
        <div className="relative shrink-0">
          <button
            ref={mehrBtnRef}
            type="button"
            onClick={() => setMehrOpen((o) => !o)}
            aria-expanded={mehrOpen}
            className={`inline-flex items-center gap-1 rounded-lg border border-white/[0.14] bg-white/[0.03] px-3 py-2 text-sm font-medium text-gray-300 transition-[transform,border-color,background-color,color] duration-150 ease-out hover:-translate-y-px hover:border-amber-500/35 hover:bg-white/[0.07] hover:text-white motion-reduce:hover:translate-y-0 ${navFocus}`}
          >
            Mehr
            <ChevronDown className={`h-4 w-4 transition-transform ${mehrOpen ? "rotate-180" : ""}`} strokeWidth={1.5} aria-hidden />
          </button>

          {mehrOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                id="navbar-mehr-panel"
                className="fixed z-[170] w-56 overflow-hidden rounded-xl border border-white/12 bg-[#1a1a1a] py-1 shadow-xl shadow-black/50"
                style={{ top: panelPos.top, left: panelPos.left }}
              >
                {overflow.map((item) => (
                  <RefreshNavLink
                    key={item.id}
                    href={item.href}
                    onClick={() => setMehrOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${navFocus} ${
                      item.isActive
                        ? "border-l-2 border-amber-400/80 bg-amber-950/30 font-semibold text-amber-50"
                        : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </RefreshNavLink>
                ))}
              </div>,
              document.body
            )}
        </div>
      )}
      </div>
    </div>
  );
}
