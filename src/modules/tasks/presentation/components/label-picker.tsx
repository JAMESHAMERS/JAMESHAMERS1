"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon, TagIcon } from "lucide-react";

import { useTaskStore } from "../../application/task-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

const PALETTE = ["#8b5cf6", "#0ea5e9", "#22c55e", "#ef4444", "#f59e0b", "#ec4899", "#14b8a6", "#6366f1"];

export function LabelPicker({
  selectedLabelIds,
  onChange,
}: {
  selectedLabelIds: string[];
  /** Fully controlled: receives the complete next set of selected label ids. */
  onChange: (labelIds: string[]) => void;
}) {
  const t = useTranslations("tasks.detail");
  const labels = useTaskStore((s) => s.labels);
  const createLabel = useTaskStore((s) => s.createLabel);
  const [newName, setNewName] = useState("");

  function toggle(labelId: string) {
    const next = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter((id) => id !== labelId)
      : [...selectedLabelIds, labelId];
    onChange(next);
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const color = PALETTE[labels.length % PALETTE.length];
    const label = await createLabel({ name, color });
    setNewName("");
    onChange([...selectedLabelIds, label.id]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <TagIcon className="size-3.5" />
          {t("labels")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {labels.map((label) => (
            <label
              key={label.id}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={selectedLabelIds.includes(label.id)}
                onCheckedChange={() => toggle(label.id)}
              />
              <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </label>
          ))}
          {labels.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">{t("noLabels")}</p>
          ) : null}
        </div>
        <div className="mt-2 flex gap-1.5 border-t pt-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("newLabel")}
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
