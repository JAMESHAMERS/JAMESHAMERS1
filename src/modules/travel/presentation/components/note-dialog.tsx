"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { TripNote } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  note?: TripNote | null;
}

export function NoteDialog({ open, onOpenChange, tripId, note }: NoteDialogProps) {
  const t = useTranslations("travel");
  const createNote = useTravelStore((s) => s.createNote);
  const updateNote = useTravelStore((s) => s.updateNote);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's "adjust state during render" pattern — see finance's transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (note?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setTitle(note?.title ?? "");
      setBody(note?.body ?? "");
    }
  }

  async function handleSubmit() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const input = { title: title.trim(), body: body.trim() };
      if (note) {
        await updateNote(note.id, input);
      } else {
        await createNote({ tripId, ...input });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{note ? t("editNote") : t("addNote")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("title")}</Label>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("noteTitlePlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("noteBody")}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("noteBodyPlaceholder")}
              className="min-h-28"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!body.trim() || submitting}>
            {note ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
