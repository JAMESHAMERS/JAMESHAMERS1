"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { Task } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
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
import { StatusSelect } from "./status-select";
import { PrioritySelect } from "./priority-select";
import { LabelPicker } from "./label-picker";
import { LabelChip } from "./label-chip";
import { DueDateField } from "./due-date-field";
import { SubtaskList } from "./subtask-list";
import { AttachmentList } from "./attachment-list";
import { CommentList } from "./comment-list";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

export function TaskDetailSheet() {
  const t = useTranslations("tasks.detail");
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const labels = useTaskStore((s) => s.labels);
  const selectTask = useTaskStore((s) => s.selectTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const setTaskLabels = useTaskStore((s) => s.setTaskLabels);

  const task = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const [displayTask, setDisplayTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Both blocks below are React's documented "adjust state during render"
  // pattern (not an effect — https://react.dev/learn/you-might-not-need-an-effect),
  // since a `useEffect` here would reset local edits a tick after the store
  // updates, causing a visible flash of stale values.

  // Keep `displayTask` following the live store record — but only while a
  // task is actually selected, so it still holds the last task's data
  // during the sheet's close animation instead of going blank.
  if (task && task !== displayTask) {
    setDisplayTask(task);
  }

  // Reset the editable fields only when the *selected task itself* changes,
  // not on every field update to the same task (e.g. ticking a subtask
  // shouldn't discard an in-progress title edit).
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  if (task && task.id !== editingTaskId) {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setConfirmingDelete(false);
  }

  if (!displayTask) return null;
  const taskLabels = labels.filter((l) => displayTask.labelIds.includes(l.id));

  return (
    <Sheet
      open={Boolean(task)}
      onOpenChange={(open) => {
        if (!open) selectTask(null);
      }}
    >
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>{displayTask.title || t("untitled")}</SheetTitle>
          <SheetDescription>{t("editDescription")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 pt-10 pb-8">
          <Textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title.trim() && title !== displayTask.title) {
                void updateTask(displayTask.id, { title: title.trim() });
              } else {
                setTitle(displayTask.title);
              }
            }}
            rows={1}
            className="min-h-0 resize-none border-none px-0 py-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />

          <div className="flex flex-wrap items-center gap-2">
            <StatusSelect
              value={displayTask.status}
              onChange={(status) => void updateTask(displayTask.id, { status })}
              className="bg-secondary"
            />
            <PrioritySelect
              value={displayTask.priority}
              onChange={(priority) => void updateTask(displayTask.id, { priority })}
              className="bg-secondary"
            />
            <LabelPicker
              selectedLabelIds={displayTask.labelIds}
              onChange={(labelIds) => void setTaskLabels(displayTask.id, labelIds)}
            />
          </div>

          {taskLabels.length > 0 ? (
            <div className="-mt-3 flex flex-wrap gap-1.5">
              {taskLabels.map((label) => (
                <LabelChip key={label.id} label={label} />
              ))}
            </div>
          ) : null}

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (description !== displayTask.description) {
                void updateTask(displayTask.id, { description });
              }
            }}
            placeholder={t("descriptionPlaceholder")}
            className="min-h-20"
          />

          <DueDateField
            dueDate={displayTask.dueDate}
            reminderAt={displayTask.reminderAt}
            onChangeDueDate={(dueDate) => void updateTask(displayTask.id, { dueDate })}
            onChangeReminder={(reminderAt) => void updateTask(displayTask.id, { reminderAt })}
          />

          <Separator />

          <Section title={t("subtasks")}>
            <SubtaskList taskId={displayTask.id} subtasks={displayTask.subtasks} />
          </Section>

          <Separator />

          <Section title={t("attachments")}>
            <AttachmentList taskId={displayTask.id} attachments={displayTask.attachments} />
          </Section>

          <Separator />

          <Section title={t("comments")}>
            <CommentList taskId={displayTask.id} comments={displayTask.comments} />
          </Section>

          <Separator />

          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t("confirmDelete")}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  void deleteTask(displayTask.id);
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
