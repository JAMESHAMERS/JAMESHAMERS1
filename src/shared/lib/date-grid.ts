/**
 * Month-grid date math shared by every calendar-shaped UI in the app
 * (MiniCalendar, DatePicker, the Tasks calendar view). Deliberately not a
 * date library — this is the entire surface area a Monday-first month grid
 * needs, and pulling in a dependency for it would be more code, not less.
 */

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

export function getMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Week starts on Monday.
  const leadingDays = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - leadingDays);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}

export function getWeekdayLabels(locale: string, format: "narrow" | "short" = "narrow") {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
  // Jan 1 2024 was a Monday — a convenient anchor for a Monday-first week.
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(2024, 0, 1 + i)),
  );
}
