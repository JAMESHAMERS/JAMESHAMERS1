"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PlaneIcon } from "lucide-react";

import type { Trip } from "../../domain/types";
import { sortTripsByStartDate } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { TripCard } from "../components/trip-card";

export function TripsTab({ onEdit }: { onEdit: (trip: Trip) => void }) {
  const t = useTranslations("travel");
  const trips = useTravelStore((s) => s.trips);

  const sorted = useMemo(() => sortTripsByStartDate(trips), [trips]);

  if (sorted.length === 0) {
    return <EmptyState icon={PlaneIcon} title={t("noTrips")} description={t("noTripsHint")} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((trip) => (
        <TripCard key={trip.id} trip={trip} onEdit={onEdit} />
      ))}
    </div>
  );
}
