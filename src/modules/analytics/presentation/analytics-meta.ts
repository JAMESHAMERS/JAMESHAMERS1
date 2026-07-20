import {
  AngryIcon,
  ChartNoAxesCombinedIcon,
  FrownIcon,
  GaugeIcon,
  LaughIcon,
  MehIcon,
  PlaneIcon,
  RepeatIcon,
  SmileIcon,
  TargetIcon,
  UtensilsIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import type { TaskPriority, TaskStatus } from "@/modules/tasks/domain/types";
import type { MoodLevel } from "@/modules/journal/domain/types";
import type { ExpenseCategory as TravelExpenseCategory, TripStatus } from "@/modules/travel/domain/types";

import type { AnalyticsTab } from "../domain/types";

/**
 * Visual metadata — icons, colors, i18n keys — kept in `presentation`,
 * never in `domain`. Where a sibling module already has its own
 * `*-meta.ts` for the same enum (Tasks' status/priority, Journal's mood,
 * Travel's expense category/trip status), it deliberately isn't imported
 * here: that file lives in that module's `presentation` layer, which is
 * off-limits to Analytics (see `src/modules/analytics/README.md`). The
 * color choices below intentionally match those modules' own schemes so
 * the same status reads the same color everywhere in the app — just
 * declared independently, the same small duplication every module's
 * category colors already accept over a shared lookup table.
 */

export const TAB_META: Record<AnalyticsTab, { labelKey: string; icon: LucideIcon }> = {
  productivity: { labelKey: "productivity", icon: GaugeIcon },
  finance: { labelKey: "finance", icon: WalletIcon },
  habits: { labelKey: "habits", icon: RepeatIcon },
  goals: { labelKey: "goals", icon: TargetIcon },
  meals: { labelKey: "meals", icon: UtensilsIcon },
  mood: { labelKey: "mood", icon: SmileIcon },
  travel: { labelKey: "travel", icon: PlaneIcon },
};

export const ANALYTICS_ICON = ChartNoAxesCombinedIcon;

export const TASK_STATUS_META: Record<TaskStatus, { labelKey: string; chartColor: string }> = {
  todo: { labelKey: "todo", chartColor: "var(--muted-foreground)" },
  in_progress: { labelKey: "inProgress", chartColor: "var(--chart-accent)" },
  in_review: { labelKey: "inReview", chartColor: "var(--warning)" },
  done: { labelKey: "done", chartColor: "var(--success)" },
};

export const TASK_PRIORITY_META: Record<TaskPriority, { labelKey: string; chartColor: string }> = {
  low: { labelKey: "low", chartColor: "var(--muted-foreground)" },
  medium: { labelKey: "medium", chartColor: "var(--chart-2)" },
  high: { labelKey: "high", chartColor: "var(--warning)" },
  urgent: { labelKey: "urgent", chartColor: "var(--destructive)" },
};

export const MOOD_META: Record<MoodLevel, { labelKey: string; icon: LucideIcon; chartColor: string }> = {
  great: { labelKey: "great", icon: LaughIcon, chartColor: "var(--success)" },
  good: { labelKey: "good", icon: SmileIcon, chartColor: "var(--chart-2)" },
  okay: { labelKey: "okay", icon: MehIcon, chartColor: "var(--muted-foreground)" },
  bad: { labelKey: "bad", icon: FrownIcon, chartColor: "var(--chart-4)" },
  awful: { labelKey: "awful", icon: AngryIcon, chartColor: "var(--destructive)" },
};

export const TRAVEL_EXPENSE_CATEGORY_META: Record<TravelExpenseCategory, { labelKey: string; chartColor: string }> = {
  transport: { labelKey: "transport", chartColor: "var(--chart-1)" },
  accommodation: { labelKey: "accommodation", chartColor: "var(--chart-2)" },
  food: { labelKey: "food", chartColor: "var(--chart-3)" },
  activities: { labelKey: "activities", chartColor: "var(--chart-4)" },
  shopping: { labelKey: "shopping", chartColor: "var(--chart-5)" },
  other: { labelKey: "other", chartColor: "var(--muted-foreground)" },
};

export const TRIP_STATUS_META: Record<TripStatus, { labelKey: string; chartColor: string }> = {
  upcoming: { labelKey: "upcoming", chartColor: "var(--chart-accent)" },
  ongoing: { labelKey: "ongoing", chartColor: "var(--success)" },
  completed: { labelKey: "completed", chartColor: "var(--muted-foreground)" },
};

export const MACRO_COLORS = {
  protein: "var(--chart-1)",
  carbs: "var(--chart-2)",
  fat: "var(--chart-3)",
};
