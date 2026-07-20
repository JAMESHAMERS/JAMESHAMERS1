"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon, StickyNoteIcon } from "lucide-react";

import type { TripNote } from "../../domain/types";
import { notesForTrip } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { NoteCard } from "../components/note-card";
import { NoteDialog } from "../components/note-dialog";

export function NotesTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const notes = useTravelStore((s) => s.notes);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const tripNotes = useMemo(() => notesForTrip(notes, tripId), [notes, tripId]);

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(note: TripNote) {
    setEditingId(note.id);
    setDialogOpen(true);
  }

  const editingNote = tripNotes.find((n) => n.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={openCreate}>
        <PlusIcon className="size-3.5" />
        {t("addNote")}
      </Button>

      {tripNotes.length === 0 ? (
        <EmptyState icon={StickyNoteIcon} title={t("noNotes")} className="py-10" />
      ) : (
        <div className="flex flex-col gap-3">
          {tripNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} />
          ))}
        </div>
      )}

      <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} tripId={tripId} note={editingNote} />
    </div>
  );
}
