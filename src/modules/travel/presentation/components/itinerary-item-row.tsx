"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPinIcon, Trash2Icon } from "lucide-react";

import type { ItineraryItem } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import { ITINERARY_CATEGORY_META } from "../travel-meta";
import { cn } from "@/shared/lib/utils";

export function ItineraryItemRow({
  item,
  onEdit,
}: {
  item: ItineraryItem;
  onEdit: (item: ItineraryItem) => void;
}) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const deleteItineraryItem = useTravelStore((s) => s.deleteItineraryItem);
  const { icon: Icon, className } = ITINERARY_CATEGORY_META[item.category];

  const timeLabel = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(
    new Date(item.startAt),
  );
  const endTimeLabel = item.endAt
    ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(item.endAt))
    : null;

  return (
    <div className="hover:bg-accent/40 group flex items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0">
      <div className={cn("bg-muted flex size-8 shrink-0 items-center justify-center rounded-full", className)}>
        <Icon className="size-4" />
      </div>

      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="truncate text-sm font-medium">{item.title}</span>
        <div className="flex flex-wrap items-center gap-2">
          {item.location ? (
            <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
              <MapPinIcon className="size-3 shrink-0" />
              {item.location}
            </span>
          ) : null}
        </div>
      </button>

      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {timeLabel}
        {endTimeLabel ? ` – ${endTimeLabel}` : ""}
      </span>

      <button
        type="button"
        onClick={() => void deleteItineraryItem(item.id)}
        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={t("actions.delete")}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}
