"use client";

import { useLocale, useTranslations } from "next-intl";
import { PencilIcon, Trash2Icon } from "lucide-react";

import type { TripNote } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import { Card, CardContent } from "@/shared/components/ui/card";

export function NoteCard({ note, onEdit }: { note: TripNote; onEdit: (note: TripNote) => void }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const deleteNote = useTravelStore((s) => s.deleteNote);

  const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(note.updatedAt),
  );

  return (
    <Card className="group gap-2 py-3.5">
      <CardContent className="space-y-1.5 px-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 truncate text-sm font-medium">{note.title || t("untitledNote")}</h4>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="text-muted-foreground hover:text-foreground p-0.5"
              aria-label={t("actions.edit")}
            >
              <PencilIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => void deleteNote(note.id)}
              className="text-muted-foreground hover:text-destructive p-0.5"
              aria-label={t("actions.delete")}
            >
              <Trash2Icon className="size-3.5" />
            </button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{note.body}</p>
        <p className="text-muted-foreground text-[11px]">{dateLabel}</p>
      </CardContent>
    </Card>
  );
}
