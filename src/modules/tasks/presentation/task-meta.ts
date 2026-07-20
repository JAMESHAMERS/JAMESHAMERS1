import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  EqualIcon,
  EyeIcon,
  type LucideIcon,
} from "lucide-react";

import type { TaskPriority, TaskStatus } from "../domain/types";

/**
 * Visual metadata for status/priority enums — kept in `presentation`
 * (icons, colors, i18n keys), never in `domain`, which stays UI-agnostic.
 */
export const STATUS_META: Record<
  TaskStatus,
  { labelKey: string; icon: LucideIcon; dotClassName: string }
> = {
  todo: { labelKey: "todo", icon: CircleDashedIcon, dotClassName: "bg-muted-foreground" },
  in_progress: { labelKey: "inProgress", icon: CircleDotIcon, dotClassName: "bg-chart-accent" },
  in_review: { labelKey: "inReview", icon: EyeIcon, dotClassName: "bg-warning" },
  done: { labelKey: "done", icon: CheckCircle2Icon, dotClassName: "bg-success" },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { labelKey: string; icon: LucideIcon; className: string }
> = {
  low: { labelKey: "low", icon: ArrowDownIcon, className: "text-muted-foreground" },
  medium: { labelKey: "medium", icon: EqualIcon, className: "text-chart-2" },
  high: { labelKey: "high", icon: ArrowUpIcon, className: "text-warning" },
  urgent: { labelKey: "urgent", icon: AlertTriangleIcon, className: "text-destructive" },
};
