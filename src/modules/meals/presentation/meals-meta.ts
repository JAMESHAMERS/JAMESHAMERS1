import { CoffeeIcon, CookieIcon, SoupIcon, UtensilsCrossedIcon, type LucideIcon } from "lucide-react";

import type { MealType } from "../domain/types";

/**
 * Visual metadata for the meal-type enum — kept in `presentation` (icons,
 * colors, i18n keys), never in `domain`, which stays UI-agnostic. Meal
 * types are variety, not a meaningful positive/negative signal, so they use
 * `chart-1..4` (like Finance's category colors) rather than semantic
 * `success`/`destructive` tokens — see docs/DESIGN_SYSTEM.md.
 */
export const MEAL_TYPE_META: Record<
  MealType,
  { labelKey: string; icon: LucideIcon; className: string; chartColor: string }
> = {
  breakfast: {
    labelKey: "breakfast",
    icon: CoffeeIcon,
    className: "text-chart-1",
    chartColor: "var(--chart-1)",
  },
  lunch: {
    labelKey: "lunch",
    icon: SoupIcon,
    className: "text-chart-2",
    chartColor: "var(--chart-2)",
  },
  dinner: {
    labelKey: "dinner",
    icon: UtensilsCrossedIcon,
    className: "text-chart-3",
    chartColor: "var(--chart-3)",
  },
  snack: {
    labelKey: "snack",
    icon: CookieIcon,
    className: "text-chart-4",
    chartColor: "var(--chart-4)",
  },
};
