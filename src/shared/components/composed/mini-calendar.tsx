"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { getMonthGrid, getWeekdayLabels, toDateKey } from "@/shared/lib/date-grid";
import { cn } from "@/shared/lib/utils";

interface MiniCalendarProps {
  /** Dates (as returned by `toDateKey`, i.e. "YYYY-M-D") that should show a marker dot. */
  markedDates?: Set<string>;
  className?: string;
}

/**
 * Self-contained month calendar with no external date library — the app
 * only needs month-grid math and locale-aware labels, both trivial with
 * `Intl` + native `Date`. Generic enough to reuse anywhere a date needs
 * visualizing (journal entry picker, habit history), not overview-specific.
 */
export function MiniCalendar({ markedDates, className }: MiniCalendarProps) {
  const locale = useLocale();
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const days = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const todayKey = toDateKey(today);

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() =>
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() =>
              setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="text-muted-foreground grid grid-cols-7 text-center text-[11px]">
        {weekdayLabels.map((label, i) => (
          <div key={i} className="pb-1.5 uppercase">
            {label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={monthLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="grid grid-cols-7 gap-y-1 text-center text-xs"
        >
          {days.map((date) => {
            const key = toDateKey(date);
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isToday = key === todayKey;
            const isMarked = markedDates?.has(key);

            return (
              <div key={key} className="flex flex-col items-center gap-0.5 py-0.5">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full tabular-nums",
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                    isToday && "bg-primary text-primary-foreground font-medium",
                  )}
                >
                  {date.getDate()}
                </span>
                <span
                  className={cn(
                    "bg-primary size-1 rounded-full",
                    isMarked ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
