"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDaysIcon, MapPinIcon, PlaneIcon, PlaneTakeoffIcon, WalletIcon } from "lucide-react";

import { computeTravelStats, expenseBreakdown, lastMonths, monthlySpendTrend } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { formatCurrency } from "@/shared/lib/format";
import { ExpenseCategoryDonutChart } from "../components/expense-category-donut-chart";
import { SpendTrendChart } from "../components/spend-trend-chart";

export function StatisticsTab() {
  const t = useTranslations("travel");
  const locale = useLocale();
  const trips = useTravelStore((s) => s.trips);
  const expenses = useTravelStore((s) => s.expenses);

  const now = useMemo(() => new Date(), []);
  const stats = useMemo(() => computeTravelStats(trips, expenses, now), [trips, expenses, now]);
  const breakdown = useMemo(() => expenseBreakdown(expenses), [expenses]);
  const months = useMemo(() => lastMonths(6, now), [now]);
  const trend = useMemo(() => monthlySpendTrend(expenses, months), [expenses, months]);

  const statCards = [
    { label: t("stats.totalTrips"), value: String(stats.totalTrips), icon: PlaneIcon },
    { label: t("stats.upcoming"), value: String(stats.upcomingCount), icon: PlaneTakeoffIcon },
    { label: t("stats.totalDays"), value: String(stats.totalDays), icon: CalendarDaysIcon },
    { label: t("stats.destinations"), value: String(stats.uniqueDestinations), icon: MapPinIcon },
    { label: t("stats.totalSpend"), value: formatCurrency(stats.totalSpend, locale), icon: WalletIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("spendTrend")} className="lg:col-span-3">
          <SpendTrendChart points={trend} />
        </WidgetCard>
        <WidgetCard title={t("spendByCategory")} className="lg:col-span-2">
          <ExpenseCategoryDonutChart totals={breakdown} />
        </WidgetCard>
      </div>
    </div>
  );
}
