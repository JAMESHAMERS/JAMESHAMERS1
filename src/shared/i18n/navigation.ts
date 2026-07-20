import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware wrappers around next/navigation. Modules should import
 * `Link`, `useRouter`, `usePathname`, `redirect` from here instead of
 * `next/link` / `next/navigation` so the current locale is always
 * preserved on navigation.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
