"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";

import type { CategoryTotal } from "../../domain/rules";
import type { Category } from "../../domain/types";
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

const FALLBACK_COLOR = "var(--muted-foreground)";

export function CategoryDonutChart({
  totals,
  categories,
}: {
  totals: CategoryTotal[];
  categories: Category[];
}) {
  const locale = useLocale();
  const t = useTranslations("finance");

  const chartData = useMemo(
    () =>
      totals.slice(0, 8).map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return {
          key: item.categoryId ?? "uncategorized",
          name: category?.name ?? t("uncategorized"),
          value: item.total,
          fill: category?.color ?? FALLBACK_COLOR,
        };
      }),
    [totals, categories, t],
  );

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        chartData.map((d) => [d.key, { label: d.name, color: d.fill }]),
      ) satisfies ChartConfig,
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
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {formatCurrency(Number(value), locale)}
                  </span>
                </div>
              )}
            />
          }
        />
        {/* Percentage radii (not fixed px) so a bad first measurement from
            ResponsiveContainer — a real recharts/CSS-grid timing issue —
            degrades to a smaller-but-correct circle instead of a cropped,
            scaled-up arc. */}
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
