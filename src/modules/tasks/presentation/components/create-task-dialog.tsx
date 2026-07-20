"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { TaskPriority, TaskStatus } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/composed/date-picker";
import { toDateKey } from "@/shared/lib/date-grid";
import { StatusSelect } from "./status-select";
import { PrioritySelect } from "./priority-select";
import { LabelPicker } from "./label-picker";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus: TaskStatus;
}

export function CreateTaskDialog({ open, onOpenChange, initialStatus }: CreateTaskDialogProps) {
  const t = useTranslations("tasks");
  const createTask = useTaskStore((s) => s.createTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Reset the form exactly once per open, computed during render rather
  // than in an effect (React's recommended pattern for "adjust state when
  // a value changes" — https://react.dev/learn/you-might-not-need-an-effect).
  // `CreateTaskDialog` itself never unmounts between opens (only the Radix
  // dialog content does), so a plain useState initializer wouldn't reset.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
      setPriority("medium");
      setDueDate(null);
      setLabelIds([]);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? toDateKey(dueDate) : null,
        labelIds,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("create.namePlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("detail.descriptionPlaceholder")}
            className="min-h-16"
          />

          <div className="flex flex-wrap items-center gap-2">
            <StatusSelect value={status} onChange={setStatus} className="bg-secondary" />
            <PrioritySelect value={priority} onChange={setPriority} className="bg-secondary" />
            <LabelPicker selectedLabelIds={labelIds} onChange={setLabelIds} />
          </div>

          <DatePicker value={dueDate} onChange={setDueDate} placeholder={t("detail.dueDate")} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {t("create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
