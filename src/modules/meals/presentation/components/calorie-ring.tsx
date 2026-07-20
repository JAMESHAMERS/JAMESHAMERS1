"use client";

import { useTranslations } from "next-intl";
import { FlameIcon } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import { WidgetCard } from "@/shared/components/composed/widget-card";
import { ChartContainer, type ChartConfig } from "@/shared/components/ui/chart";

export function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const t = useTranslations("meals");

  const percent = goal === 0 ? 0 : Math.min(100, Math.round((consumed / goal) * 100));
  const remaining = goal - consumed;

  const chartConfig = {
    value: { label: t("calories"), color: "var(--chart-accent)" },
  } satisfies ChartConfig;

  const chartData = [{ metric: "calories", value: percent, fill: "var(--color-value)" }];

  return (
    <WidgetCard title={t("calories")} icon={FlameIcon} contentClassName="pb-0">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[150px]">
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 - (percent / 100) * 360}
          innerRadius="72%"
          outerRadius="100%"
        >
          <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) - 2}
                        className="fill-foreground text-2xl font-bold tabular-nums"
                      >
                        {consumed}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 16}
                        className="fill-muted-foreground text-[10px]"
                      >
                        / {goal} kcal
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
      <div className="text-muted-foreground flex items-center justify-center gap-3 border-t pb-4 pt-3 text-xs tabular-nums">
        <span>
          {remaining >= 0
            ? t("caloriesRemaining", { count: remaining })
            : t("caloriesOver", { count: -remaining })}
        </span>
      </div>
    </WidgetCard>
  );
}
