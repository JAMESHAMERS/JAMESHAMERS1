import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Messages are split into small per-namespace files (common, nav, theme...)
 * instead of one giant JSON blob, so adding a new module later means adding
 * one file, not editing a monolith. They're merged here into the single
 * object next-intl expects at runtime.
 */
const namespaces = [
  "common",
  "nav",
  "theme",
  "settings",
  "modules",
  "dashboard",
  "tasks",
  "finance",
  "meals",
  "travel",
] as const;

async function loadMessages(locale: string) {
  const modules = await Promise.all(
    namespaces.map((namespace) =>
      import(`./messages/${locale}/${namespace}.json`).then(
        (mod) => mod.default,
      ),
    ),
  );

  return namespaces.reduce<Record<string, unknown>>((acc, namespace, i) => {
    acc[namespace] = modules[i];
    return acc;
  }, {});
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
