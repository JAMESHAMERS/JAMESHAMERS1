"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { getMonthGrid, getWeekdayLabels, isSameDay, toDateKey } from "@/shared/lib/date-grid";
import { cn } from "@/shared/lib/utils";

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Selectable month-grid date field, built on the same date-grid math as
 * `MiniCalendar` but with click-to-select instead of read-only markers.
 * Used anywhere a single date needs picking (task due dates today; journal
 * entry dates, goal target dates later).
 */
export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const base = value ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const days = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const label = value
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(value)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start gap-2 font-normal", !value && "text-muted-foreground", className)}
        >
          <CalendarIcon className="size-4" />
          {label}
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="hover:bg-accent ml-auto rounded-sm p-0.5"
            >
              <XIcon className="size-3.5" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 select-none p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground grid grid-cols-7 text-center text-[11px]">
          {weekdayLabels.map((wd, i) => (
            <div key={i} className="pb-1.5 uppercase">
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((date) => {
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isSelected = value ? isSameDay(date, value) : false;
            const isToday = isSameDay(date, new Date());

            return (
              <button
                type="button"
                key={toDateKey(date)}
                onClick={() => {
                  onChange(date);
                  setOpen(false);
                }}
                className={cn(
                  "mx-auto flex size-7 items-center justify-center rounded-full tabular-nums transition-colors",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                  !isSelected && "hover:bg-accent",
                  isToday && !isSelected && "ring-border ring-1",
                  isSelected && "bg-primary text-primary-foreground font-medium",
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
