"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAgeFromDateOfBirth, getGenderSymbol } from "@/lib/profile-utils";
import {
  BODY_TYPES,
  LOOKING_FOR_GENDER_OPTIONS,
  LOOKING_FOR_OPTIONS,
  PREFERENCES_OPTIONS,
  MAX_TEXT_LENGTH,
} from "@/types";
import { PlzOrtAutocomplete } from "@/components/PlzOrtAutocomplete";
import Link from "next/link";
import { resolveProfileAvatarUrl } from "@/lib/avatar-utils";
export function ProfileEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [lookingForGender, setLookingForGender] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [expectationsText, setExpectationsText] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [preferencesFilter, setPreferencesFilter] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      supabase
        .from("profiles")
        .select(
          "height_cm, weight_kg, body_type, date_of_birth, gender, postal_code, city, looking_for_gender, looking_for, preferences, expectations_text, about_me, avatar_url, avatar_photo_id, experience_level"
        )
        .eq("id", user.id)
        .single()
        .then(async ({ data, error: loadError }) => {
          if (loadError && loadError.message?.includes("preferences")) {
            const { data: fallbackData } = await supabase
              .from("profiles")
              .select(
                "height_cm, weight_kg, body_type, date_of_birth, gender, postal_code, city, looking_for_gender, looking_for, expectations_text, about_me, avatar_url, avatar_photo_id, experience_level"
              )
              .eq("id", user.id)
              .single();
            if (fallbackData) {
              setHeightCm(fallbackData.height_cm != null ? String(fallbackData.height_cm) : "");
              setWeightKg(fallbackData.weight_kg != null ? String(fallbackData.weight_kg) : "");
              setBodyType(fallbackData.body_type ?? "");
              setDateOfBirth(fallbackData.date_of_birth ?? null);
              setGender(fallbackData.gender ?? null);
              setPostalCode(fallbackData.postal_code ?? "");
              setCity(fallbackData.city ?? "");
              setLookingForGender(fallbackData.looking_for_gender ?? "");
              setLookingFor(Array.isArray(fallbackData.looking_for) ? fallbackData.looking_for : []);
              setExpectationsText(fallbackData.expectations_text ?? "");
              setAboutMe(fallbackData.about_me ?? "");
              setExperienceLevel(fallbackData.experience_level ?? "");
              const url = await resolveProfileAvatarUrl(
                { avatar_url: fallbackData.avatar_url, avatar_photo_id: fallbackData.avatar_photo_id },
                supabase
              );
              setCurrentAvatarUrl(url);
            }
          } else if (data) {
            setHeightCm(data.height_cm != null ? String(data.height_cm) : "");
            setWeightKg(data.weight_kg != null ? String(data.weight_kg) : "");
            setBodyType(data.body_type ?? "");
            setDateOfBirth(data.date_of_birth ?? null);
            setGender(data.gender ?? null);
            setPostalCode(data.postal_code ?? "");
            setCity(data.city ?? "");
            setLookingForGender(data.looking_for_gender ?? "");
            setLookingFor(Array.isArray(data.looking_for) ? data.looking_for : []);
            setPreferences(Array.isArray(data.preferences) ? data.preferences : []);
            setExpectationsText(data.expectations_text ?? "");
            setAboutMe(data.about_me ?? "");
            setExperienceLevel(data.experience_level ?? "");
            const url = await resolveProfileAvatarUrl(
              { avatar_url: data.avatar_url, avatar_photo_id: data.avatar_photo_id },
              supabase
            );
            setCurrentAvatarUrl(url);
          }
          setLoading(false);
        });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const updates: Record<string, unknown> = {
        height_cm: heightCm ? parseInt(heightCm, 10) : null,
        weight_kg: weightKg ? parseInt(weightKg, 10) : null,
        body_type: bodyType || null,
        postal_code: postalCode.trim().replace(/\D/g, "").slice(0, 5) || null,
        city: city.trim().slice(0, 200) || null,
        looking_for_gender: lookingForGender || null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
        expectations_text: expectationsText.trim().slice(0, MAX_TEXT_LENGTH) || null,
        about_me: aboutMe.trim().slice(0, MAX_TEXT_LENGTH) || null,
        experience_level: experienceLevel && ["beginner", "experienced", "advanced"].includes(experienceLevel) ? experienceLevel : null,
      };
      if (preferences.length > 0) updates.preferences = preferences;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (!updateError) {
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("verified, avatar_url, avatar_photo_id, postal_code, city, height_cm, weight_kg, body_type, date_of_birth, age_range, looking_for_gender, looking_for, expectations_text, about_me")
          .eq("id", userId)
          .single();
      }

      if (updateError) {
        const msg = updateError.message;
        if (msg?.includes("preferences") || msg?.includes("column")) {
          const { preferences: _p, ...updatesWithoutPrefs } = updates as Record<string, unknown> & { preferences?: string[] };
          const { error: retryError } = await supabase
            .from("profiles")
            .update(updatesWithoutPrefs)
            .eq("id", userId);
          if (!retryError) {
            setSuccessMessage("Gespeichert. Hinweis: Vorlieben konnten nicht gespeichert werden (Migration 011 ausführen).");
            router.refresh();
            setTimeout(() => setSuccessMessage(null), 5000);
            return;
          }
        }
        throw updateError;
      }
      setSuccessMessage("Ihre Angaben wurden gespeichert.");
      router.refresh();
      const { data: profileData } = await supabase.from("profiles").select("avatar_url, avatar_photo_id").eq("id", userId).single();
      if (profileData) {
        const url = await resolveProfileAvatarUrl(profileData, supabase);
        setCurrentAvatarUrl(url);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-gray-400">Profil wird geladen …</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-400">
        Alle Angaben sind freiwillig. Du kannst Felder leer lassen und jederzeit
        anpassen.
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400 border border-green-500/20" role="status">
          {successMessage}
        </p>
      )}

      {/* Alter + Geschlecht (nur Anzeige, nicht änderbar) */}
      {(getAgeFromDateOfBirth(dateOfBirth) != null || getGenderSymbol(gender)) && (
        <p className="text-sm text-gray-500">
          {getAgeFromDateOfBirth(dateOfBirth) != null && (
            <span>{getAgeFromDateOfBirth(dateOfBirth)} Jahre</span>
          )}
          {getAgeFromDateOfBirth(dateOfBirth) != null && getGenderSymbol(gender) && " · "}
          {getGenderSymbol(gender) && (
            <span title={gender ?? undefined}>{getGenderSymbol(gender)}</span>
          )}
        </p>
      )}

      {/* Körper */}
      <fieldset className="space-y-4 rounded-xl border border-gray-700 p-4">
        <legend className="text-lg font-semibold text-white">Körper</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height_cm" className="mb-1 block text-sm text-gray-300">
              Größe (cm)
            </label>
            <input
              id="height_cm"
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="weight_kg" className="mb-1 block text-sm text-gray-300">
              Gewicht (kg)
            </label>
            <input
              id="weight_kg"
              type="number"
              min={30}
              max={300}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="body_type" className="mb-1 block text-sm text-gray-300">
            Figur
          </label>
          <select
            id="body_type"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
          >
            <option value="">— Keine Angabe —</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="experience_level" className="mb-1 block text-sm text-gray-300">
            Erfahrungslevel <span className="text-gray-500">(optional)</span>
          </label>
          <select
            id="experience_level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
          >
            <option value="">— Keine Angabe —</option>
            <option value="beginner">Einsteiger:in</option>
            <option value="experienced">Erfahren</option>
            <option value="advanced">Sehr erfahren</option>
          </select>
        </div>
      </fieldset>


      {/* Standort: PLZ/Ort nur aus Datenbasis (Autocomplete) */}
      <fieldset className="space-y-4 rounded-xl border border-gray-700 p-4">
        <legend className="text-lg font-semibold text-white">Ort</legend>
        <p className="text-xs text-gray-500">
          PLZ oder Ort eingeben – nur gültige Einträge aus unserer Datenbasis sind wählbar. Andere können Stadt und PLZ sehen (für Suche „in der Nähe“).
        </p>
        <div>
          <label htmlFor="plz_ort" className="mb-1 block text-sm text-gray-300">
            Postleitzahl oder Ort
          </label>
          <PlzOrtAutocomplete
            id="plz_ort"
            postalCode={postalCode}
            city={city}
            onSelect={(plz, ort) => {
              setPostalCode(plz);
              setCity(ort);
            }}
            placeholder="z. B. 10115 oder Berlin"
          />
        </div>
      </fieldset>

      {/* Suche */}
      <fieldset className="space-y-4 rounded-xl border border-gray-700 p-4">
        <legend className="text-lg font-semibold text-white">Suche</legend>
        <div>
          <label htmlFor="looking_for_gender" className="mb-1 block text-sm text-gray-300">
            Wen suchst du?
          </label>
          <select
            id="looking_for_gender"
            value={lookingForGender}
            onChange={(e) => setLookingForGender(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
          >
            <option value="">— Keine Angabe —</option>
            {LOOKING_FOR_GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-2 block text-sm text-gray-300">
            Was suchst du? (Mehrfachauswahl)
          </span>
          <div className="flex flex-wrap gap-3">
            {LOOKING_FOR_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
              >
                <input
                  type="checkbox"
                  checked={lookingFor.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLookingFor((prev) => [...prev, option]);
                    } else {
                      setLookingFor((prev) => prev.filter((x) => x !== option));
                    }
                  }}
                  className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm text-gray-300">
            Vorlieben (worauf stehst du? Mehrfachauswahl)
          </span>
          <input
            type="search"
            placeholder="Vorlieben filtern …"
            value={preferencesFilter}
            onChange={(e) => setPreferencesFilter(e.target.value)}
            className="mb-2 w-full rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-white placeholder-gray-500"
          />
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
            <div className="flex flex-wrap gap-2">
              {PREFERENCES_OPTIONS.filter(
                (option) =>
                  !preferencesFilter.trim() ||
                  option.toLowerCase().includes(preferencesFilter.trim().toLowerCase())
              ).map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-600 bg-background px-3 py-2 text-sm text-gray-300 hover:border-gray-500"
                >
                  <input
                    type="checkbox"
                    checked={preferences.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences((prev) => [...prev, option]);
                      } else {
                        setPreferences((prev) => prev.filter((x) => x !== option));
                      }
                    }}
                    className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                  />
                  {option}
                </label>
              ))}
            </div>
            {PREFERENCES_OPTIONS.filter(
              (o) =>
                !preferencesFilter.trim() ||
                o.toLowerCase().includes(preferencesFilter.trim().toLowerCase())
            ).length === 0 && (
              <p className="py-2 text-center text-sm text-gray-500">Keine Treffer</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Was erwartest du von deinem Gesuchten? */}
      <div>
        <label htmlFor="expectations_text" className="mb-1 block text-sm font-medium text-gray-300">
          Was erwartest du von deinem Gesuchten?
        </label>
        <textarea
          id="expectations_text"
          value={expectationsText}
          onChange={(e) => setExpectationsText(e.target.value)}
          maxLength={MAX_TEXT_LENGTH}
          rows={3}
          placeholder="z. B. Ein Dom beschreibt, wofür der Sub zur Verfügung stehen soll …"
          className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white"
        />
        <p className="mt-1 text-xs text-gray-500">
          {expectationsText.length}/{MAX_TEXT_LENGTH} Zeichen
        </p>
      </div>

      {/* Über mich */}
      <div>
        <label htmlFor="about_me" className="mb-1 block text-sm font-medium text-gray-300">
          Über mich
        </label>
        <textarea
          id="about_me"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          maxLength={MAX_TEXT_LENGTH}
          rows={4}
          placeholder="Was andere über dich wissen dürfen …"
          className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white"
        />
        <p className="mt-1 text-xs text-gray-500">
          {aboutMe.length}/{MAX_TEXT_LENGTH} Zeichen
        </p>
      </div>

      {/* Profilbild */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Profilbild
        </label>
        {currentAvatarUrl && (
          <div className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-card">
            <img src={currentAvatarUrl} alt="Profilbild" className="h-full w-full object-cover" />
          </div>
        )}
        <p className="text-sm text-gray-400">
          Profilbild im{" "}
          <Link href="/dashboard/alben" className="text-accent underline hover:text-accent-hover">
            Hauptalbum
          </Link>{" "}
          festlegen. Wähle dort ein Foto aus und klicke auf „Als Profilbild“.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {saving ? "Wird gespeichert …" : "Profil speichern"}
      </button>
    </form>
  );
}
