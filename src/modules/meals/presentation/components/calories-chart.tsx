"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis } from "recharts";

import type { DaySummary } from "../../domain/rules";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

/** Daily calories bar chart with a dashed reference line at the goal. */
export function CaloriesChart({ summaries, goal }: { summaries: DaySummary[]; goal: number }) {
  const locale = useLocale();
  const t = useTranslations("meals");

  const chartConfig = {
    calories: { label: t("calories"), color: "var(--chart-accent)" },
  } satisfies ChartConfig;

  const chartData = useMemo(
    () =>
      summaries.map((s) => ({
        ...s,
        day: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(s.date),
      })),
    [summaries, locale],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ReferenceLine y={goal} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        <Bar dataKey="calories" fill="var(--color-calories)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
