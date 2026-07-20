"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { MonthlySpendPoint } from "../../domain/rules";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

export function SpendTrendChart({ points }: { points: MonthlySpendPoint[] }) {
  const locale = useLocale();
  const t = useTranslations("travel");

  const chartConfig = {
    total: { label: t("totalSpend"), color: "var(--chart-accent)" },
  } satisfies ChartConfig;

  const chartData = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        month: new Intl.DateTimeFormat(locale, { month: "short" }).format(point.monthDate),
      })),
    [points, locale],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
