"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon, TagIcon } from "lucide-react";

import { TAG_COLORS } from "../../domain/types";
import { useJournalStore } from "../../application/journal-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function TagPicker({
  selectedTagIds,
  onChange,
}: {
  selectedTagIds: string[];
  /** Fully controlled: receives the complete next set of selected tag ids. */
  onChange: (tagIds: string[]) => void;
}) {
  const t = useTranslations("journal");
  const tags = useJournalStore((s) => s.tags);
  const createTag = useJournalStore((s) => s.createTag);
  const [newName, setNewName] = useState("");

  function toggle(tagId: string) {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(next);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const color = TAG_COLORS[tags.length % TAG_COLORS.length];
    const tag = await createTag({ name, color });
    setNewName("");
    onChange([...selectedTagIds, tag.id]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <TagIcon className="size-3.5" />
          {t("tags")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox checked={selectedTagIds.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} />
              <span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </label>
          ))}
          {tags.length === 0 ? <p className="text-muted-foreground px-2 py-1.5 text-xs">{t("noTags")}</p> : null}
        </div>
        <div className="mt-2 flex gap-1.5 border-t pt-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("newTag")}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <Button size="sm" className="h-7 px-2" onClick={handleCreate}>
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
