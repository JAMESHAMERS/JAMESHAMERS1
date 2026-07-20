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

export function formatBytes(bytes: number | null) {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
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
