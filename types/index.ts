export type AuthMode = "login" | "register";

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  acceptAge?: boolean;
}

export const BODY_TYPES = ["schlank", "sportlich", "kräftig", "mollig", "keine Angabe"] as const;
export const AGE_RANGES = ["18-25", "26-35", "36-45", "46+"] as const;
export const LOOKING_FOR_GENDER_OPTIONS = ["Mann", "Frau", "Divers", "alle"] as const;

/** Vorgegebene Optionen für „Was suchst du?“ (Mehrfachauswahl) */
export const LOOKING_FOR_OPTIONS = [
  "Online Domina / Dom",
  "Sklave / Sklavin",
  "Keusch gehalten werden (Keyholderin/Keyholder suchen)",
  "Keuschhalten anbieten (Keyholder)",
  "Finanziell",
  "Treffen vor Ort",
  "Langzeit",
  "Kurzzeit",
  "Beziehung",
  "Kontakt / Austausch",
  "Spielpartner",
] as const;

/** Vorgegebene Optionen für „Vorlieben“ (worauf man steht / was man mag) */
export const PREFERENCES_OPTIONS = [
  "Keuschhaltung",
  "Demütigung",
  "Service / Dienst",
  "Kontrolle über Alltag",
  "Schmerz / Spanking",
  "Mindfuck",
  "Langzeit-Cage",
  "24/7-Dynamik",
  "Age Play",
  "Befehle & Gehorsam",
  "Bondage",
  "Body Worship",
  "Clamps / Klemmen",
  "Cuckold / Cuckquean",
  "Erniedrigung / Humiliation",
  "Ernährungs- / Schlaf- / Kleider- / Medien- / Social-Media-Kontrolle",
  "Exhibitionismus",
  "Facesitting",
  "Femdom",
  "Findom / Tribut",
  "Finanzielle Kontrolle",
  "Flogging / Peitschen",
  "Fußfetisch / Fußservice",
  "Herr / Herrin",
  "Lob & Belohnung",
  "Maledom",
  "Online-Dynamik",
  "Orgasmuskontrolle",
  "Öffentliche Demut",
  "Paddling",
  "Petplay",
  "Regeln & Rituale",
  "Sissification",
  "Sklave / Sklavin",
  "Strafen & Disziplin",
  "Switch",
  "Tasks / Aufgaben",
  "TPE",
  "Treffen vor Ort",
  "Verweigerung",
  "Voyeurismus",
  "Wachs / Sensation",
  "Worship",
  "Würge- / Breathplay",
] as const;

export const MAX_TEXT_LENGTH = 500;
export const POST_CONTENT_MAX = 2000;

/** Benachrichtigungstypen (In-App) */
export const NOTIFICATION_TYPES = [
  "new_message",
  "new_follower",
  "profile_view",
  "post_like",
  "profile_like",
  "photo_like",
  "photo_comment",
  "verification_rejected",
  "chastity_new_task",
  "chastity_task_awaiting_confirmation",
  "chastity_reward_request",
  "chastity_deadline_soon",
  "chastity_arrangement_offer",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  new_message: "Neue Nachricht",
  new_follower: "Neuer Follower",
  profile_view: "Profilbesuch",
  post_like: "Like auf deinen Post",
  profile_like: "Like auf dein Profil",
  photo_like: "Like auf dein Foto",
  photo_comment: "Kommentar auf dein Foto",
  verification_rejected: "Verifizierung abgelehnt",
  chastity_new_task: "Neue Aufgabe (Keuschhaltung)",
  chastity_task_awaiting_confirmation: "Aufgabe wartet auf Bestätigung",
  chastity_reward_request: "Belohnungsanfrage",
  chastity_deadline_soon: "Frist läuft bald ab",
  chastity_arrangement_offer: "Keuschhaltungs-Anfrage wartet auf dich",
};
