"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon, XIcon } from "lucide-react";

import type { Subtask } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

export function SubtaskList({ taskId, subtasks }: { taskId: string; subtasks: Subtask[] }) {
  const t = useTranslations("tasks.detail");
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const [title, setTitle] = useState("");

  const done = subtasks.filter((s) => s.done).length;
  const percent = subtasks.length === 0 ? 0 : Math.round((done / subtasks.length) * 100);

  function handleAdd() {
    const value = title.trim();
    if (!value) return;
    void addSubtask(taskId, value);
    setTitle("");
  }

  return (
    <div className="space-y-2.5">
      {subtasks.length > 0 ? (
        <div className="flex items-center gap-2">
          <Progress value={percent} className="h-1.5" />
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
            {done}/{subtasks.length}
          </span>
        </div>
      ) : null}

      <ul className="space-y-1">
        {subtasks.map((subtask) => (
          <li key={subtask.id} className="group hover:bg-accent/50 flex items-center gap-2 rounded-md px-1.5 py-1">
            <Checkbox
              checked={subtask.done}
              onCheckedChange={() => void toggleSubtask(taskId, subtask.id)}
            />
            <span className={cn("flex-1 text-sm", subtask.done && "text-muted-foreground line-through")}>
              {subtask.title}
            </span>
            <button
              type="button"
              onClick={() => void deleteSubtask(taskId, subtask.id)}
              className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
            >
              <XIcon className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-1.5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("addSubtask")}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleAdd}>
          <PlusIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
