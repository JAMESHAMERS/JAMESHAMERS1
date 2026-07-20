"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { MealEntry } from "../../domain/types";
import { useMealsStore } from "../../application/meals-store";
import { cn } from "@/shared/lib/utils";

export function MealEntryRow({
  entry,
  onEdit,
}: {
  entry: MealEntry;
  onEdit: (entry: MealEntry) => void;
}) {
  const t = useTranslations("meals");
  const locale = useLocale();
  const deleteMealEntry = useMealsStore((s) => s.deleteMealEntry);

  const timeLabel = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(
    new Date(entry.loggedAt),
  );

  return (
    <div className="hover:bg-accent/40 group flex items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0">
      <button
        type="button"
        onClick={() => onEdit(entry)}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="truncate text-sm font-medium">{entry.name}</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            {t("macroSummary", { protein: Math.round(entry.protein), carbs: Math.round(entry.carbs), fat: Math.round(entry.fat) })}
          </span>
          <span className="text-muted-foreground text-xs">{timeLabel}</span>
        </div>
      </button>

      <span className={cn("shrink-0 text-sm font-semibold tabular-nums")}>
        {t("caloriesShort", { count: entry.calories })}
      </span>

      <button
        type="button"
        onClick={() => void deleteMealEntry(entry.id)}
        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={t("actions.delete")}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}
