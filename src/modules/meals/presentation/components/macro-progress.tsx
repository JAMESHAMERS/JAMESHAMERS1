"use client";

import { useTranslations } from "next-intl";
import { WheatIcon } from "lucide-react";

import type { MacroTotals } from "../../domain/rules";
import type { NutritionGoals } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { Progress } from "@/shared/components/ui/progress";

const ROWS: { key: keyof MacroTotals; indicatorClassName: string }[] = [
  { key: "protein", indicatorClassName: "bg-chart-1" },
  { key: "carbs", indicatorClassName: "bg-chart-2" },
  { key: "fat", indicatorClassName: "bg-chart-3" },
];

export function MacroProgress({ consumed, goals }: { consumed: MacroTotals; goals: NutritionGoals }) {
  const t = useTranslations("meals");

  return (
    <WidgetCard title={t("nutrition")} icon={WheatIcon}>
      <div className="flex flex-col gap-3.5">
        {ROWS.map((row) => {
          const value = consumed[row.key];
          const goal = goals[row.key];
          const percent = goal === 0 ? 0 : Math.round((value / goal) * 100);
          return (
            <div key={row.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{t(row.key)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.round(value)}g / {goal}g
                </span>
              </div>
              <Progress value={Math.min(100, percent)} indicatorClassName={row.indicatorClassName} />
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
