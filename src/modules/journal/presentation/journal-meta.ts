import { AngryIcon, FrownIcon, LaughIcon, MehIcon, SmileIcon, type LucideIcon } from "lucide-react";

import type { MoodLevel } from "../domain/types";

/**
 * Visual metadata for the mood enum — kept in `presentation` (icons,
 * colors, i18n keys), never in `domain`, which stays UI-agnostic. Unlike
 * Finance/Meals/Travel's category colors (`chart-1..5`, arbitrary
 * variety), mood *is* a meaningful positive/negative signal, so it runs
 * on a `success` → `destructive` gradient through the neutral tones in
 * between.
 */
export const MOOD_META: Record<
  MoodLevel,
  { labelKey: string; icon: LucideIcon; className: string; chartColor: string }
> = {
  great: { labelKey: "great", icon: LaughIcon, className: "text-success", chartColor: "var(--success)" },
  good: { labelKey: "good", icon: SmileIcon, className: "text-chart-2", chartColor: "var(--chart-2)" },
  okay: { labelKey: "okay", icon: MehIcon, className: "text-muted-foreground", chartColor: "var(--muted-foreground)" },
  bad: { labelKey: "bad", icon: FrownIcon, className: "text-chart-4", chartColor: "var(--chart-4)" },
  awful: { labelKey: "awful", icon: AngryIcon, className: "text-destructive", chartColor: "var(--destructive)" },
};
