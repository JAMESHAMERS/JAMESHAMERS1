import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon } from "lucide-react";

import type { Task } from "../../domain/types";
import { isDueSoon, isOverdue } from "../../domain/rules";
import { cn } from "@/shared/lib/utils";

export function DueDateBadge({ task, className }: { task: Task; className?: string }) {
  const locale = useLocale();
  const t = useTranslations("tasks.card");
  if (!task.dueDate) return null;

  const overdue = isOverdue(task);
  const dueSoon = isDueSoon(task);
  const label = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(`${task.dueDate}T00:00:00`),
  );

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        overdue ? "text-destructive font-medium" : dueSoon ? "text-warning font-medium" : "text-muted-foreground",
        className,
      )}
      title={overdue ? t("overdue") : undefined}
    >
      <CalendarIcon className="size-3" />
      {label}
    </span>
  );
}
