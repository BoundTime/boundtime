import type { NotificationType } from "@/types";

/**
 * Gibt den Anzeigetext für eine Benachrichtigung inkl. Akteur zurück.
 * Wenn nick vorhanden: "[Nick] hat …", sonst Fallback-Label.
 */
export function getNotificationMessage(
  type: NotificationType,
  nick: string | null | undefined
): string {
  if (!nick) return "";
  const n = nick.trim() || "Jemand";
  switch (type) {
    case "new_message":
      return `${n} hat dir eine Nachricht geschickt.`;
    case "new_follower":
      return `${n} folgt dir jetzt.`;
    case "profile_view":
      return `${n} hat dein Profil besucht.`;
    case "post_like":
      return `${n} hat deinen Post geliked.`;
    case "profile_like":
      return `${n} hat dein Profil geliked.`;
    case "photo_like":
      return `${n} hat dein Foto geliked.`;
    case "photo_comment":
      return `${n} hat dein Foto kommentiert.`;
    default:
      return "";
  }
}

/** Typen, bei denen related_user_id den Akteur enthält und ein „[Nick] hat …“-Text angezeigt wird */
export const NOTIFICATION_TYPES_WITH_ACTOR: NotificationType[] = [
  "new_message",
  "new_follower",
  "profile_view",
  "post_like",
  "profile_like",
  "photo_like",
  "photo_comment",
];
