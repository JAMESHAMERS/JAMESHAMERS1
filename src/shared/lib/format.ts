/**
 * Locale-aware formatting helpers. Kept framework-free (pure functions over
 * `Intl`) so they're usable from Server or Client Components alike.
 */

export function formatCurrency(
  amount: number,
  locale: string,
  currency = "VND",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeMinutes(minutesAgo: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (minutesAgo < 60) {
    return rtf.format(-minutesAgo, "minute");
  }
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) {
    return rtf.format(-hours, "hour");
  }
  return rtf.format(-Math.round(hours / 24), "day");
}
