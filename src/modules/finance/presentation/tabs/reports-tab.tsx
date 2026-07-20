"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import { TRANSACTION_TYPES } from "../../domain/types";
import { categoryBreakdown, getMonthKey, lastMonths, monthlyBreakdown, sumByType } from "../../domain/rules";
import { useFinanceStore } from "../../application/finance-store";
import { Button } from "@/shared/components/ui/button";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { StatCard } from "@/shared/components/composed/stat-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import { formatCurrency } from "@/shared/lib/format";
import { TYPE_META } from "../finance-meta";
import { CashFlowChart } from "../components/cash-flow-chart";
import { CategoryDonutChart } from "../components/category-donut-chart";

export function ReportsTab() {
  const t = useTranslations("finance");
  const locale = useLocale();
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const setActiveMonth = useFinanceStore((s) => s.setActiveMonth);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(activeMonth);
  const monthKey = useMemo(() => getMonthKey(activeMonth.toISOString()), [activeMonth]);
  const monthTransactions = useMemo(
    () => transactions.filter((tx) => getMonthKey(tx.occurredAt) === monthKey),
    [transactions, monthKey],
  );

  const trend = useMemo(() => monthlyBreakdown(transactions, lastMonths(6, activeMonth)), [transactions, activeMonth]);
  const expenseByCategory = useMemo(
    () => categoryBreakdown(transactions, "expense", activeMonth),
    [transactions, activeMonth],
  );

  const typeChartConfig = { value: { label: t("amount") } } satisfies ChartConfig;
  const typeTotals = TRANSACTION_TYPES.map((type) => ({
    type,
    label: t(`type.${type}`),
    value: sumByType(monthTransactions, type),
    fill: TYPE_META[type].chartColor,
  }));

  const netThisMonth = sumByType(monthTransactions, "income") - sumByType(monthTransactions, "expense");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="w-36 text-center text-sm font-medium capitalize">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TRANSACTION_TYPES.map((type) => (
          <StatCard
            key={type}
            label={t(`type.${type}`)}
            value={formatCurrency(sumByType(monthTransactions, type), locale)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("reportsTab.byType")} className="lg:col-span-2">
          <ChartContainer config={typeChartConfig} className="aspect-auto h-[220px] w-full">
            <BarChart data={typeTotals} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                width={80}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => (
                      <span className="font-mono font-medium tabular-nums">
                        {formatCurrency(Number(value), locale)}
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="value" radius={4}>
                {typeTotals.map((entry) => (
                  <Cell key={entry.type} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </WidgetCard>

        <WidgetCard title={t("expenseByCategory")} className="lg:col-span-3">
          <CategoryDonutChart totals={expenseByCategory} categories={categories} />
        </WidgetCard>
      </div>

      <WidgetCard title={t("cashFlowTrend")}>
        <p className="text-muted-foreground -mt-2 mb-2 text-xs">
          {t("reportsTab.netThisMonth", { amount: formatCurrency(netThisMonth, locale) })}
        </p>
        <CashFlowChart points={trend} />
      </WidgetCard>
    </div>
  );
}
