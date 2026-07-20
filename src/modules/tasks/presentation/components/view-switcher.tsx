"use client";

import { useTranslations } from "next-intl";
import { CalendarDaysIcon, KanbanSquareIcon, ListIcon } from "lucide-react";

import type { TaskView } from "../../application/task-store";
import { useTaskStore } from "../../application/task-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function ViewSwitcher() {
  const t = useTranslations("tasks.views");
  const view = useTaskStore((s) => s.view);
  const setView = useTaskStore((s) => s.setView);

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as TaskView)}>
      <TabsList>
        <TabsTrigger value="kanban" className="gap-1.5">
          <KanbanSquareIcon className="size-3.5" />
          {t("kanban")}
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-1.5">
          <ListIcon className="size-3.5" />
          {t("list")}
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-1.5">
          <CalendarDaysIcon className="size-3.5" />
          {t("calendar")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
