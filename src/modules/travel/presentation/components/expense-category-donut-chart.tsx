"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";

import type { CategoryTotal } from "../../domain/rules";
import type { ExpenseCategory } from "../../domain/types";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { formatCurrency } from "@/shared/lib/format";
import { EXPENSE_CATEGORY_META } from "../travel-meta";

export function ExpenseCategoryDonutChart({ totals }: { totals: CategoryTotal<ExpenseCategory>[] }) {
  const locale = useLocale();
  const t = useTranslations("travel");

  const chartData = useMemo(
    () =>
      totals.map((item) => ({
        key: item.category,
        name: t(`expenseCategory.${item.category}`),
        value: item.total,
        fill: EXPENSE_CATEGORY_META[item.category].chartColor,
      })),
    [totals, t],
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
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.payload?.fill }} />
                  <span className="text-muted-foreground flex-1">{name}</span>
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {formatCurrency(Number(value), locale)}
                  </span>
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
