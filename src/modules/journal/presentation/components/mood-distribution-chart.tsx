"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";

import type { MoodCount } from "../../domain/rules";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { MOOD_META } from "../journal-meta";

export function MoodDistributionChart({ counts }: { counts: MoodCount[] }) {
  const t = useTranslations("journal.mood");

  const chartData = useMemo(
    () =>
      counts.map((item) => ({
        key: item.mood,
        name: t(item.mood),
        value: item.count,
        fill: MOOD_META[item.mood].chartColor,
      })),
    [counts, t],
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
              formatter={(value, name) => (
                <div className="flex w-full items-center gap-1.5">
                  <span className="text-muted-foreground flex-1">{name}</span>
                  <span className="text-foreground font-mono font-medium tabular-nums">{String(value)}</span>
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
