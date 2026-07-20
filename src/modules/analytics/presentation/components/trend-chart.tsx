"use client";

import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";

export interface TrendChartPoint {
  label: string;
  value: number | null;
}

interface TrendChartProps {
  data: TrendChartPoint[];
  valueLabel: string;
  color: string;
  variant?: "bar" | "line";
  referenceValue?: number;
  yDomain?: [number, number];
  yTickFormatter?: (value: number) => string;
  /** Hide the Y-axis entirely — for currency-scale values where raw ticks
   *  (millions of VND) would need far more width than a small chart has
   *  to spare; the tooltip still shows the exact figure on hover. */
  yHide?: boolean;
  tooltipFormatter?: (value: number) => string;
}

/**
 * Single-series trend visualization shared by every Analytics tab
 * (weekly task completions, calorie/spend trends, mood trend) — bar or
 * line, with an optional dashed goal `ReferenceLine`, so each tab only
 * has to describe its data instead of re-implementing the chart.
 */
export function TrendChart({
  data,
  valueLabel,
  color,
  variant = "bar",
  referenceValue,
  yDomain,
  yTickFormatter,
  yHide = false,
  tooltipFormatter,
}: TrendChartProps) {
  const chartConfig = useMemo(
    () => ({ value: { label: valueLabel, color } }) satisfies ChartConfig,
    [valueLabel, color],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <ComposedChart data={data} margin={{ left: yTickFormatter ? 4 : 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} minTickGap={20} />
        <YAxis
          hide={yHide}
          domain={yDomain}
          tickLine={false}
          axisLine={false}
          width={yTickFormatter ? 54 : 28}
          fontSize={11}
          tickFormatter={yTickFormatter}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={
                tooltipFormatter
                  ? (value) => <span className="font-medium tabular-nums">{tooltipFormatter(Number(value))}</span>
                  : undefined
              }
            />
          }
        />
        {referenceValue !== undefined ? (
          <ReferenceLine y={referenceValue} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        ) : null}
        {variant === "bar" ? (
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        ) : (
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={{ fill: "var(--color-value)", r: 3 }}
            connectNulls
          />
        )}
      </ComposedChart>
    </ChartContainer>
  );
}
