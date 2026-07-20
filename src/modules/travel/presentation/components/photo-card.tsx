"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { TripPhoto } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import { Button } from "@/shared/components/ui/button";

export function PhotoCard({ photo }: { photo: TripPhoto }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const deletePhoto = useTravelStore((s) => s.deletePhoto);

  const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(photo.takenAt),
  );

  return (
    <div className="group relative overflow-hidden rounded-lg border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.caption} className="aspect-[4/3] w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
        {photo.caption ? <p className="truncate text-xs font-medium text-white">{photo.caption}</p> : null}
        <p className="text-[11px] text-white/80">{dateLabel}</p>
      </div>
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-1.5 right-1.5 size-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => void deletePhoto(photo.id)}
        aria-label={t("actions.delete")}
      >
        <Trash2Icon className="size-3" />
      </Button>
    </div>
  );
}
