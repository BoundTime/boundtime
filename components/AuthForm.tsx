"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthMode } from "@/types";

interface AuthFormProps {
  mode: AuthMode;
}

const NICK_MIN = 2;
const NICK_MAX = 30;
const NICK_REGEX = /^[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+$/;

const GENDER_OPTIONS = ["Mann", "Frau", "Divers"] as const;
const ROLE_OPTIONS = ["Dom", "Sub", "Switcher", "Bull"] as const;
const ACCOUNT_TYPE_OPTIONS = [
  { value: "single", label: "Singleprofil" },
  { value: "couple", label: "Paarprofil" },
] as const;
const COUPLE_TYPE_OPTIONS = [
  { value: "man_woman", label: "Mann + Frau" },
  { value: "man_man", label: "Mann + Mann" },
  { value: "woman_woman", label: "Frau + Frau" },
] as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [gender, setGender] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [coupleType, setCoupleType] = useState<string>("");
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptAge, setAcceptAge] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null); // zum Debuggen

  const isRegister = mode === "register";

  function toGermanError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an oder nutze Passwort vergessen.";
  if (m.includes("invalid login credentials"))
    return "E-Mail oder Passwort ist falsch.";
  if (m.includes("rate limit") || m.includes("email rate limit exceeded"))
    return "Zu viele E-Mails in kurzer Zeit. Bitte warte 15–30 Minuten und versuche es erneut.";
  if (m.includes("signup requires") || m.includes("valid password"))
    return "Bitte gib ein gültiges Passwort ein (mindestens 8 Zeichen).";
  if (m.includes("unable to validate email") || m.includes("validate email"))
    return "Die E-Mail-Adresse konnte nicht validiert werden. Bitte prüfe die Schreibweise.";
  if (m.includes("email not confirmed"))
    return "Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir dir geschickt haben.";
  if (m.includes("forbidden") || m.includes("403"))
    return "Zugriff verweigert. Bitte versuche es später erneut.";
  if (m.includes("fetch failed") || m.includes("network"))
    return "Verbindungsproblem. Bitte prüfe deine Internetverbindung.";
  if (m.includes("error sending confirmation email"))
    return "Die Bestätigungs-E-Mail konnte nicht versendet werden. Prüfe die SMTP-Einstellungen in Supabase (Host, Port, Benutzername, Passwort).";
  if (m.includes("database error saving new user"))
    return "Beim Speichern des Profils ist ein Fehler aufgetreten. Bitte stelle sicher, dass die Datenbank-Migration (Trigger für neue Nutzer) in Supabase ausgeführt wurde.";
  // Fallback: englische Fehler allgemein übersetzen
  if (/^[a-z\s]+$/.test(raw) || raw.includes(" ") && !/ä|ö|ü|ß|einen|bitte|deine/i.test(raw))
    return "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.";
  return raw;
}

function validate(): boolean {
    const next: Record<string, string> = {};
    const emailTrim = email.trim();
    if (!emailTrim) next.email = "E-Mail ist erforderlich.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim))
      next.email = "Bitte gültige E-Mail-Adresse eingeben.";
    if (!password) next.password = "Passwort ist erforderlich.";
    else if (password.length < 8)
      next.password = "Passwort muss mindestens 8 Zeichen haben.";
    if (isRegister) {
      const nickTrim = nick.trim();
      if (!nickTrim) next.nick = "Bitte wähle einen Nick (Anzeigenamen).";
      else if (nickTrim.length < NICK_MIN || nickTrim.length > NICK_MAX)
        next.nick = `Der Nick muss zwischen ${NICK_MIN} und ${NICK_MAX} Zeichen haben.`;
      else if (!NICK_REGEX.test(nickTrim))
        next.nick = "Erlaubt sind nur Buchstaben, Zahlen und Unterstriche.";
      if (!accountType) next.accountType = "Bitte wähle Paarprofil oder Singleprofil.";
      if (accountType === "couple") {
        if (!coupleType) next.coupleType = "Bitte wähle die Art des Paars.";
      } else if (accountType === "single") {
        if (!gender) next.gender = "Bitte wähle dein Geschlecht.";
        if (!role) next.role = "Bitte wähle deine Rolle.";
      }
      if (password !== confirmPassword)
        next.confirmPassword = "Passwörter stimmen nicht überein.";
      if (!dateOfBirth) next.dateOfBirth = "Bitte gib dein Geburtsdatum an.";
      else {
        const birth = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--;
        if (age < 18) next.dateOfBirth = "Du musst mindestens 18 Jahre alt sein.";
      }
      if (!acceptAge)
        next.acceptAge = "Bitte bestätige das Alter und die Nutzungsbedingungen.";
      if (!acceptPrivacy)
        next.acceptPrivacy = "Bitte stimme der Datenschutzerklärung zu.";
    }
    setErrors(next);
    setSubmitError(null);
    setSubmitSuccess(null);
    setRawError(null);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setRawError(null);

    const supabase = createClient();

    try {
      if (isRegister) {
        const nickTrim = nick.trim();
        const { data: nickTaken, error: nickErr } = await supabase.rpc("nick_exists", { check_nick: nickTrim });
        if (nickErr) {
          setRawError(nickErr.message || JSON.stringify(nickErr));
          setSubmitError("Nick-Prüfung fehlgeschlagen. Bitte versuche es später erneut.");
          setLoading(false);
          return;
        }
        if (nickTaken) {
          setSubmitError("Dieser Nick ist bereits vergeben. Bitte wähle einen anderen.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              nick: nickTrim,
              gender: accountType === "couple" ? "Divers" : (gender as "Mann" | "Frau" | "Divers"),
              role: accountType === "couple" ? "Switcher" : (role as "Dom" | "Sub" | "Switcher" | "Bull"),
              date_of_birth: dateOfBirth || null,
              account_type: accountType === "couple" ? "couple" : "single",
              ...(accountType === "couple" && coupleType ? { couple_type: coupleType } : {}),
            },
          },
        });
        // "Error sending confirmation email" kommt manchmal, obwohl User angelegt und E-Mail versendet wurde.
        // In diesem Fall trotzdem zur Bestätigungsseite weiterleiten – Nutzer soll Postfach prüfen.
        const errMsg = (error?.message || "").toLowerCase();
        if (error && errMsg.includes("error sending confirmation email")) {
          router.push(`/register/check-email?email=${encodeURIComponent(email.trim())}`);
          return;
        }
        if (error && !data?.user) {
          const msg = error.message || String(error);
          setRawError(msg || JSON.stringify(error));
          setSubmitError(toGermanError(msg));
          setLoading(false);
          return;
        }
        if (!data.user) {
          setRawError("Kein user in data");
          setSubmitError("Registrierung fehlgeschlagen.");
          setLoading(false);
          return;
        }

        // Bei aktivierter E-Mail-Bestätigung: keine Session bis zur Bestätigung.
        // Das Profil wird per DB-Trigger aus user_metadata erstellt.
        // Weiterleitung zur Bestätigungsseite mit Angabe der E-Mail-Adresse.
        if (!data.session) {
          const emailParam = encodeURIComponent(email.trim());
          router.push(`/register/check-email?email=${emailParam}`);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          const msg = error.message || String(error);
          setRawError(msg || JSON.stringify(error));
          setSubmitError(toGermanError(msg));
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      let message = "Ein Fehler ist aufgetreten.";
      let raw = "";
      if (err instanceof Error) {
        message = err.message || String(err);
        raw = `${err.name}: ${message}`;
      } else if (err && typeof err === "object") {
        const o = err as Record<string, unknown>;
        message = (typeof o.message === "string" ? o.message : JSON.stringify(o)) || String(err);
        raw = JSON.stringify(o, null, 0).slice(0, 300);
      } else {
        raw = String(err);
      }
      setRawError(raw || message);
      setSubmitError(toGermanError(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-5 rounded-xl border border-gray-700 bg-card p-8 shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-white">
        {isRegister
          ? `Registrieren${registerStep <= 3 ? ` – Schritt ${registerStep} von 3` : ""}`
          : "Anmelden"}
      </h2>

      {submitSuccess && (
        <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400 border border-green-500/20">
          {submitSuccess}
        </p>
      )}
      {submitError && (
        <div className="space-y-2 rounded-lg border border-red-500/30 bg-red-950/20 p-3">
          <p className="text-sm text-red-400">{submitError}</p>
          <p className="text-xs text-gray-500">
            Technische Details: {rawError || "nicht verfügbar"}
          </p>
        </div>
      )}

      {/* Registrierung Schritt 1: Paar oder Single */}
      {isRegister && registerStep === 1 && (
        <>
          <p className="text-gray-300">
            Möchtest du ein <strong>Paarprofil</strong> oder ein <strong>Singleprofil</strong> anlegen?
          </p>
          <div>
            <label htmlFor="accountType" className="mb-1 block text-sm font-medium text-gray-300">
              Account-Typ
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">— Bitte wählen —</option>
              {ACCOUNT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Paarprofil: Gemeinsamer Account. Später in den Einstellungen kann ein Zugriffs-Passwort festgelegt werden (z. B. nur Hotwife schreibt, Cuckold nur lesen).
            </p>
            {errors.accountType && (
              <p className="mt-1 text-sm text-red-400">{errors.accountType}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setErrors((e) => ({ ...e, accountType: "" }));
              if (!accountType) {
                setErrors((e) => ({ ...e, accountType: "Bitte wähle Paarprofil oder Singleprofil." }));
                return;
              }
              setRegisterStep(2);
            }}
            className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Weiter
          </button>
        </>
      )}

      {/* Registrierung Schritt 2: Paar-Art oder Geschlecht + Rolle */}
      {isRegister && registerStep === 2 && (
        <>
          {accountType === "couple" ? (
            <>
              <p className="text-gray-300">
                Welche Art von Paar seid ihr?
              </p>
              <div>
                <label htmlFor="coupleType" className="mb-1 block text-sm font-medium text-gray-300">
                  Art des Paars
                </label>
                <select
                  id="coupleType"
                  value={coupleType}
                  onChange={(e) => setCoupleType(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">— Bitte wählen —</option>
                  {COUPLE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.coupleType && (
                  <p className="mt-1 text-sm text-red-400">{errors.coupleType}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300">
                Dein Geschlecht und deine Rolle in der Community.
              </p>
              <div>
                <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-300">
                  Geschlecht
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">— Bitte wählen —</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-400">{errors.gender}</p>
                )}
              </div>
              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-300">
                  Rolle
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">— Bitte wählen —</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-400">{errors.role}</p>
                )}
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRegisterStep(1)}
              className="flex-1 rounded-lg border border-gray-600 bg-background px-4 py-3 font-medium text-gray-300 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={() => {
                setErrors((e) => ({ ...e, coupleType: "", gender: "", role: "" }));
                const next: Record<string, string> = {};
                if (accountType === "couple") {
                  if (!coupleType) next.coupleType = "Bitte wähle die Art des Paars.";
                } else {
                  if (!gender) next.gender = "Bitte wähle dein Geschlecht.";
                  if (!role) next.role = "Bitte wähle deine Rolle.";
                }
                setErrors((e) => ({ ...e, ...next }));
                if (Object.keys(next).length > 0) return;
                setRegisterStep(3);
              }}
              className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Weiter
            </button>
          </div>
        </>
      )}

      {/* Registrierung Schritt 3: Nick, Geburtsdatum, E-Mail, Passwort, etc. – nur anzeigen wenn step 3 */}
      {isRegister && registerStep === 3 && (
        <>
          <div>
            <label htmlFor="nick" className="mb-1 block text-sm font-medium text-gray-300">
              Nick <span className="text-gray-500">(Anzeigename – andere sehen nur diesen Namen, nie deine E-Mail)</span>
            </label>
            <input
              id="nick"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="z. B. Max_Muster"
              autoComplete="username"
              minLength={NICK_MIN}
              maxLength={NICK_MAX}
            />
            <p className="mt-1 text-xs text-gray-500">
              {NICK_MIN}–{NICK_MAX} Zeichen, nur Buchstaben, Zahlen und Unterstriche.
            </p>
            {errors.nick && (
              <p className="mt-1 text-sm text-red-400">{errors.nick}</p>
            )}
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-medium text-gray-300">
              Geburtsdatum <span className="text-gray-500">(Pflicht – danach nicht änderbar)</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>
            )}
          </div>
        </>
      )}

      {/* E-Mail & Passwort: bei Login immer, bei Registrierung nur in Schritt 3 */}
      {(!isRegister || registerStep === 3) && (
        <>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="name@beispiel.de"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="••••••••"
          autoComplete={isRegister ? "new-password" : "current-password"}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      {isRegister && registerStep === 3 && (
        <>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-300">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-background px-4 py-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                id="acceptAge"
                type="checkbox"
                checked={acceptAge}
                onChange={(e) => setAcceptAge(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-background text-accent focus:ring-accent"
              />
              <label htmlFor="acceptAge" className="text-sm text-gray-300">
                Ich bestätige, mindestens 18 Jahre alt zu sein und habe die{" "}
                <Link href="/agb" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                  AGB
                </Link>
                {" "}sowie die{" "}
                <Link href="/community-regeln" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                  Community-Regeln
                </Link>
                {" "}gelesen und akzeptiert.
              </label>
            </div>
            <div className="flex items-start gap-3">
              <input
                id="acceptPrivacy"
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-background text-accent focus:ring-accent"
              />
              <label htmlFor="acceptPrivacy" className="text-sm text-gray-300">
                Ich habe die{" "}
                <Link href="/datenschutz" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                  Datenschutzerklärung
                </Link>
                {" "}gelesen und stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.
              </label>
            </div>
          </div>
          {(errors.acceptAge || errors.acceptPrivacy) && (
            <p className="text-sm text-red-400">{errors.acceptAge || errors.acceptPrivacy}</p>
          )}
        </>
      )}

      {isRegister && registerStep === 3 ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRegisterStep(2)}
            className="flex-1 rounded-lg border border-gray-600 bg-background px-4 py-3 font-medium text-gray-300 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Zurück
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-accent px-4 py-3 font-medium text-white hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Bitte warten …" : "Registrieren"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Bitte warten …" : "Anmelden"}
        </button>
      )}
        </>
      )}

      <p className="text-center text-sm text-gray-400">
        {isRegister ? (
          <>
            Bereits registriert?{" "}
            <Link href="/login" className="text-accent transition-colors duration-150 hover:underline hover:text-accent-hover">
              Anmelden
            </Link>
          </>
        ) : (
          <>
            Noch kein Konto?{" "}
            <Link href="/register" className="text-accent transition-colors duration-150 hover:underline hover:text-accent-hover">
              Jetzt registrieren
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
