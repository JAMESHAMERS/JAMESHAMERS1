"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CameraIcon } from "lucide-react";

import { ITINERARY_CATEGORIES } from "../../domain/types";
import { itineraryForTrip, photosForTrip } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { ITINERARY_CATEGORY_META } from "../travel-meta";
import { TripMap } from "../components/trip-map";

export function MapTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const itineraryItems = useTravelStore((s) => s.itineraryItems);
  const photos = useTravelStore((s) => s.photos);

  const items = useMemo(() => itineraryForTrip(itineraryItems, tripId), [itineraryItems, tripId]);
  const tripPhotos = useMemo(() => photosForTrip(photos, tripId), [photos, tripId]);

  const usedCategories = ITINERARY_CATEGORIES.filter((c) => items.some((i) => i.category === c));

  return (
    <div className="flex flex-col gap-3">
      <TripMap itineraryItems={items} photos={tripPhotos} emptyLabel={t("noMapPoints")} />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        {usedCategories.map((category) => {
          const meta = ITINERARY_CATEGORY_META[category];
          return (
            <span key={category} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.chartColor }} />
              <span className="text-muted-foreground">{t(`itineraryCategory.${category}`)}</span>
            </span>
          );
        })}
        {tripPhotos.some((p) => p.lat !== null && p.lng !== null) ? (
          <span className="flex items-center gap-1.5">
            <span className="bg-chart-accent flex size-2.5 items-center justify-center rounded-full">
              <CameraIcon className="size-full text-white" />
            </span>
            <span className="text-muted-foreground">{t("photos")}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
