"use client";

import { useLocale, useTranslations } from "next-intl";
import { ImageIcon, MicIcon } from "lucide-react";

import type { JournalEntry } from "../../domain/types";
import { useJournalStore } from "../../application/journal-store";
import { cn } from "@/shared/lib/utils";
import { MOOD_META } from "../journal-meta";
import { TagChip } from "./tag-chip";

export function EntryCard({ entry }: { entry: JournalEntry }) {
  const t = useTranslations("journal");
  const locale = useLocale();
  const tags = useJournalStore((s) => s.tags);
  const photos = useJournalStore((s) => s.photos);
  const voiceNotes = useJournalStore((s) => s.voiceNotes);
  const openEntry = useJournalStore((s) => s.openEntry);

  const entryTags = tags.filter((tag) => entry.tagIds.includes(tag.id));
  const photoCount = photos.filter((p) => p.entryId === entry.id).length;
  const voiceCount = voiceNotes.filter((v) => v.entryId === entry.id).length;
  const moodMeta = entry.mood ? MOOD_META[entry.mood] : null;
  const MoodIcon = moodMeta?.icon;

  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(entry.entryDate),
  );

  return (
    <button
      type="button"
      onClick={() => openEntry(entry.id)}
      className="hover:bg-accent/40 flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors"
    >
      <div
        className={cn(
          "bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          moodMeta?.className,
        )}
      >
        {MoodIcon ? <MoodIcon className="size-4" /> : <span className="text-muted-foreground text-xs">—</span>}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-medium">{entry.title || t("untitledEntry")}</h3>
          <span className="text-muted-foreground shrink-0 text-xs capitalize">{dateLabel}</span>
        </div>
        {entry.content ? <p className="text-muted-foreground line-clamp-2 text-sm">{entry.content}</p> : null}
        {entryTags.length > 0 || photoCount > 0 || voiceCount > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {entryTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
            {photoCount > 0 ? (
              <span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
                <ImageIcon className="size-3" />
                {photoCount}
              </span>
            ) : null}
            {voiceCount > 0 ? (
              <span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
                <MicIcon className="size-3" />
                {voiceCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}
