import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales. Every other i18n file
 * (proxy, navigation, request config) derives from this instead of
 * repeating the locale list.
 */
export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  // Always show the locale prefix (/vi/..., /en/...) rather than hiding it
  // for the default locale. This keeps URLs unambiguous and avoids the
  // extra request Next.js needs to detect the locale on prefix-less paths.
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
