"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "bt_restriction_unlocked";

type RestrictionContextValue = {
  isRestricted: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  requestUnlock: (onSuccess?: () => void) => void;
  lock: () => void;
  canWrite: boolean;
};

const RestrictionContext = createContext<RestrictionContextValue | null>(null);

export function RestrictionProvider({ children }: { children: React.ReactNode }) {
  const [isRestricted, setIsRestricted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [onUnlockSuccess, setOnUnlockSuccess] = useState<(() => void) | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsRestricted(false);
        setIsUnlocked(false);
        setIsLoading(false);
        return;
      }
      const { data } = await supabase.rpc("is_restriction_blocking_write", { p_user_id: user.id });
      const restricted = data === true;
      setIsRestricted(restricted);
      if (restricted && typeof sessionStorage !== "undefined") {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        setIsUnlocked(stored === user.id);
      } else {
        setIsUnlocked(!restricted);
      }
      setIsLoading(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
        setIsUnlocked(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const requestUnlock = useCallback((onSuccess?: () => void) => {
    setOnUnlockSuccess(() => onSuccess ?? undefined);
    setModalOpen(true);
    setPassword("");
    setError(null);
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnlockLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Nicht angemeldet.");
      setUnlockLoading(false);
      return;
    }
    const { data } = await supabase.rpc("check_restriction_password", {
      p_user_id: user.id,
      p_password: password,
    });
    if (data === true) {
      sessionStorage.setItem(STORAGE_KEY, user.id);
      setIsUnlocked(true);
      setModalOpen(false);
      onUnlockSuccess?.();
    } else {
      setError("Passwort falsch.");
    }
    setUnlockLoading(false);
  };

  const canWrite = !isRestricted || isUnlocked;

  const value: RestrictionContextValue = {
    isRestricted,
    isUnlocked,
    isLoading,
    requestUnlock,
    lock,
    canWrite,
  };

  return (
    <RestrictionContext.Provider value={value}>
      {children}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restriction-modal-title"
        >
          <form
            onSubmit={handleUnlock}
            className="w-full max-w-md rounded-xl border border-gray-700 bg-card p-6 shadow-xl"
          >
            <h2 id="restriction-modal-title" className="text-lg font-semibold text-white">
              Zugriff freischalten
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Gib das Restriction-Passwort ein, um Schreiben zu ermöglichen.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="Passwort"
              className="mt-4 w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setModalOpen(false); setOnUnlockSuccess(null); }}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={unlockLoading || !password.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {unlockLoading ? "…" : "Freischalten"}
              </button>
            </div>
          </form>
        </div>
      )}
    </RestrictionContext.Provider>
  );
}

export function useRestriction() {
  const ctx = useContext(RestrictionContext);
  return ctx ?? {
    isRestricted: false,
    isUnlocked: true,
    isLoading: false,
    requestUnlock: () => {},
    lock: () => {},
    canWrite: true,
  };
}
