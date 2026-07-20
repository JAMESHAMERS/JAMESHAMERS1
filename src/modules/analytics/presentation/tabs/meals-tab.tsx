"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DropletsIcon, FlameIcon } from "lucide-react";

import { averageOf, dailySummaries, lastDays, macroCalories } from "@/modules/meals/domain/rules";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { useAnalyticsStore } from "../../application/analytics-store";
import { TrendChart } from "../components/trend-chart";
import { DonutChart } from "../components/donut-chart";
import { MACRO_COLORS } from "../analytics-meta";

export function MealsTab() {
  const t = useTranslations("analytics.meals");
  const tMeals = useTranslations("meals");
  const locale = useLocale();
  const mealEntries = useAnalyticsStore((s) => s.mealEntries);
  const waterEntries = useAnalyticsStore((s) => s.waterEntries);
  const goals = useAnalyticsStore((s) => s.mealGoals);

  const days = useMemo(() => lastDays(14), []);
  const summaries = useMemo(() => dailySummaries(mealEntries, waterEntries, days), [mealEntries, waterEntries, days]);
  const averages = useMemo(() => averageOf(summaries), [summaries]);
  const macroCalorieSplit = useMemo(
    () => macroCalories({ protein: averages.protein, carbs: averages.carbs, fat: averages.fat }),
    [averages],
  );

  const calorieTrend = summaries.map((s) => ({
    label: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(s.date),
    value: s.calories,
  }));

  const macroData = [
    { key: "protein", name: tMeals("protein"), value: Math.round(macroCalorieSplit.protein), fill: MACRO_COLORS.protein },
    { key: "carbs", name: tMeals("carbs"), value: Math.round(macroCalorieSplit.carbs), fill: MACRO_COLORS.carbs },
    { key: "fat", name: tMeals("fat"), value: Math.round(macroCalorieSplit.fat), fill: MACRO_COLORS.fat },
  ];

  const statCards = [
    { label: t("avgCalories"), value: `${averages.calories} kcal`, icon: FlameIcon },
    { label: t("avgWater"), value: `${averages.waterMl} ml`, icon: DropletsIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("calorieTrend")} className="lg:col-span-3">
          <TrendChart
            data={calorieTrend}
            valueLabel={tMeals("calories")}
            color="var(--chart-accent)"
            variant="bar"
            referenceValue={goals.calories}
            yTickFormatter={(value) => String(value)}
          />
        </WidgetCard>
        <WidgetCard title={t("macroSplit")} className="lg:col-span-2">
          <DonutChart
            data={macroData}
            emptyLabel={tMeals("noData")}
            tooltipFormatter={(value) => `${value} kcal`}
          />
        </WidgetCard>
      </div>
    </div>
  );
}
