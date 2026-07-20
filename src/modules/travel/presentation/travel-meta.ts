import {
  BedIcon,
  BusIcon,
  FerrisWheelIcon,
  MoreHorizontalIcon,
  PlaneIcon,
  ShoppingBagIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react";

import type { ExpenseCategory, ItineraryCategory, TripStatus } from "../domain/types";

/**
 * Visual metadata for the itinerary/expense category and trip-status enums
 * — kept in `presentation` (icons, colors, i18n keys), never in `domain`,
 * which stays UI-agnostic. Categories are variety, not a meaningful
 * positive/negative signal, so they use `chart-1..5` (like Finance's
 * category colors) rather than semantic `success`/`destructive` tokens.
 */
export const ITINERARY_CATEGORY_META: Record<
  ItineraryCategory,
  { labelKey: string; icon: LucideIcon; className: string; chartColor: string }
> = {
  flight: { labelKey: "flight", icon: PlaneIcon, className: "text-chart-1", chartColor: "var(--chart-1)" },
  hotel: { labelKey: "hotel", icon: BedIcon, className: "text-chart-2", chartColor: "var(--chart-2)" },
  activity: { labelKey: "activity", icon: FerrisWheelIcon, className: "text-chart-3", chartColor: "var(--chart-3)" },
  food: { labelKey: "food", icon: UtensilsIcon, className: "text-chart-4", chartColor: "var(--chart-4)" },
  transport: { labelKey: "transport", icon: BusIcon, className: "text-chart-5", chartColor: "var(--chart-5)" },
  other: {
    labelKey: "other",
    icon: MoreHorizontalIcon,
    className: "text-muted-foreground",
    chartColor: "var(--muted-foreground)",
  },
};

export const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { labelKey: string; icon: LucideIcon; className: string; chartColor: string }
> = {
  transport: { labelKey: "transport", icon: BusIcon, className: "text-chart-1", chartColor: "var(--chart-1)" },
  accommodation: { labelKey: "accommodation", icon: BedIcon, className: "text-chart-2", chartColor: "var(--chart-2)" },
  food: { labelKey: "food", icon: UtensilsIcon, className: "text-chart-3", chartColor: "var(--chart-3)" },
  activities: {
    labelKey: "activities",
    icon: FerrisWheelIcon,
    className: "text-chart-4",
    chartColor: "var(--chart-4)",
  },
  shopping: { labelKey: "shopping", icon: ShoppingBagIcon, className: "text-chart-5", chartColor: "var(--chart-5)" },
  other: {
    labelKey: "other",
    icon: MoreHorizontalIcon,
    className: "text-muted-foreground",
    chartColor: "var(--muted-foreground)",
  },
};

export const TRIP_STATUS_META: Record<TripStatus, { labelKey: string; badgeClassName: string }> = {
  upcoming: { labelKey: "upcoming", badgeClassName: "bg-chart-accent/15 text-chart-accent border-transparent" },
  ongoing: { labelKey: "ongoing", badgeClassName: "bg-success/15 text-success border-transparent" },
  completed: { labelKey: "completed", badgeClassName: "bg-muted text-muted-foreground border-transparent" },
};
