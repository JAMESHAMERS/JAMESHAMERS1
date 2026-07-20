"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import type { ItineraryItem } from "../../domain/types";
import { groupItineraryByDay, itineraryForTrip } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { ItineraryItemRow } from "../components/itinerary-item-row";
import { ItineraryDialog } from "../components/itinerary-dialog";

export function ItineraryTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const itineraryItems = useTravelStore((s) => s.itineraryItems);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = useMemo(() => itineraryForTrip(itineraryItems, tripId), [itineraryItems, tripId]);
  const groups = useMemo(() => groupItineraryByDay(items), [items]);

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(item: ItineraryItem) {
    setEditingId(item.id);
    setDialogOpen(true);
  }

  const editingItem = items.find((i) => i.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={openCreate}>
        <PlusIcon className="size-3.5" />
        {t("addItineraryItem")}
      </Button>

      {groups.length === 0 ? (
        <EmptyState title={t("noItineraryItems")} className="py-10" />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <section key={group.dayKey}>
              <p className="text-muted-foreground mb-2 px-1 text-xs font-medium capitalize">
                {new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(
                  group.date,
                )}
              </p>
              <div className="overflow-hidden rounded-lg border">
                {group.items.map((item) => (
                  <ItineraryItemRow key={item.id} item={item} onEdit={openEdit} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ItineraryDialog open={dialogOpen} onOpenChange={setDialogOpen} tripId={tripId} item={editingItem} />
    </div>
  );
}
