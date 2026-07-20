"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";

import { EMPTY_FILTERS, MOOD_LEVELS, type MoodLevel } from "../../domain/types";
import { useJournalStore } from "../../application/journal-store";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { MOOD_META } from "../journal-meta";

export function EntryFiltersBar() {
  const t = useTranslations("journal");
  const tMood = useTranslations("journal.mood");
  const filters = useJournalStore((s) => s.filters);
  const setFilters = useJournalStore((s) => s.setFilters);
  const tags = useJournalStore((s) => s.tags);

  const hasActiveFilters =
    filters.search.length > 0 || filters.tagIds.length > 0 || filters.moods.length > 0;

  function toggleMood(mood: MoodLevel) {
    const next = filters.moods.includes(mood)
      ? filters.moods.filter((m) => m !== mood)
      : [...filters.moods, mood];
    setFilters({ moods: next });
  }

  function toggleTag(tagId: string) {
    const next = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((id) => id !== tagId)
      : [...filters.tagIds, tagId];
    setFilters({ tagIds: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t("searchPlaceholder")}
          className="h-8 w-44 pl-8 text-sm sm:w-56"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("mood.label")}
            {filters.moods.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.moods.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          {MOOD_LEVELS.map((mood) => {
            const { icon: Icon, className } = MOOD_META[mood];
            return (
              <label
                key={mood}
                className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <Checkbox checked={filters.moods.includes(mood)} onCheckedChange={() => toggleMood(mood)} />
                <Icon className={cn("size-3.5", className)} />
                {tMood(mood)}
              </label>
            );
          })}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("tags")}
            {filters.tagIds.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.tagIds.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {tags.length === 0 ? (
              <p className="text-muted-foreground px-2 py-1.5 text-xs">{t("noTags")}</p>
            ) : (
              tags.map((tag) => (
                <label
                  key={tag.id}
                  className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <Checkbox checked={filters.tagIds.includes(tag.id)} onCheckedChange={() => toggleTag(tag.id)} />
                  <span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
          {t("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
