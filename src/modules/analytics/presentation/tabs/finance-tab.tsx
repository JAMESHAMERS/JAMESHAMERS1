"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRightIcon, ArrowUpRightIcon, PiggyBankIcon, ScaleIcon } from "lucide-react";

import { categoryBreakdown, lastMonths, monthlyBreakdown, sumByType } from "@/modules/finance/domain/rules";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { formatCurrency } from "@/shared/lib/format";
import { useAnalyticsStore } from "../../application/analytics-store";
import { FinanceCashFlowChart } from "../components/finance-cash-flow-chart";
import { DonutChart } from "../components/donut-chart";

const FALLBACK_COLOR = "var(--muted-foreground)";

export function FinanceTab() {
  const t = useTranslations("analytics.finance");
  const tFinance = useTranslations("finance");
  const locale = useLocale();
  const transactions = useAnalyticsStore((s) => s.transactions);
  const categories = useAnalyticsStore((s) => s.financeCategories);

  const now = useMemo(() => new Date(), []);
  const months = useMemo(() => lastMonths(6, now), [now]);
  const trend = useMemo(() => monthlyBreakdown(transactions, months), [transactions, months]);

  const periodTotals = useMemo(
    () => ({
      income: sumByType(transactions, "income"),
      expense: sumByType(transactions, "expense"),
      saving: sumByType(transactions, "saving"),
    }),
    [transactions],
  );
  const net = periodTotals.income - periodTotals.expense;
  const savingsRate = periodTotals.income === 0 ? 0 : Math.round((periodTotals.saving / periodTotals.income) * 100);

  const expenseByCategory = useMemo(() => categoryBreakdown(transactions, "expense"), [transactions]);
  const expenseData = expenseByCategory.slice(0, 8).map((item) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return {
      key: item.categoryId ?? "uncategorized",
      name: category?.name ?? tFinance("uncategorized"),
      value: item.total,
      fill: category?.color ?? FALLBACK_COLOR,
    };
  });

  const statCards = [
    { label: tFinance("type.income"), value: formatCurrency(periodTotals.income, locale), icon: ArrowUpRightIcon },
    { label: tFinance("type.expense"), value: formatCurrency(periodTotals.expense, locale), icon: ArrowDownRightIcon },
    { label: t("net"), value: formatCurrency(net, locale), icon: ScaleIcon },
    { label: t("savingsRate"), value: `${savingsRate}%`, icon: PiggyBankIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("cashFlowTrend")} className="lg:col-span-3">
          <FinanceCashFlowChart points={trend} />
        </WidgetCard>
        <WidgetCard title={tFinance("expenseByCategory")} className="lg:col-span-2">
          <DonutChart
            data={expenseData}
            emptyLabel={tFinance("noData")}
            tooltipFormatter={(value) => formatCurrency(value, locale)}
          />
        </WidgetCard>
      </div>
    </div>
  );
}
