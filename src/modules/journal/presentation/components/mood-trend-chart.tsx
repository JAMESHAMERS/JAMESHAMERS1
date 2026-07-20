"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { MoodTrendPoint } from "../../domain/rules";
import { MOOD_LEVELS } from "../../domain/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { MOOD_META } from "../journal-meta";

const SCORE_TO_MOOD = Object.fromEntries(MOOD_LEVELS.map((mood, i) => [5 - i, mood])) as Record<number, string>;

export function MoodTrendChart({ points }: { points: MoodTrendPoint[] }) {
  const locale = useLocale();
  const t = useTranslations("journal.mood");

  const chartConfig = {
    score: { label: t("label"), color: "var(--chart-accent)" },
  } satisfies ChartConfig;

  const chartData = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        day: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(point.date),
      })),
    [points, locale],
  );

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <LineChart data={chartData} margin={{ left: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} minTickGap={24} />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tickLine={false}
          axisLine={false}
          width={54}
          fontSize={11}
          tickFormatter={(value) => {
            const mood = SCORE_TO_MOOD[value];
            return mood ? t(mood) : "";
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => {
                const mood = item.payload?.mood as keyof typeof MOOD_META | null;
                return mood ? (
                  <span className="font-medium capitalize">{t(mood)}</span>
                ) : (
                  <span className="text-muted-foreground">{t("noEntry")}</span>
                );
              }}
            />
          }
        />
        <Line
          dataKey="score"
          type="monotone"
          stroke="var(--color-score)"
          strokeWidth={2}
          dot={{ fill: "var(--color-score)", r: 3 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
