"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Star, AlertCircle } from "lucide-react";

type Rating = {
  id: string;
  rater_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type Props = {
  bullId: string;
  ratings: Rating[];
  myRating: Rating | null;
  /** Darf die Bewertungs-Sektion sehen (Paar, Frau oder eigener Bull) */
  canSeeSection: boolean;
  /** Darf bewerten = (Paar oder Frau) und verifiziert */
  canRate: boolean;
  /** Viewer ist verifiziert – sonst Bewertungen verpixelt anzeigen */
  viewerVerified: boolean;
  isOwnProfile: boolean;
  raterNickById: Record<string, string | null>;
};

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function BullRatingsSection({
  bullId,
  ratings,
  myRating,
  canSeeSection,
  canRate,
  viewerVerified,
  isOwnProfile,
  raterNickById,
}: Props) {
  const [stars, setStars] = useState(myRating?.rating ?? 0);
  const [comment, setComment] = useState(myRating?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(!!myRating);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("bull_ratings").upsert(
      {
        bull_id: bullId,
        rater_id: (await supabase.auth.getUser()).data.user?.id,
        rating: stars,
        comment: comment.trim() || null,
      },
      { onConflict: "bull_id,rater_id" }
    );
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSubmitted(true);
    window.location.reload();
  }

  if (!canSeeSection) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-card p-4">
      <h3 className="text-lg font-semibold text-white">
        {isOwnProfile ? "Bewertungen über dich" : "Bewertungen"}
      </h3>

      {!canRate && canSeeSection && !isOwnProfile && (
        <p className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm text-amber-200">
          Nur verifizierte Mitglieder können bewerten.{" "}
          <Link href="/dashboard/verifizierung" className="font-medium underline hover:text-amber-100">
            Jetzt verifizieren
          </Link>
        </p>
      )}

      {canRate && !submitted && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Sterne (1–5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  className="rounded p-1 text-2xl text-gray-500 transition hover:text-amber-400"
                >
                  <Star
                    className={n <= stars ? "fill-amber-400 text-amber-400" : ""}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Kommentar (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || stars < 1}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "…" : "Bewertung abgeben"}
          </button>
        </form>
      )}

      {ratings.length === 0 && (submitted || !canRate) && (
        <p className="mt-2 text-sm text-gray-500">
          {isOwnProfile ? "Noch keine Bewertungen." : "Noch keine Bewertungen für diesen Bull."}
        </p>
      )}

      {ratings.length > 0 && (
        <div className="mt-4 relative">
          {!viewerVerified && !isOwnProfile && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-gray-900/80 backdrop-blur-sm">
              <p className="px-4 text-center text-sm text-white">
                Verifiziere dich, um Bewertungen lesen zu können.
              </p>
              <Link
                href="/dashboard/verifizierung"
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Zur Verifizierung
              </Link>
            </div>
          )}
          <ul className={`space-y-3 ${!viewerVerified && !isOwnProfile ? "select-none blur-md pointer-events-none" : ""}`}>
            {ratings.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-700 bg-background/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">
                    {isOwnProfile ? raterNickById[r.rater_id] ?? "?" : "***"}
                  </span>
                  <span className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= r.rating ? "fill-amber-400" : "opacity-30"}`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-gray-300">{r.comment}</p>}
                <p className="mt-1 text-xs text-gray-500">{formatDate(r.created_at)}</p>
                {isOwnProfile && (
                  <BeanstandenButton ratingId={r.id} bullId={bullId} />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BeanstandenButton({ ratingId, bullId }: { ratingId: string; bullId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!reason.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("bull_rating_disputes").insert({
      bull_rating_id: ratingId,
      bull_id: bullId,
      reason_text: reason.trim(),
    });
    setLoading(false);
    setOpen(false);
    setReason("");
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Beanstanden
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-gray-600 bg-gray-800/50 p-3">
          <label className="mb-1 block text-xs text-gray-400">Begründung (wird an Admins gesendet)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full rounded border border-gray-600 bg-background px-2 py-1 text-sm text-white"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={loading || !reason.trim()}
              className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500 disabled:opacity-50"
            >
              Absenden
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setReason(""); }}
              className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-400"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
