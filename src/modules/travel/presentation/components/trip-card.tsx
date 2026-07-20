"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { Trip } from "../../domain/types";
import { budgetProgress, tripStatus } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { TRIP_STATUS_META } from "../travel-meta";

export function TripCard({ trip, onEdit }: { trip: Trip; onEdit: (trip: Trip) => void }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const expenses = useTravelStore((s) => s.expenses);
  const openTrip = useTravelStore((s) => s.openTrip);
  const deleteTrip = useTravelStore((s) => s.deleteTrip);

  const status = tripStatus(trip);
  const statusMeta = TRIP_STATUS_META[status];
  const progress = budgetProgress(trip, expenses);

  const dateRange = `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(trip.startDate),
  )} – ${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(trip.endDate),
  )}`;

  return (
    <Card className="group gap-0 overflow-hidden py-0">
      <button
        type="button"
        onClick={() => openTrip(trip.id)}
        className="block w-full text-left"
      >
        <div
          className="flex h-24 items-end justify-between p-4"
          style={{ backgroundColor: trip.coverColor }}
        >
          {/* `bg-background` forced last (wins over the badge's own translucent
              tint) — this pill sits on the trip's arbitrary `coverColor`, not
              the app background, so it needs an opaque backing regardless of
              what color the user picked. */}
          <Badge className={cn("border", statusMeta.badgeClassName, "bg-background")}>
            {t(`status.${status}`)}
          </Badge>
        </div>
        <CardContent className="space-y-2.5 p-4">
          <div>
            <h3 className="truncate text-sm font-semibold">{trip.name}</h3>
            <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
              <MapPinIcon className="size-3 shrink-0" />
              {trip.destination}
            </p>
          </div>

          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarIcon className="size-3 shrink-0" />
            {dateRange}
          </p>

          {trip.budget > 0 ? (
            <div className="space-y-1">
              <Progress
                value={progress.percent}
                indicatorClassName={cn(progress.isOver && "bg-destructive")}
                className="h-1.5"
              />
              <div className="flex items-center justify-between text-[11px]">
                <span className={cn("font-medium tabular-nums", progress.isOver && "text-destructive")}>
                  {formatCurrency(progress.spent, locale)}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {t("budget.ofLimit", { limit: formatCurrency(progress.limit, locale) })}
                </span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </button>

      <div className="flex items-center justify-end gap-1 border-t px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(trip)}
          className="text-muted-foreground hover:text-foreground rounded-sm p-1"
          aria-label={t("actions.edit")}
        >
          <PencilIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => void deleteTrip(trip.id)}
          className="text-muted-foreground hover:text-destructive rounded-sm p-1"
          aria-label={t("actions.delete")}
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>
    </Card>
  );
}
