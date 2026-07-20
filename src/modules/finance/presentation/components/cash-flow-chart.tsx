"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";

import type { MonthlyBreakdownPoint } from "../../domain/rules";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

/** Bars for income/expense, a line for net cash flow (income − expense) — the
 *  headline "Cash Flow" visualization used on both the Overview and Reports tabs. */
export function CashFlowChart({ points }: { points: MonthlyBreakdownPoint[] }) {
  const locale = useLocale();
  const t = useTranslations("finance");

  const chartConfig = {
    income: { label: t("type.income"), color: "var(--success)" },
    expense: { label: t("type.expense"), color: "var(--destructive)" },
    net: { label: t("cashFlow"), color: "var(--chart-accent)" },
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
      <ComposedChart data={chartData} barGap={4}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={3} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={3} />
        <Line
          dataKey="net"
          type="monotone"
          stroke="var(--color-net)"
          strokeWidth={2}
          dot={{ fill: "var(--color-net)", r: 3 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
