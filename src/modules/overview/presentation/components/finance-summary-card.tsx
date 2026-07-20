"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { WalletIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { FinanceSummary } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function FinanceSummaryCard({ finance }: { finance: FinanceSummary }) {
  const t = useTranslations("dashboard.widgets.finance");
  const locale = useLocale();

  const chartConfig = {
    income: { label: t("income"), color: "var(--success)" },
    expense: { label: t("expense"), color: "var(--destructive)" },
  } satisfies ChartConfig;

  const chartData = useMemo(
    () =>
      finance.trend.map((point) => ({
        ...point,
        day: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
          new Date(point.dayKey),
        ),
      })),
    [finance.trend, locale],
  );

  const stats = [
    { key: "income", label: t("income"), value: finance.income, tone: "text-success" },
    { key: "expense", label: t("expense"), value: finance.expense, tone: "text-destructive" },
    { key: "balance", label: t("balance"), value: finance.balance, tone: "text-foreground" },
  ] as const;

  return (
    <WidgetCard
      title={t("title")}
      icon={WalletIcon}
      action={{ href: "/finance", label: t("viewAll") }}
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.key} className="space-y-0.5">
            <p className="text-muted-foreground text-xs">{stat.label}</p>
            <p className={cn("text-sm font-semibold tabular-nums sm:text-base", stat.tone)}>
              {formatCurrency(stat.value, locale, finance.currency)}
            </p>
          </div>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[140px] w-full">
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="income" fill="var(--color-income)" radius={3} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={3} />
        </BarChart>
      </ChartContainer>
    </WidgetCard>
  );
}
