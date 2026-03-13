 "use client";

import { useState } from "react";

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
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        // Neutrale Meldung, kein Account-Leak nach außen.
        setMessage(
          "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt."
        );
        return;
      }
      setMessage(
        "Wenn ein Konto mit dieser E-Mail existiert und noch nicht bestätigt ist, haben wir dir die E-Mail erneut geschickt."
      );
    } catch (e) {
      console.error(e);
      // Neutrale Fehlermeldung, ohne technische Details anzuzeigen.
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

