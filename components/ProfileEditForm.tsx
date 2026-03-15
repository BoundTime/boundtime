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
  const [lookingForGenders, setLookingForGenders] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [expectationsText, setExpectationsText] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [preferencesFilter, setPreferencesFilter] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [coupleType, setCoupleType] = useState<string | null>(null);
  const [coupleFirstIs, setCoupleFirstIs] = useState<string | null>(null);
  const [partnerDateOfBirth, setPartnerDateOfBirth] = useState<string | null>(null);
  const [partnerHeightCm, setPartnerHeightCm] = useState("");
  const [partnerWeightKg, setPartnerWeightKg] = useState("");
  const [partnerBodyType, setPartnerBodyType] = useState("");
  const [partnerAboutMe, setPartnerAboutMe] = useState("");
  const [partnerPreferences, setPartnerPreferences] = useState<string[]>([]);
  const [partnerExperienceLevel, setPartnerExperienceLevel] = useState("");
  const [coupleFirstTendency, setCoupleFirstTendency] = useState<string>("");
  const [couplePartnerTendency, setCouplePartnerTendency] = useState<string>("");

  const isCouple = accountType === "couple";
  const isCoupleWomanMan = isCouple && coupleType === "man_woman";
  const womanFirst = coupleFirstIs === "woman";

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
          "height_cm, weight_kg, body_type, date_of_birth, gender, postal_code, city, looking_for_gender, looking_for_genders, looking_for, preferences, expectations_text, about_me, avatar_url, avatar_photo_id, experience_level, role, account_type, couple_type, couple_first_is, partner_date_of_birth, partner_height_cm, partner_weight_kg, partner_body_type, partner_about_me, partner_preferences, partner_experience_level, couple_first_tendency, couple_partner_tendency"
        )
        .eq("id", user.id)
        .single()
        .then(async ({ data, error: loadError }) => {
          if (loadError && loadError.message?.includes("preferences")) {
            const { data: fallbackData } = await supabase
              .from("profiles")
              .select(
                "height_cm, weight_kg, body_type, date_of_birth, gender, postal_code, city, looking_for_gender, looking_for_genders, looking_for, expectations_text, about_me, avatar_url, avatar_photo_id, experience_level, role, account_type, couple_type, couple_first_is, partner_date_of_birth, partner_height_cm, partner_weight_kg, partner_body_type, partner_about_me, couple_first_tendency, couple_partner_tendency"
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
              setLookingForGenders(
                Array.isArray((fallbackData as { looking_for_genders?: string[] }).looking_for_genders)
                  ? (fallbackData as { looking_for_genders: string[] }).looking_for_genders
                  : fallbackData.looking_for_gender === "alle"
                    ? ["Mann", "Frau", "Divers"]
                    : fallbackData.looking_for_gender
                      ? [fallbackData.looking_for_gender]
                      : []
              );
              setLookingFor(Array.isArray(fallbackData.looking_for) ? fallbackData.looking_for : []);
              setExpectationsText(fallbackData.expectations_text ?? "");
              setAboutMe(fallbackData.about_me ?? "");
              setExperienceLevel(fallbackData.experience_level ?? "");
              setRole((fallbackData as { role?: string }).role ?? null);
              const fallback = fallbackData as {
                account_type?: string | null;
                couple_type?: string | null;
                couple_first_is?: string | null;
                partner_date_of_birth?: string | null;
                partner_height_cm?: number | null;
                partner_weight_kg?: number | null;
                partner_body_type?: string | null;
                partner_about_me?: string | null;
                partner_preferences?: string[] | null;
                partner_experience_level?: string | null;
                couple_first_tendency?: string | null;
                couple_partner_tendency?: string | null;
              };
              setAccountType(fallback.account_type ?? null);
              setCoupleType(fallback.couple_type ?? null);
              setCoupleFirstIs(fallback.couple_first_is ?? null);
              setPartnerDateOfBirth(fallback.partner_date_of_birth ?? null);
              setCoupleFirstTendency(fallback.couple_first_tendency ?? "");
              setCouplePartnerTendency(fallback.couple_partner_tendency ?? "");
              setPartnerHeightCm(fallback.partner_height_cm != null ? String(fallback.partner_height_cm) : "");
              setPartnerWeightKg(fallback.partner_weight_kg != null ? String(fallback.partner_weight_kg) : "");
              setPartnerBodyType(fallback.partner_body_type ?? "");
              setPartnerAboutMe(fallback.partner_about_me ?? "");
              setPartnerPreferences(Array.isArray(fallback.partner_preferences) ? fallback.partner_preferences : []);
              setPartnerExperienceLevel(fallback.partner_experience_level ?? "");
              setCoupleFirstTendency((fallback as { couple_first_tendency?: string | null }).couple_first_tendency ?? "");
              setCouplePartnerTendency((fallback as { couple_partner_tendency?: string | null }).couple_partner_tendency ?? "");
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
            setLookingForGenders(
              Array.isArray((data as { looking_for_genders?: string[] }).looking_for_genders)
                ? (data as { looking_for_genders: string[] }).looking_for_genders
                : data.looking_for_gender === "alle"
                  ? ["Mann", "Frau", "Divers"]
                  : data.looking_for_gender
                    ? [data.looking_for_gender]
                    : []
            );
            setLookingFor(Array.isArray(data.looking_for) ? data.looking_for : []);
            setPreferences(Array.isArray(data.preferences) ? data.preferences : []);
            setExpectationsText(data.expectations_text ?? "");
            setAboutMe(data.about_me ?? "");
            setExperienceLevel(data.experience_level ?? "");
            setRole((data as { role?: string }).role ?? null);
            const d = data as {
              account_type?: string | null;
              couple_type?: string | null;
              couple_first_is?: string | null;
              partner_date_of_birth?: string | null;
              partner_height_cm?: number | null;
              partner_weight_kg?: number | null;
              partner_body_type?: string | null;
              partner_about_me?: string | null;
              partner_preferences?: string[] | null;
              partner_experience_level?: string | null;
              couple_first_tendency?: string | null;
              couple_partner_tendency?: string | null;
            };
            setAccountType(d.account_type ?? null);
            setCoupleType(d.couple_type ?? null);
            setCoupleFirstIs(d.couple_first_is ?? null);
            setPartnerDateOfBirth(d.partner_date_of_birth ?? null);
            setCoupleFirstTendency(d.couple_first_tendency ?? "");
            setCouplePartnerTendency(d.couple_partner_tendency ?? "");
            setPartnerHeightCm(d.partner_height_cm != null ? String(d.partner_height_cm) : "");
            setPartnerWeightKg(d.partner_weight_kg != null ? String(d.partner_weight_kg) : "");
            setPartnerBodyType(d.partner_body_type ?? "");
            setPartnerAboutMe(d.partner_about_me ?? "");
            setPartnerPreferences(Array.isArray(d.partner_preferences) ? d.partner_preferences : []);
            setPartnerExperienceLevel(d.partner_experience_level ?? "");
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
      let mainHeight = heightCm ? parseInt(heightCm, 10) : null;
      let mainWeight = weightKg ? parseInt(weightKg, 10) : null;
      let mainBody = bodyType || null;
      let mainAbout = aboutMe.trim().slice(0, MAX_TEXT_LENGTH) || null;
      let partnerHeight = partnerHeightCm ? parseInt(partnerHeightCm, 10) : null;
      let partnerWeight = partnerWeightKg ? parseInt(partnerWeightKg, 10) : null;
      let partnerBody = partnerBodyType || null;
      let partnerAbout = partnerAboutMe.trim().slice(0, MAX_TEXT_LENGTH) || null;
      let mainPrefs = preferences;
      let partnerPrefs = partnerPreferences;
      let mainExp = experienceLevel && ["beginner", "experienced", "advanced"].includes(experienceLevel) ? experienceLevel : null;
      let partnerExp = partnerExperienceLevel && ["beginner", "experienced", "advanced"].includes(partnerExperienceLevel) ? partnerExperienceLevel : null;
      if (isCouple && isCoupleWomanMan && !womanFirst) {
        mainHeight = partnerHeightCm ? parseInt(partnerHeightCm, 10) : null;
        mainWeight = partnerWeightKg ? parseInt(partnerWeightKg, 10) : null;
        mainBody = partnerBodyType || null;
        mainAbout = partnerAboutMe.trim().slice(0, MAX_TEXT_LENGTH) || null;
        partnerHeight = heightCm ? parseInt(heightCm, 10) : null;
        partnerWeight = weightKg ? parseInt(weightKg, 10) : null;
        partnerBody = bodyType || null;
        partnerAbout = aboutMe.trim().slice(0, MAX_TEXT_LENGTH) || null;
        mainPrefs = partnerPreferences;
        partnerPrefs = preferences;
        mainExp = partnerExp;
        partnerExp = experienceLevel && ["beginner", "experienced", "advanced"].includes(experienceLevel) ? experienceLevel : null;
      }

      const updates: Record<string, unknown> = {
        height_cm: mainHeight,
        weight_kg: mainWeight,
        body_type: mainBody,
        postal_code: postalCode.trim().replace(/\D/g, "").slice(0, 5) || null,
        city: city.trim().slice(0, 200) || null,
        looking_for_genders: lookingForGenders.length > 0 ? lookingForGenders : null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
        expectations_text: expectationsText.trim().slice(0, MAX_TEXT_LENGTH) || null,
        about_me: mainAbout,
        experience_level: mainExp,
      };
      if (mainPrefs.length > 0) updates.preferences = mainPrefs;
      if (isCouple) {
        updates.partner_height_cm = partnerHeight;
        updates.partner_weight_kg = partnerWeight;
        updates.partner_body_type = partnerBody;
        updates.partner_about_me = partnerAbout;
        updates.partner_experience_level = partnerExp;
        if (partnerPrefs.length > 0) updates.partner_preferences = partnerPrefs;
        else updates.partner_preferences = null;
        const firstTendency = ["devot", "dominant", "switcher"].includes(coupleFirstTendency) ? coupleFirstTendency : null;
        const partnerTendency = ["devot", "dominant", "switcher"].includes(couplePartnerTendency) ? couplePartnerTendency : null;
        if (isCoupleWomanMan && !womanFirst) {
          updates.couple_first_tendency = partnerTendency;
          updates.couple_partner_tendency = firstTendency;
        } else {
          updates.couple_first_tendency = firstTendency;
          updates.couple_partner_tendency = partnerTendency;
        }
      }

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
      if (updates.postal_code != null || updates.city != null) {
        try {
          await fetch("/api/me/geocode");
        } catch {
          // Geocoding optional, kein Fehler anzeigen
        }
      }
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

      {/* Rolle (nur Anzeige bei Single; Bull kann nur durch Support geändert werden) */}
      {!isCouple && role && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Rolle</label>
          <p className="rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2 text-sm text-white">
            {role}
            {role === "Bull" && (
              <span className="mt-1 block text-xs text-gray-400">
                Rolle kann nur durch Support geändert werden.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Alter + Geschlecht (nur Anzeige, nicht änderbar) – bei Paar nur wenn Single */}
      {!isCouple && (getAgeFromDateOfBirth(dateOfBirth) != null || getGenderSymbol(gender)) && (
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

      {/* Paar: zweispaltig (links Frau, rechts Mann) – Tendenz in Kachel integriert, dann Körper/Vorlieben/Erfahrung/Über mich */}
      {isCoupleWomanMan ? (
        <fieldset className="space-y-4 rounded-xl border border-gray-700 p-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
              <h3 className="text-sm font-semibold text-white">Frau</h3>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Tendenz</label>
                <select
                  value={womanFirst ? coupleFirstTendency : couplePartnerTendency}
                  onChange={(e) => (womanFirst ? setCoupleFirstTendency(e.target.value) : setCouplePartnerTendency(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Auswählen —</option>
                  <option value="devot">Devot</option>
                  <option value="dominant">Dominant</option>
                  <option value="switcher">Switcher</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Größe (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={womanFirst ? heightCm : partnerHeightCm}
                    onChange={(e) => (womanFirst ? setHeightCm(e.target.value) : setPartnerHeightCm(e.target.value))}
                    className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Gewicht (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={womanFirst ? weightKg : partnerWeightKg}
                    onChange={(e) => (womanFirst ? setWeightKg(e.target.value) : setPartnerWeightKg(e.target.value))}
                    className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Figur</label>
                <select
                  value={womanFirst ? bodyType : partnerBodyType}
                  onChange={(e) => (womanFirst ? setBodyType(e.target.value) : setPartnerBodyType(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Keine Angabe —</option>
                  {BODY_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              {womanFirst && getAgeFromDateOfBirth(dateOfBirth) != null && (
                <p className="text-xs text-gray-500">{getAgeFromDateOfBirth(dateOfBirth)} Jahre</p>
              )}
              {!womanFirst && partnerDateOfBirth && getAgeFromDateOfBirth(partnerDateOfBirth) != null && (
                <p className="text-xs text-gray-500">{getAgeFromDateOfBirth(partnerDateOfBirth)} Jahre</p>
              )}
              <div>
                <label className="mb-1 block text-sm text-gray-300">Vorlieben</label>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.map((option) => (
                      <label key={`frau-${option}`} className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500">
                        <input
                          type="checkbox"
                          checked={(womanFirst ? preferences : partnerPreferences).includes(option)}
                          onChange={(e) => {
                            if (womanFirst) {
                              if (e.target.checked) setPreferences((p) => [...p, option]);
                              else setPreferences((p) => p.filter((x) => x !== option));
                            } else {
                              if (e.target.checked) setPartnerPreferences((p) => [...p, option]);
                              else setPartnerPreferences((p) => p.filter((x) => x !== option));
                            }
                          }}
                          className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Erfahrungslevel</label>
                <select
                  value={womanFirst ? experienceLevel : partnerExperienceLevel}
                  onChange={(e) => (womanFirst ? setExperienceLevel(e.target.value) : setPartnerExperienceLevel(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Keine Angabe —</option>
                  <option value="beginner">Einsteiger:in</option>
                  <option value="experienced">Erfahren</option>
                  <option value="advanced">Sehr erfahren</option>
                </select>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
              <h3 className="text-sm font-semibold text-white">Mann</h3>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Tendenz</label>
                <select
                  value={womanFirst ? couplePartnerTendency : coupleFirstTendency}
                  onChange={(e) => (womanFirst ? setCouplePartnerTendency(e.target.value) : setCoupleFirstTendency(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Auswählen —</option>
                  <option value="devot">Devot</option>
                  <option value="dominant">Dominant</option>
                  <option value="switcher">Switcher</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Größe (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={womanFirst ? partnerHeightCm : heightCm}
                    onChange={(e) => (womanFirst ? setPartnerHeightCm(e.target.value) : setHeightCm(e.target.value))}
                    className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Gewicht (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={womanFirst ? partnerWeightKg : weightKg}
                    onChange={(e) => (womanFirst ? setPartnerWeightKg(e.target.value) : setWeightKg(e.target.value))}
                    className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Figur</label>
                <select
                  value={womanFirst ? partnerBodyType : bodyType}
                  onChange={(e) => (womanFirst ? setPartnerBodyType(e.target.value) : setBodyType(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Keine Angabe —</option>
                  {BODY_TYPES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              {womanFirst && partnerDateOfBirth && getAgeFromDateOfBirth(partnerDateOfBirth) != null && (
                <p className="text-xs text-gray-500">{getAgeFromDateOfBirth(partnerDateOfBirth)} Jahre</p>
              )}
              {!womanFirst && getAgeFromDateOfBirth(dateOfBirth) != null && (
                <p className="text-xs text-gray-500">{getAgeFromDateOfBirth(dateOfBirth)} Jahre</p>
              )}
              <div>
                <label className="mb-1 block text-sm text-gray-300">Vorlieben</label>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.map((option) => (
                      <label key={`mann-${option}`} className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500">
                        <input
                          type="checkbox"
                          checked={(womanFirst ? partnerPreferences : preferences).includes(option)}
                          onChange={(e) => {
                            if (womanFirst) {
                              if (e.target.checked) setPartnerPreferences((p) => [...p, option]);
                              else setPartnerPreferences((p) => p.filter((x) => x !== option));
                            } else {
                              if (e.target.checked) setPreferences((p) => [...p, option]);
                              else setPreferences((p) => p.filter((x) => x !== option));
                            }
                          }}
                          className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Erfahrungslevel</label>
                <select
                  value={womanFirst ? partnerExperienceLevel : experienceLevel}
                  onChange={(e) => (womanFirst ? setPartnerExperienceLevel(e.target.value) : setExperienceLevel(e.target.value))}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white"
                >
                  <option value="">— Keine Angabe —</option>
                  <option value="beginner">Einsteiger:in</option>
                  <option value="experienced">Erfahren</option>
                  <option value="advanced">Sehr erfahren</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>
      ) : isCouple ? (
        <fieldset className="space-y-4 rounded-xl border border-gray-700 p-4">
          <legend className="text-lg font-semibold text-white">Körper</legend>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
              <h3 className="text-sm font-semibold text-white">Links</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Größe (cm)</label>
                  <input type="number" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Gewicht (kg)</label>
                  <input type="number" min={30} max={300} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Figur</label>
                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white">
                  <option value="">— Keine Angabe —</option>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Vorlieben</label>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.map((option) => (
                      <label key={`links-${option}`} className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500">
                        <input type="checkbox" checked={preferences.includes(option)} onChange={(e) => { if (e.target.checked) setPreferences((p) => [...p, option]); else setPreferences((p) => p.filter((x) => x !== option)); }} className="rounded border-gray-600 bg-background text-accent focus:ring-accent" />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Erfahrungslevel</label>
                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white">
                  <option value="">— Keine Angabe —</option>
                  <option value="beginner">Einsteiger:in</option>
                  <option value="experienced">Erfahren</option>
                  <option value="advanced">Sehr erfahren</option>
                </select>
              </div>
            </div>
            <div className="space-y-4 rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
              <h3 className="text-sm font-semibold text-white">Rechts</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Größe (cm)</label>
                  <input type="number" min={100} max={250} value={partnerHeightCm} onChange={(e) => setPartnerHeightCm(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-300">Gewicht (kg)</label>
                  <input type="number" min={30} max={300} value={partnerWeightKg} onChange={(e) => setPartnerWeightKg(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Figur</label>
                <select value={partnerBodyType} onChange={(e) => setPartnerBodyType(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white">
                  <option value="">— Keine Angabe —</option>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Vorlieben</label>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCES_OPTIONS.map((option) => (
                      <label key={`rechts-${option}`} className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500">
                        <input type="checkbox" checked={partnerPreferences.includes(option)} onChange={(e) => { if (e.target.checked) setPartnerPreferences((p) => [...p, option]); else setPartnerPreferences((p) => p.filter((x) => x !== option)); }} className="rounded border-gray-600 bg-background text-accent focus:ring-accent" />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Erfahrungslevel</label>
                <select value={partnerExperienceLevel} onChange={(e) => setPartnerExperienceLevel(e.target.value)} className="w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-white">
                  <option value="">— Keine Angabe —</option>
                  <option value="beginner">Einsteiger:in</option>
                  <option value="experienced">Erfahren</option>
                  <option value="advanced">Sehr erfahren</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>
      ) : (
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
      )}


      {/* Ort, Suche, Erwartungen – nur Überschrift + Inhalt, ohne Kacheln */}
      {isCouple && (
        <h2 className="text-xl font-semibold text-white">Gemeinsam</h2>
      )}
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-white">Ort</h3>
          <p className="mt-1 text-xs text-gray-500">
            PLZ oder Ort eingeben – nur gültige Einträge aus unserer Datenbasis sind wählbar. Andere können Stadt und PLZ sehen (für Suche „in der Nähe“).
          </p>
          <div className="mt-2">
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
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white">{isCouple ? "Wen sucht ihr?" : "Suche"}</h3>
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              {isCouple ? "Wen sucht ihr? (Mehrfachauswahl)" : "Wen suchst du? (Mehrfachauswahl)"}
            </label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-600 bg-background/50 p-2">
              {LOOKING_FOR_GENDER_OPTIONS.map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1.5 text-sm text-gray-300 hover:border-gray-500"
                >
                  <input
                    type="checkbox"
                    checked={lookingForGenders.includes(g)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLookingForGenders((prev) => [...prev, g]);
                      } else {
                        setLookingForGenders((prev) => prev.filter((x) => x !== g));
                      }
                    }}
                    className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-300">
              {isCouple ? "Was sucht ihr? (Mehrfachauswahl)" : "Was suchst du? (Mehrfachauswahl)"}
            </label>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500"
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
          </div>

          {!isCouple && (
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Vorlieben (worauf stehst du? Mehrfachauswahl)
              </label>
              <input
                type="search"
                placeholder="Vorlieben filtern …"
                value={preferencesFilter}
                onChange={(e) => setPreferencesFilter(e.target.value)}
                className="mb-2 w-full rounded-lg border border-gray-600 bg-background px-4 py-2 text-sm text-white placeholder-gray-500"
              />
              <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-600 bg-background/50 p-2">
                <div className="flex flex-wrap gap-2">
                  {PREFERENCES_OPTIONS.filter(
                    (option) =>
                      !preferencesFilter.trim() ||
                      option.toLowerCase().includes(preferencesFilter.trim().toLowerCase())
                  ).map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-600 bg-background px-2 py-1 text-xs text-gray-300 hover:border-gray-500"
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
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-white">
            {isCouple ? "Was vom Gegenüber erwartet wird?" : "Was erwartest du von deinem Gesuchten?"}
          </h3>
          <div className="mt-2">
            <label htmlFor="expectations_text" className="mb-1 block text-sm text-gray-300">
              Deine Angaben
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
        </section>
      </div>

      {/* Über mich: bei Paar Frau+Mann zweispaltig (links Frau, rechts Mann), sonst einspaltig */}
      {isCoupleWomanMan ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">Über mich – Frau</label>
            <textarea
              value={womanFirst ? aboutMe : partnerAboutMe}
              onChange={(e) => (womanFirst ? setAboutMe(e.target.value) : setPartnerAboutMe(e.target.value))}
              maxLength={MAX_TEXT_LENGTH}
              rows={4}
              placeholder="Was andere über sie wissen dürfen …"
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              {(womanFirst ? aboutMe : partnerAboutMe).length}/{MAX_TEXT_LENGTH} Zeichen
            </p>
          </div>
          <div className="rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">Über mich – Mann</label>
            <textarea
              value={womanFirst ? partnerAboutMe : aboutMe}
              onChange={(e) => (womanFirst ? setPartnerAboutMe(e.target.value) : setAboutMe(e.target.value))}
              maxLength={MAX_TEXT_LENGTH}
              rows={4}
              placeholder="Was andere über ihn wissen dürfen …"
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              {(womanFirst ? partnerAboutMe : aboutMe).length}/{MAX_TEXT_LENGTH} Zeichen
            </p>
          </div>
        </div>
      ) : isCouple ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">Über mich – Links</label>
            <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} maxLength={MAX_TEXT_LENGTH} rows={4} placeholder="Optional …" className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white" />
            <p className="mt-1 text-xs text-gray-500">{aboutMe.length}/{MAX_TEXT_LENGTH} Zeichen</p>
          </div>
          <div className="rounded-lg border border-gray-600/60 bg-gray-900/30 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-300">Über mich – Rechts</label>
            <textarea value={partnerAboutMe} onChange={(e) => setPartnerAboutMe(e.target.value)} maxLength={MAX_TEXT_LENGTH} rows={4} placeholder="Optional …" className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white" />
            <p className="mt-1 text-xs text-gray-500">{partnerAboutMe.length}/{MAX_TEXT_LENGTH} Zeichen</p>
          </div>
        </div>
      ) : (
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
      )}

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
