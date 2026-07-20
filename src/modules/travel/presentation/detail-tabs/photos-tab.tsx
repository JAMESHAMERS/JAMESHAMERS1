"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CameraIcon, PlusIcon } from "lucide-react";

import { photosForTrip } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { PhotoCard } from "../components/photo-card";
import { PhotoDialog } from "../components/photo-dialog";

export function PhotosTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const photos = useTravelStore((s) => s.photos);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tripPhotos = useMemo(() => photosForTrip(photos, tripId), [photos, tripId]);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => setDialogOpen(true)}>
        <PlusIcon className="size-3.5" />
        {t("addPhoto")}
      </Button>

      {tripPhotos.length === 0 ? (
        <EmptyState icon={CameraIcon} title={t("noPhotos")} className="py-10" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tripPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}

      <PhotoDialog open={dialogOpen} onOpenChange={setDialogOpen} tripId={tripId} />
    </div>
  );
}
