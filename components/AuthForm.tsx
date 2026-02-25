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
const ROLE_OPTIONS = ["Dom", "Sub", "Switcher"] as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [gender, setGender] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptAge, setAcceptAge] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isRegister = mode === "register";

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
      if (!gender) next.gender = "Bitte wähle ein Geschlecht.";
      if (!role) next.role = "Bitte wähle eine Rolle.";
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
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const supabase = createClient();

    try {
      if (isRegister) {
        const nickTrim = nick.trim();
        const { data: nickTaken } = await supabase.rpc("nick_exists", { check_nick: nickTrim });
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
              gender: gender as "Mann" | "Frau" | "Divers",
              role: role as "Dom" | "Sub" | "Switcher",
              date_of_birth: dateOfBirth || null,
            },
          },
        });
        if (error) throw error;
        if (!data.user) throw new Error("Registrierung fehlgeschlagen.");

        // Bei aktivierter E-Mail-Bestätigung: keine Session bis zur Bestätigung.
        // Das Profil wird per DB-Trigger aus user_metadata erstellt.
        if (!data.session) {
          setSubmitError(null);
          setSubmitSuccess(
            "Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse – wir haben dir einen Link geschickt. Prüfe auch deinen Spam-Ordner."
          );
          setErrors({});
          setEmail("");
          setNick("");
          setPassword("");
          setConfirmPassword("");
          setGender("");
          setRole("");
          setDateOfBirth("");
          setAcceptAge(false);
          setAcceptPrivacy(false);
          setLoading(false);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      let message = "Ein Fehler ist aufgetreten.";
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
        message = (err as { message: string }).message;
      }
      // Häufige Supabase-Fehler auf Deutsch (case-insensitive)
      const m = message.toLowerCase();
      if (m.includes("user already registered") || m.includes("already been registered"))
        message = "Diese E-Mail-Adresse ist bereits registriert. Bitte melde dich an oder nutze Passwort vergessen.";
      else if (m.includes("invalid login credentials"))
        message = "E-Mail oder Passwort ist falsch.";
      else if (m.includes("rate limit") || m.includes("email rate limit"))
        message = "Zu viele E-Mails in kurzer Zeit. Bitte warte einige Minuten und versuche es erneut.";
      else if (m.includes("signup requires") || m.includes("valid password"))
        message = "Bitte gib ein gültiges Passwort ein (mindestens 8 Zeichen).";
      else if (m.includes("unable to validate email") || m.includes("validate email"))
        message = "Die E-Mail-Adresse konnte nicht validiert werden. Bitte prüfe die Schreibweise.";
      else if (m.includes("email not confirmed"))
        message = "Bitte bestätige zuerst deine E-Mail-Adresse über den Link, den wir dir geschickt haben.";
      else if (m.includes("forbidden") || m.includes("403"))
        message = "Zugriff verweigert. Bitte versuche es später erneut.";
      else if (m.includes("fetch failed") || m.includes("network"))
        message = "Verbindungsproblem. Bitte prüfe deine Internetverbindung.";
      setSubmitError(message);
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
        {isRegister ? "Registrieren" : "Anmelden"}
      </h2>

      {submitSuccess && (
        <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400 border border-green-500/20">
          {submitSuccess}
        </p>
      )}
      {submitError && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {submitError}
        </p>
      )}

      {isRegister && (
        <div>
          <label htmlFor="nick" className="mb-1 block text-sm font-medium text-gray-300">
            Nick <span className="text-gray-500">(Anzeigename in der Community – andere Nutzer sehen nur diesen Namen, nie deine E-Mail)</span>
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
            {NICK_MIN}–{NICK_MAX} Zeichen, nur Buchstaben, Zahlen und Unterstriche. Eindeutig.
          </p>
          {errors.nick && (
            <p className="mt-1 text-sm text-red-400">{errors.nick}</p>
          )}
        </div>
      )}

      {isRegister && (
        <>
          <div>
            <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-300">
              Geschlecht <span className="text-gray-500">(Pflicht)</span>
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
            <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-medium text-gray-300">
              Geburtsdatum <span className="text-gray-500">(Pflicht, nur bei Registrierung – danach nicht änderbar)</span>
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
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-300">
              Rolle <span className="text-gray-500">(Pflicht)</span>
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

      {isRegister && (
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Bitte warten …" : isRegister ? "Registrieren" : "Anmelden"}
      </button>

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
