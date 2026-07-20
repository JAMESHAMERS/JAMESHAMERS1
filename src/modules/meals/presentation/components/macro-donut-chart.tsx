"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";

import type { MacroTotals } from "../../domain/rules";
import { macroCalories } from "../../domain/rules";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { EmptyState } from "@/shared/components/composed/empty-state";

/** Calorie contribution of each macro (protein/carbs = 4 kcal/g, fat = 9 kcal/g) as a donut. */
export function MacroDonutChart({ macros }: { macros: MacroTotals }) {
  const t = useTranslations("meals");
  const calories = macroCalories(macros);

  const chartData = useMemo(
    () =>
      [
        { key: "protein", name: t("protein"), value: Math.round(calories.protein), fill: "var(--chart-1)" },
        { key: "carbs", name: t("carbs"), value: Math.round(calories.carbs), fill: "var(--chart-2)" },
        { key: "fat", name: t("fat"), value: Math.round(calories.fat), fill: "var(--chart-3)" },
      ].filter((d) => d.value > 0),
    [calories, t],
  );

  const chartConfig = useMemo(
    () => Object.fromEntries(chartData.map((d) => [d.key, { label: d.name, color: d.fill }])) satisfies ChartConfig,
    [chartData],
  );

  if (chartData.length === 0) {
    return <EmptyState title={t("noData")} className="py-10" />;
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto h-[220px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="key"
              formatter={(value, name, item) => (
                <div className="flex w-full items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.payload?.fill }}
                  />
                  <span className="text-muted-foreground flex-1">{name}</span>
                  <span className="text-foreground font-mono font-medium tabular-nums">{String(value)} kcal</span>
                </div>
              )}
            />
          }
        />
        <Pie data={chartData} dataKey="value" nameKey="key" innerRadius="55%" outerRadius="85%" strokeWidth={3}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} stroke="var(--card)" />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  );
}
