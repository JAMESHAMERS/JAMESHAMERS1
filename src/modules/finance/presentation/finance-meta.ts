import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  LineChartIcon,
  PiggyBankIcon,
  type LucideIcon,
} from "lucide-react";

import type { TransactionType } from "../domain/types";

/**
 * Visual metadata for the transaction-type enum — kept in `presentation`
 * (icons, colors, i18n keys), never in `domain`, which stays UI-agnostic.
 * Colors are chart/semantic tokens, not chart-1..5, so the meaning of
 * "green" (income) stays consistent everywhere it appears, light or dark
 * — see docs/DESIGN_SYSTEM.md on `chart-accent` for why.
 */
export const TYPE_META: Record<
  TransactionType,
  { labelKey: string; icon: LucideIcon; className: string; chartColor: string }
> = {
  income: {
    labelKey: "income",
    icon: ArrowUpRightIcon,
    className: "text-success",
    chartColor: "var(--success)",
  },
  expense: {
    labelKey: "expense",
    icon: ArrowDownRightIcon,
    className: "text-destructive",
    chartColor: "var(--destructive)",
  },
  saving: {
    labelKey: "saving",
    icon: PiggyBankIcon,
    className: "text-chart-2",
    chartColor: "var(--chart-2)",
  },
  investment: {
    labelKey: "investment",
    icon: LineChartIcon,
    className: "text-chart-accent",
    chartColor: "var(--chart-accent)",
  },
};
