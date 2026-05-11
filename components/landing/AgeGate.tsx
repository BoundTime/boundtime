"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_NAME = "bt_age_verified";
const COOKIE_DAYS = 365;

function setAgeVerifiedCookie() {
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);
  document.cookie = `${COOKIE_NAME}=1; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function hasAgeVerifiedCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

export function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasAgeVerifiedCookie()) {
      setVisible(true);
    }
  }, []);

  function handleConfirm() {
    setAgeVerifiedCookie();
    setVisible(false);
  }

  function handleDecline() {
    window.location.href = "https://www.google.de";
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(10, 8, 16, 0.96)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-sm rounded-2xl p-8 text-center"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold tracking-widest"
              style={{ background: "linear-gradient(135deg,#C8A951,#8A6D2E)", color: "#0A0810" }}
            >
              BT
            </div>

            <h2
              className="mb-2 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Altersverifikation
            </h2>
            <p className="mb-7 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              BoundTime ist ausschließlich für Personen ab&nbsp;18&nbsp;Jahren.
              Bitte bestätige dein Alter, um fortzufahren.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className="w-full rounded-full py-3 text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
              >
                Ich bin 18 oder älter – Weiter
              </button>
              <button
                onClick={handleDecline}
                className="w-full rounded-full border py-3 text-sm transition-all hover:bg-white/5"
                style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
              >
                Ich bin unter 18 – Verlassen
              </button>
            </div>

            <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Mit dem Klick auf „Weiter" stimmst du unseren{" "}
              <a href="/agb" className="underline underline-offset-2 hover:text-[var(--text-gold)]">
                AGB
              </a>{" "}
              und der{" "}
              <a href="/datenschutz" className="underline underline-offset-2 hover:text-[var(--text-gold)]">
                Datenschutzerklärung
              </a>{" "}
              zu.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
