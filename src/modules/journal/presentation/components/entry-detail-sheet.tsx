"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { JournalEntry } from "../../domain/types";
import { isEntryEmpty } from "../../domain/rules";
import { useJournalStore } from "../../application/journal-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/composed/date-picker";
import { MoodPicker } from "./mood-picker";
import { TagPicker } from "./tag-picker";
import { TagChip } from "./tag-chip";
import { PhotoList } from "./photo-list";
import { VoiceNoteRecorder } from "./voice-note-recorder";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function EntryDetailSheet() {
  const t = useTranslations("journal.detail");
  const tCommon = useTranslations("journal");
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const entries = useJournalStore((s) => s.entries);
  const tags = useJournalStore((s) => s.tags);
  const photos = useJournalStore((s) => s.photos);
  const voiceNotes = useJournalStore((s) => s.voiceNotes);
  const closeEntry = useJournalStore((s) => s.closeEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const setEntryTags = useJournalStore((s) => s.setEntryTags);

  const entry = entries.find((e) => e.id === selectedEntryId) ?? null;
  const [displayEntry, setDisplayEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Both blocks below are React's documented "adjust state during render"
  // pattern (not an effect) — see tasks/presentation/components/task-detail-sheet.tsx
  // for the original write-up of why.

  // Keep `displayEntry` following the live store record — but only while an
  // entry is actually selected, so it still holds the last entry's data
  // during the sheet's close animation instead of going blank.
  if (entry && entry !== displayEntry) {
    setDisplayEntry(entry);
  }

  // Reset the editable fields only when the *selected entry itself*
  // changes, not on every field update to the same entry.
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  if (entry && entry.id !== editingEntryId) {
    setEditingEntryId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setConfirmingDelete(false);
  }

  if (!displayEntry) return null;

  const entryTags = tags.filter((tag) => displayEntry.tagIds.includes(tag.id));
  const entryPhotos = photos.filter((p) => p.entryId === displayEntry.id);
  const entryVoiceNotes = voiceNotes.filter((v) => v.entryId === displayEntry.id);

  function handleOpenChange(open: boolean) {
    if (open || !displayEntry) return;
    // A brand-new entry the user opened and then closed without writing
    // anything — clean it up instead of leaving a blank card in the feed.
    if (isEntryEmpty(displayEntry, photos, voiceNotes)) {
      void deleteEntry(displayEntry.id);
    }
    closeEntry();
  }

  return (
    <Sheet open={Boolean(entry)} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{displayEntry.title || t("untitled")}</SheetTitle>
          <SheetDescription>{t("editDescription")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 pt-10 pb-8">
          <Textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title !== displayEntry.title) void updateEntry(displayEntry.id, { title });
            }}
            placeholder={t("titlePlaceholder")}
            rows={1}
            className="min-h-0 resize-none border-none px-0 py-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />

          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              value={new Date(displayEntry.entryDate)}
              onChange={(d) => {
                if (d) void updateEntry(displayEntry.id, { entryDate: toDateKey(d) });
              }}
              className="bg-secondary"
            />
            <TagPicker
              selectedTagIds={displayEntry.tagIds}
              onChange={(tagIds) => void setEntryTags(displayEntry.id, tagIds)}
            />
          </div>

          {entryTags.length > 0 ? (
            <div className="-mt-3 flex flex-wrap gap-1.5">
              {entryTags.map((tag) => (
                <TagChip key={tag.id} tag={tag} />
              ))}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs">{t("mood")}</p>
            <MoodPicker value={displayEntry.mood} onChange={(mood) => void updateEntry(displayEntry.id, { mood })} />
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              if (content !== displayEntry.content) void updateEntry(displayEntry.id, { content });
            }}
            placeholder={t("contentPlaceholder")}
            className="min-h-40"
          />

          <Separator />

          <Section title={tCommon("photos")}>
            <PhotoList entryId={displayEntry.id} photos={entryPhotos} />
          </Section>

          <Separator />

          <Section title={tCommon("voiceNotes")}>
            <VoiceNoteRecorder entryId={displayEntry.id} voiceNotes={entryVoiceNotes} />
          </Section>

          <Separator />

          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t("confirmDelete")}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  void deleteEntry(displayEntry.id);
                }}
              >
                {t("delete")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                {t("cancel")}
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive w-fit gap-1.5"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2Icon className="size-3.5" />
              {t("delete")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
