"use client";

import { useTranslations } from "next-intl";

import { TASK_STATUSES, type TaskStatus } from "../../domain/types";
import { STATUS_META } from "../task-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
}) {
  const t = useTranslations("tasks.status");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskStatus)}>
      <SelectTrigger size="sm" className={cn("w-fit gap-1.5 border-none shadow-none", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((status) => {
          const { icon: Icon, dotClassName } = STATUS_META[status];
          return (
            <SelectItem key={status} value={status}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-3.5", dotClassName.replace("bg-", "text-"))} />
                {t(status)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
