import { useTranslations } from "next-intl";

import type { TaskPriority } from "../../domain/types";
import { PRIORITY_META } from "../task-meta";
import { cn } from "@/shared/lib/utils";

export function PriorityIcon({ priority, className }: { priority: TaskPriority; className?: string }) {
  const t = useTranslations("tasks.priority");
  const { icon: Icon, className: colorClassName } = PRIORITY_META[priority];

  return (
    <span title={t(priority)} className="inline-flex">
      <Icon className={cn("size-3.5", colorClassName, className)} />
    </span>
  );
}
