"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BeefIcon, DropletsIcon, FlameIcon, WheatIcon } from "lucide-react";

import { averageOf, dailySummaries, lastDays } from "../../domain/rules";
import { useMealsStore } from "../../application/meals-store";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { CaloriesChart } from "../components/calories-chart";
import { WaterChart } from "../components/water-chart";
import { MacroDonutChart } from "../components/macro-donut-chart";

export function WeeklyTab() {
  const t = useTranslations("meals");
  const locale = useLocale();
  const mealEntries = useMealsStore((s) => s.mealEntries);
  const waterEntries = useMealsStore((s) => s.waterEntries);
  const goals = useMealsStore((s) => s.goals);

  const days = useMemo(() => lastDays(7), []);
  const summaries = useMemo(
    () => dailySummaries(mealEntries, waterEntries, days),
    [mealEntries, waterEntries, days],
  );
  const averages = useMemo(() => averageOf(summaries), [summaries]);

  const weekMacros = useMemo(
    () =>
      summaries.reduce(
        (acc, s) => ({ protein: acc.protein + s.protein, carbs: acc.carbs + s.carbs, fat: acc.fat + s.fat }),
        { protein: 0, carbs: 0, fat: 0 },
      ),
    [summaries],
  );

  const rangeLabel =
    summaries.length > 0
      ? `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(summaries[0].date)} – ${new Intl.DateTimeFormat(
          locale,
          { day: "numeric", month: "short" },
        ).format(summaries[summaries.length - 1].date)}`
      : "";

  const stats = [
    { label: t("avgCalories"), value: `${averages.calories} kcal`, icon: FlameIcon },
    { label: t("avgProtein"), value: `${averages.protein} g`, icon: BeefIcon },
    { label: t("avgCarbs"), value: `${averages.carbs} g`, icon: WheatIcon },
    { label: t("avgFat"), value: `${averages.fat} g`, icon: WheatIcon },
    { label: t("avgWater"), value: `${averages.waterMl} ml`, icon: DropletsIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground -mb-1 text-xs">{rangeLabel}</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("caloriesTrend")} className="lg:col-span-3">
          <CaloriesChart summaries={summaries} goal={goals.calories} />
        </WidgetCard>
        <WidgetCard title={t("macroSplit")} className="lg:col-span-2">
          <MacroDonutChart macros={weekMacros} />
        </WidgetCard>
      </div>

      <WidgetCard title={t("waterTrend")}>
        <WaterChart summaries={summaries} goal={goals.waterMl} />
      </WidgetCard>
    </div>
  );
}
