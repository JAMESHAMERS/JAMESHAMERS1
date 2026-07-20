"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { EmptyState } from "@/shared/components/composed/empty-state";

export interface DonutChartSlice {
  key: string;
  name: string;
  value: number;
  fill: string;
}

interface DonutChartProps {
  data: DonutChartSlice[];
  emptyLabel: string;
  tooltipFormatter?: (value: number) => string;
}

/**
 * Categorical share-of-total donut shared by every Analytics tab (task
 * status/priority, expense categories, macro split, mood distribution,
 * trip status) — one implementation instead of five near-identical
 * copies of the same `Pie` setup.
 */
export function DonutChart({ data, emptyLabel, tooltipFormatter }: DonutChartProps) {
  const chartData = useMemo(() => data.filter((d) => d.value > 0), [data]);

  const chartConfig = useMemo(
    () => Object.fromEntries(chartData.map((d) => [d.key, { label: d.name, color: d.fill }])) satisfies ChartConfig,
    [chartData],
  );

  if (chartData.length === 0) {
    return <EmptyState title={emptyLabel} className="py-10" />;
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
                    {tooltipFormatter ? tooltipFormatter(Number(value)) : String(value)}
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
