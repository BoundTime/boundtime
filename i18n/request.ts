import { getRequestConfig } from "next-intl/server";

/** Unterstützte Locales. Für EN später "en" hinzufügen und messages/en.json anlegen. */
const locales = ["de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export default getRequestConfig(async () => {
  const locale = defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Europe/Berlin",
  };
});
