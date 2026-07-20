"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CameraIcon, HistoryIcon, StickyNoteIcon } from "lucide-react";

import { buildTimeline } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { EXPENSE_CATEGORY_META, ITINERARY_CATEGORY_META } from "../travel-meta";

export function TimelineTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const itineraryItems = useTravelStore((s) => s.itineraryItems);
  const expenses = useTravelStore((s) => s.expenses);
  const photos = useTravelStore((s) => s.photos);
  const notes = useTravelStore((s) => s.notes);

  const events = useMemo(
    () => buildTimeline(tripId, itineraryItems, expenses, photos, notes),
    [tripId, itineraryItems, expenses, photos, notes],
  );

  if (events.length === 0) {
    return <EmptyState icon={HistoryIcon} title={t("noTimelineEvents")} className="py-10" />;
  }

  return (
    <ol className="flex flex-col gap-0.5">
      {events.map((event) => {
        const dateLabel = new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(event.at));

        if (event.type === "itinerary" && event.itineraryItem) {
          const meta = ITINERARY_CATEGORY_META[event.itineraryItem.category];
          const Icon = meta.icon;
          return (
            <li key={`${event.type}-${event.id}`} className="flex items-start gap-3 border-b px-1 py-2.5 last:border-b-0">
              <div className={cn("bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", meta.className)}>
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.itineraryItem.title}</p>
                {event.itineraryItem.location ? (
                  <p className="text-muted-foreground truncate text-xs">{event.itineraryItem.location}</p>
                ) : null}
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{dateLabel}</span>
            </li>
          );
        }

        if (event.type === "expense" && event.expense) {
          const meta = EXPENSE_CATEGORY_META[event.expense.category];
          const Icon = meta.icon;
          return (
            <li key={`${event.type}-${event.id}`} className="flex items-start gap-3 border-b px-1 py-2.5 last:border-b-0">
              <div className={cn("bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", meta.className)}>
                <Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {event.expense.note || t(`expenseCategory.${event.expense.category}`)}
                </p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {formatCurrency(event.expense.amount, locale, event.expense.currency)}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{dateLabel}</span>
            </li>
          );
        }

        if (event.type === "photo" && event.photo) {
          return (
            <li key={`${event.type}-${event.id}`} className="flex items-start gap-3 border-b px-1 py-2.5 last:border-b-0">
              <div className="bg-muted text-chart-accent mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                <CameraIcon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.photo.caption || t("photoAdded")}</p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{dateLabel}</span>
            </li>
          );
        }

        if (event.type === "note" && event.note) {
          return (
            <li key={`${event.type}-${event.id}`} className="flex items-start gap-3 border-b px-1 py-2.5 last:border-b-0">
              <div className="bg-muted text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                <StickyNoteIcon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.note.title || t("untitledNote")}</p>
                <p className="text-muted-foreground truncate text-xs">{event.note.body}</p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{dateLabel}</span>
            </li>
          );
        }

        return null;
      })}
    </ol>
  );
}
