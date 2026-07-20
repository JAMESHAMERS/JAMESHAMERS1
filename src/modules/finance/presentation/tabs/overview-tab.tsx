"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRightIcon, ArrowUpRightIcon, LineChartIcon, PiggyBankIcon, ScaleIcon } from "lucide-react";

import { categoryBreakdown, lastMonths, monthlyBreakdown, sortByDateDesc, sumByType } from "../../domain/rules";
import { useFinanceStore } from "../../application/finance-store";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { formatCurrency } from "@/shared/lib/format";
import { CashFlowChart } from "../components/cash-flow-chart";
import { CategoryDonutChart } from "../components/category-donut-chart";
import { TransactionRow } from "../components/transaction-row";

export function OverviewTab({ onEditTransaction }: { onEditTransaction: (id: string) => void }) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);

  const now = useMemo(() => new Date(), []);
  const months = useMemo(() => lastMonths(6, now), [now]);
  const breakdown = useMemo(() => monthlyBreakdown(transactions, months), [transactions, months]);
  const currentMonth = breakdown[breakdown.length - 1];

  const expenseByCategory = useMemo(
    () => categoryBreakdown(transactions, "expense", now),
    [transactions, now],
  );

  const recent = useMemo(() => sortByDateDesc(transactions).slice(0, 6), [transactions]);

  const totalSavings = sumByType(transactions, "saving");
  const totalInvestments = sumByType(transactions, "investment");

  const stats = [
    { label: t("type.income"), value: currentMonth.income, icon: ArrowUpRightIcon },
    { label: t("type.expense"), value: currentMonth.expense, icon: ArrowDownRightIcon },
    { label: t("cashFlow"), value: currentMonth.net, icon: ScaleIcon },
    { label: t("totalSavings"), value: totalSavings, icon: PiggyBankIcon },
    { label: t("totalInvestments"), value: totalInvestments, icon: LineChartIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={formatCurrency(stat.value, locale)}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("cashFlow")} className="lg:col-span-3">
          <CashFlowChart points={breakdown} />
        </WidgetCard>
        <WidgetCard title={t("expenseByCategory")} className="lg:col-span-2">
          <CategoryDonutChart totals={expenseByCategory} categories={categories} />
        </WidgetCard>
      </div>

      <WidgetCard title={t("recentTransactions")}>
        {recent.length === 0 ? (
          <EmptyState title={t("noTransactions")} />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            {recent.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={(tx) => onEditTransaction(tx.id)}
              />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
