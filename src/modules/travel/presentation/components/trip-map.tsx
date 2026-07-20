"use client";

import { CameraIcon } from "lucide-react";

import type { ItineraryItem, TripPhoto } from "../../domain/types";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { ITINERARY_CATEGORY_META } from "../travel-meta";

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
  icon: typeof CameraIcon;
}

/**
 * Abstract equirectangular-projection pin map — a lightweight custom
 * visualization rather than an embedded tile provider, since this app has
 * no map API key/network dependency to lean on (same "no external service"
 * constraint that keeps charts self-contained elsewhere). Points are
 * projected into the bounding box of the trip's own coordinates (plus
 * padding), not the whole globe, so a cluster of nearby pins doesn't look
 * like a single dot.
 */
export function TripMap({
  itineraryItems,
  photos,
  emptyLabel,
}: {
  itineraryItems: ItineraryItem[];
  photos: TripPhoto[];
  emptyLabel: string;
}) {
  const pins: MapPin[] = [
    ...itineraryItems
      .filter((i): i is ItineraryItem & { lat: number; lng: number } => i.lat !== null && i.lng !== null)
      .map((i) => ({
        id: `item-${i.id}`,
        lat: i.lat,
        lng: i.lng,
        label: i.title,
        color: ITINERARY_CATEGORY_META[i.category].chartColor,
        icon: ITINERARY_CATEGORY_META[i.category].icon,
      })),
    ...photos
      .filter((p): p is TripPhoto & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
      .map((p) => ({
        id: `photo-${p.id}`,
        lat: p.lat,
        lng: p.lng,
        label: p.caption || "",
        color: "var(--chart-accent)",
        icon: CameraIcon,
      })),
  ];

  if (pins.length === 0) {
    return <EmptyState title={emptyLabel} className="py-10" />;
  }

  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.25, 3);
  const lngPad = Math.max((maxLng - minLng) * 0.25, 3);
  const bounds = {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };

  function project(lat: number, lng: number) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  }

  const gridLines = [1, 2, 3, 4, 5];

  return (
    <div className="bg-muted/30 relative aspect-[4/3] w-full overflow-hidden rounded-lg border">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {gridLines.map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i * 100) / 6}%`}
            x2="100%"
            y2={`${(i * 100) / 6}%`}
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        {gridLines.map((i) => (
          <line
            key={`v${i}`}
            x1={`${(i * 100) / 6}%`}
            y1="0"
            x2={`${(i * 100) / 6}%`}
            y2="100%"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
      </svg>

      {pins.map((pin) => {
        const { x, y } = project(pin.lat, pin.lng);
        const Icon = pin.icon;
        return (
          <div
            key={pin.id}
            className="group absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="border-background flex size-6 items-center justify-center rounded-full border-2 shadow"
              style={{ backgroundColor: pin.color }}
            >
              <Icon className="size-3.5 text-white" />
            </div>
            {pin.label ? (
              <div className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-md px-2 py-1 text-[11px] whitespace-nowrap shadow group-hover:block">
                {pin.label}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
