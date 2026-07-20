"use client";

import { useTranslations } from "next-intl";
import { TrendingUpIcon } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import type { ProductivityScore } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { ChartContainer, type ChartConfig } from "@/shared/components/ui/chart";

export function ProductivityScoreCard({
  productivity,
}: {
  productivity: ProductivityScore;
}) {
  const t = useTranslations("dashboard.widgets.productivity");

  const chartConfig = {
    value: { label: t("title"), color: "var(--chart-accent)" },
  } satisfies ChartConfig;

  const chartData = [{ metric: "score", value: productivity.score, fill: "var(--color-value)" }];

  return (
    <WidgetCard title={t("title")} icon={TrendingUpIcon} contentClassName="pb-0">
      <p className="text-muted-foreground -mt-2 mb-1 text-xs">{t("subtitle")}</p>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[150px]">
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={90 - (productivity.score / 100) * 360}
          innerRadius="72%"
          outerRadius="100%"
        >
          <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} domain={[0, 100]}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) - 2}
                        className="fill-foreground text-2xl font-bold tabular-nums"
                      >
                        {productivity.score}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 16}
                        className="fill-muted-foreground text-[10px]"
                      >
                        / 100
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
          {t("tasksDone", {
            done: productivity.tasksCompleted,
            total: productivity.tasksTotal,
          })}
        </span>
        <span className="bg-border h-3 w-px" />
        <span>{t("streak", { days: productivity.streakDays })}</span>
      </div>
    </WidgetCard>
  );
}
