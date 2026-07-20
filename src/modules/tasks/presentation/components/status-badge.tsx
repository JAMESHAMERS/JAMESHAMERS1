import { useTranslations } from "next-intl";

import type { TaskStatus } from "../../domain/types";
import { STATUS_META } from "../task-meta";
import { Badge } from "@/shared/components/ui/badge";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("tasks.status");
  const { icon: Icon } = STATUS_META[status];

  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="size-3" />
      {t(status)}
    </Badge>
  );
}
