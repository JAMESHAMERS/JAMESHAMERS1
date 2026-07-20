"use client";

import { useTranslations } from "next-intl";

import { TASK_PRIORITIES, type TaskPriority } from "../../domain/types";
import { PRIORITY_META } from "../task-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function PrioritySelect({
  value,
  onChange,
  className,
}: {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  className?: string;
}) {
  const t = useTranslations("tasks.priority");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskPriority)}>
      <SelectTrigger size="sm" className={cn("w-fit gap-1.5 border-none shadow-none", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_PRIORITIES.map((priority) => {
          const { icon: Icon, className: colorClassName } = PRIORITY_META[priority];
          return (
            <SelectItem key={priority} value={priority}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-3.5", colorClassName)} />
                {t(priority)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
