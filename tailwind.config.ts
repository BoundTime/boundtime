import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        card: "#1a1a1a",
        accent: "#7a1f2b",
        "accent-hover": "#8f2432",
        bronze: {
          50: "#fdf6ea",
          100: "#f5e3bf",
          200: "#e9c685",
          300: "#d9a352",
          400: "#c2862e",
          500: "#a06a1d",
          600: "#7d5215",
          700: "#5b3b10",
          800: "#3c2709",
          900: "#1f1305",
        },
        candle: {
          DEFAULT: "#f4b35a",
          warm: "#ff9a3a",
          ember: "#c2541a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      boxShadow: {
        leather:
          "0 24px 60px -36px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.5)",
        candle:
          "0 0 60px -12px rgba(244,179,90,0.35), 0 0 22px -8px rgba(194,84,26,0.25)",
        "candle-soft":
          "0 0 90px -28px rgba(244,179,90,0.25), 0 0 34px -16px rgba(127,31,43,0.35)",
        "bronze-press":
          "0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.55) inset, 0 18px 35px -22px rgba(194,134,46,0.45)",
      },
      transitionTimingFunction: {
        leather: "cubic-bezier(0.22, 1, 0.36, 1)",
        candle: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        "candle-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.08)" },
        },
        "bronze-shimmer": {
          "0%": { transform: "translateX(-110%) skewX(-12deg)" },
          "100%": { transform: "translateX(160%) skewX(-12deg)" },
        },
        "hero-breathe": {
          "0%, 100%": { transform: "scale(1)", filter: "drop-shadow(0 12px 48px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(180,140,60,0.12))" },
          "50%": { transform: "scale(1.015)", filter: "drop-shadow(0 16px 56px rgba(0,0,0,0.6)) drop-shadow(0 0 56px rgba(194,134,46,0.18))" },
        },
        "scroll-hint": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.55" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
      },
      animation: {
        "candle-pulse": "candle-pulse 6.5s ease-in-out infinite",
        "candle-pulse-slow": "candle-pulse 9s ease-in-out infinite",
        "bronze-shimmer": "bronze-shimmer 1.6s ease-out",
        "hero-breathe": "hero-breathe 7s ease-in-out infinite",
        "scroll-hint": "scroll-hint 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
