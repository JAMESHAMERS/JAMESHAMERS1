"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import type { Trip } from "../domain/types";
import { useTravelStore } from "../application/travel-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { Button } from "@/shared/components/ui/button";
import { TravelProvider } from "./travel-provider";
import { TabSwitcher } from "./components/tab-switcher";
import { TripDialog } from "./components/trip-dialog";
import { TripDetailSheet } from "./components/trip-detail-sheet";
import { TripsTab } from "./tabs/trips-tab";
import { StatisticsTab } from "./tabs/statistics-tab";

export function TravelView() {
  const t = useTranslations("modules.travel");
  const tTravel = useTranslations("travel");
  const tab = useTravelStore((s) => s.tab);
  const setTab = useTravelStore((s) => s.setTab);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  function openCreate() {
    setEditingTrip(null);
    setDialogOpen(true);
  }

  function openEdit(trip: Trip) {
    setEditingTrip(trip);
    setDialogOpen(true);
  }

  return (
    <TravelProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button
              onClick={() => {
                setTab("trips");
                openCreate();
              }}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" />
              {tTravel("addTrip")}
            </Button>
          }
        />

        <TabSwitcher />

        {tab === "trips" ? <TripsTab onEdit={openEdit} /> : null}
        {tab === "statistics" ? <StatisticsTab /> : null}
      </div>

      <TripDialog open={dialogOpen} onOpenChange={setDialogOpen} trip={editingTrip} />
      <TripDetailSheet onEdit={openEdit} />
    </TravelProvider>
  );
}
