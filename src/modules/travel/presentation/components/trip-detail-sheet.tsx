"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3Icon,
  CalendarIcon,
  ImageIcon,
  ListIcon,
  MapIcon,
  MapPinIcon,
  PencilIcon,
  StickyNoteIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";

import type { Trip } from "../../domain/types";
import { budgetProgress, tripDurationDays, tripStatus } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import type { TripDetailTab } from "../../application/travel-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { TRIP_STATUS_META } from "../travel-meta";
import { ItineraryTab } from "../detail-tabs/itinerary-tab";
import { ExpensesTab } from "../detail-tabs/expenses-tab";
import { PhotosTab } from "../detail-tabs/photos-tab";
import { MapTab } from "../detail-tabs/map-tab";
import { NotesTab } from "../detail-tabs/notes-tab";
import { TimelineTab } from "../detail-tabs/timeline-tab";

export function TripDetailSheet({ onEdit }: { onEdit: (trip: Trip) => void }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const trips = useTravelStore((s) => s.trips);
  const expenses = useTravelStore((s) => s.expenses);
  const selectedTripId = useTravelStore((s) => s.selectedTripId);
  const closeTrip = useTravelStore((s) => s.closeTrip);
  const detailTab = useTravelStore((s) => s.detailTab);
  const setDetailTab = useTravelStore((s) => s.setDetailTab);
  const deleteTrip = useTravelStore((s) => s.deleteTrip);

  const trip = trips.find((t) => t.id === selectedTripId) ?? null;
  const [displayTrip, setDisplayTrip] = useState<Trip | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // React's "adjust state during render" pattern — see task-detail-sheet.tsx
  // for why: keeps `displayTrip` following the live store record, but only
  // holds the last trip's data during the sheet's close animation instead
  // of going blank.
  if (trip && trip !== displayTrip) {
    setDisplayTrip(trip);
  }
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  if (trip && trip.id !== openTripId) {
    setOpenTripId(trip.id);
    setConfirmingDelete(false);
  }

  if (!displayTrip) return null;

  const status = tripStatus(displayTrip);
  const statusMeta = TRIP_STATUS_META[status];
  const progress = budgetProgress(displayTrip, expenses);
  const dateRange = `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(displayTrip.startDate),
  )} – ${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(displayTrip.endDate),
  )}`;

  return (
    <Sheet
      open={Boolean(trip)}
      onOpenChange={(open) => {
        if (!open) closeTrip();
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-2xl">
        <SheetHeader className="gap-3 border-b pb-4">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg">{displayTrip.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-1">
                <MapPinIcon className="size-3.5 shrink-0" />
                {displayTrip.destination}
              </SheetDescription>
            </div>
            <Badge className={cn("border shrink-0", statusMeta.badgeClassName)}>{t(`status.${status}`)}</Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              {dateRange}
            </span>
            <span>{t("days", { count: tripDurationDays(displayTrip) })}</span>
          </div>

          {displayTrip.budget > 0 ? (
            <div className="space-y-1">
              <Progress value={progress.percent} indicatorClassName={cn(progress.isOver && "bg-destructive")} className="h-1.5" />
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

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(displayTrip)}>
              <PencilIcon className="size-3.5" />
              {t("actions.edit")}
            </Button>
            {confirmingDelete ? (
              <>
                <span className="text-muted-foreground text-xs">{t("confirmDeleteTrip")}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    void deleteTrip(displayTrip.id);
                  }}
                >
                  {t("actions.delete")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  {t("actions.cancel")}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2Icon className="size-3.5" />
                {t("actions.delete")}
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs
          value={detailTab}
          onValueChange={(v) => setDetailTab(v as TripDetailTab)}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="overflow-x-auto px-4 pt-3">
            <TabsList>
              <TabsTrigger value="itinerary" className="gap-1.5">
                <ListIcon className="size-3.5" />
                {t("detailTabs.itinerary")}
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-1.5">
                <WalletIcon className="size-3.5" />
                {t("detailTabs.expenses")}
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-1.5">
                <ImageIcon className="size-3.5" />
                {t("detailTabs.photos")}
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-1.5">
                <MapIcon className="size-3.5" />
                {t("detailTabs.map")}
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <StickyNoteIcon className="size-3.5" />
                {t("detailTabs.notes")}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1.5">
                <BarChart3Icon className="size-3.5" />
                {t("detailTabs.timeline")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <TabsContent value="itinerary">
              <ItineraryTab tripId={displayTrip.id} />
            </TabsContent>
            <TabsContent value="expenses">
              <ExpensesTab tripId={displayTrip.id} />
            </TabsContent>
            <TabsContent value="photos">
              <PhotosTab tripId={displayTrip.id} />
            </TabsContent>
            <TabsContent value="map">
              <MapTab tripId={displayTrip.id} />
            </TabsContent>
            <TabsContent value="notes">
              <NotesTab tripId={displayTrip.id} />
            </TabsContent>
            <TabsContent value="timeline">
              <TimelineTab tripId={displayTrip.id} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
