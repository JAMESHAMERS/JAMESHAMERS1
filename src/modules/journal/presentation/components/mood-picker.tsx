"use client";

import { useTranslations } from "next-intl";

import { MOOD_LEVELS, type MoodLevel } from "../../domain/types";
import { cn } from "@/shared/lib/utils";
import { MOOD_META } from "../journal-meta";

export function MoodPicker({
  value,
  onChange,
}: {
  value: MoodLevel | null;
  onChange: (mood: MoodLevel | null) => void;
}) {
  const t = useTranslations("journal.mood");

  return (
    <div className="flex gap-1.5">
      {MOOD_LEVELS.map((mood) => {
        const { icon: Icon, className } = MOOD_META[mood];
        const selected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            title={t(mood)}
            onClick={() => onChange(selected ? null : mood)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border transition-colors",
              selected ? cn("bg-muted border-transparent", className) : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
