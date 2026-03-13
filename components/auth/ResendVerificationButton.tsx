"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const RESEND_MSG =
  "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt. Prüfe Posteingang und Spam-Ordner.";

interface ResendVerificationButtonProps {
  email: string | null;
}

export function ResendVerificationButton({ email }: ResendVerificationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    return null;
  }

  async function handleClick() {
    const e = email;
    if (!e) return;
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: e,
      });
      if (resendError) {
        if (resendError.message?.toLowerCase().includes("rate") || resendError.status === 429) {
          setMessage("Zu viele Anfragen. Bitte warte etwa 1 Minute und versuche es erneut.");
          return;
        }
        if (resendError.message?.toLowerCase().includes("already") || resendError.message?.toLowerCase().includes("confirmed")) {
          setMessage("Dieses Konto ist bereits bestätigt. Du kannst dich anmelden.");
          return;
        }
      }
      setMessage(RESEND_MSG);
    } catch (e) {
      console.error(e);
      setError("Die Anfrage konnte nicht verarbeitet werden. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Bitte warten …" : "Bestätigungs-E-Mail erneut senden"}
      </button>
      {message && (
        <p className="text-xs text-gray-400">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

