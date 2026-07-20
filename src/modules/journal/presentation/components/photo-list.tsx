"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ImagePlusIcon, XIcon } from "lucide-react";

import type { JournalPhoto } from "../../domain/types";
import { useJournalStore } from "../../application/journal-store";
import { Button } from "@/shared/components/ui/button";

export function PhotoList({ entryId, photos }: { entryId: string; photos: JournalPhoto[] }) {
  const t = useTranslations("journal");
  const addPhoto = useJournalStore((s) => s.addPhoto);
  const deletePhoto = useJournalStore((s) => s.deletePhoto);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2.5">
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => void deletePhoto(photo.id)}
                className="bg-background/80 text-muted-foreground hover:text-destructive absolute top-1 right-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t("actions.delete")}
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void addPhoto({ entryId, url: URL.createObjectURL(file) });
          e.target.value = "";
        }}
      />
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()}>
        <ImagePlusIcon className="size-3.5" />
        {t("addPhoto")}
      </Button>
    </div>
  );
}
