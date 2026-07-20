"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import type { TaskStatus } from "../domain/types";
import { useTaskStore } from "../application/task-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { Button } from "@/shared/components/ui/button";
import { TaskProvider } from "./task-provider";
import { ViewSwitcher } from "./components/view-switcher";
import { TaskFiltersBar } from "./components/task-filters-bar";
import { KanbanView } from "./views/kanban-view";
import { ListView } from "./views/list-view";
import { CalendarView } from "./views/calendar-view";
import { TaskDetailSheet } from "./components/task-detail-sheet";
import { CreateTaskDialog } from "./components/create-task-dialog";

export function TasksView() {
  const t = useTranslations("modules.tasks");
  const tTasks = useTranslations("tasks");
  const view = useTaskStore((s) => s.view);

  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("todo");

  function openCreate(status: TaskStatus = "todo") {
    setCreateStatus(status);
    setCreateOpen(true);
  }

  return (
    <TaskProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button onClick={() => openCreate()} className="gap-1.5">
              <PlusIcon className="size-4" />
              {tTasks("actions.newTask")}
            </Button>
          }
        />

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <ViewSwitcher />
          <TaskFiltersBar />
        </div>

        {view === "kanban" ? <KanbanView onAddTask={openCreate} /> : null}
        {view === "list" ? <ListView /> : null}
        {view === "calendar" ? <CalendarView /> : null}
      </div>

      <TaskDetailSheet />
      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} initialStatus={createStatus} />
    </TaskProvider>
  );
}
