"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";

import { TASK_PRIORITIES, EMPTY_FILTERS, type TaskPriority } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function TaskFiltersBar() {
  const t = useTranslations("tasks");
  const tPriority = useTranslations("tasks.priority");
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const labels = useTaskStore((s) => s.labels);

  const hasActiveFilters =
    filters.search.length > 0 || filters.priorities.length > 0 || filters.labelIds.length > 0;

  function togglePriority(priority: TaskPriority) {
    const next = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    setFilters({ priorities: next });
  }

  function toggleLabel(labelId: string) {
    const next = filters.labelIds.includes(labelId)
      ? filters.labelIds.filter((id) => id !== labelId)
      : [...filters.labelIds, labelId];
    setFilters({ labelIds: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t("filters.searchPlaceholder")}
          className="h-8 w-44 pl-8 text-sm sm:w-56"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("filters.priority")}
            {filters.priorities.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.priorities.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          {TASK_PRIORITIES.map((priority) => (
            <label
              key={priority}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={filters.priorities.includes(priority)}
                onCheckedChange={() => togglePriority(priority)}
              />
              {tPriority(priority)}
            </label>
          ))}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("filters.labels")}
            {filters.labelIds.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.labelIds.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          {labels.map((label) => (
            <label
              key={label.id}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={filters.labelIds.includes(label.id)}
                onCheckedChange={() => toggleLabel(label.id)}
              />
              <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </label>
          ))}
        </PopoverContent>
      </Popover>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
          {t("filters.clear")}
        </Button>
      ) : null}
    </div>
  );
}
