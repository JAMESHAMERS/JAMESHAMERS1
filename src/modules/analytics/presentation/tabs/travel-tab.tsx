"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDaysIcon, MapPinIcon, PlaneIcon, WalletIcon } from "lucide-react";

import {
  computeTravelStats,
  expenseBreakdown,
  lastMonths,
  monthlySpendTrend,
  tripStatus,
} from "@/modules/travel/domain/rules";
import type { TripStatus } from "@/modules/travel/domain/types";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { formatCurrency } from "@/shared/lib/format";
import { useAnalyticsStore } from "../../application/analytics-store";
import { TrendChart } from "../components/trend-chart";
import { DonutChart } from "../components/donut-chart";
import { TRAVEL_EXPENSE_CATEGORY_META, TRIP_STATUS_META } from "../analytics-meta";

const TRIP_STATUSES: TripStatus[] = ["upcoming", "ongoing", "completed"];

export function TravelTab() {
  const t = useTranslations("analytics.travel");
  const tTravel = useTranslations("travel");
  const tStatus = useTranslations("travel.status");
  const tCategory = useTranslations("travel.expenseCategory");
  const locale = useLocale();
  const trips = useAnalyticsStore((s) => s.trips);
  const tripExpenses = useAnalyticsStore((s) => s.tripExpenses);

  const now = useMemo(() => new Date(), []);
  const stats = useMemo(() => computeTravelStats(trips, tripExpenses, now), [trips, tripExpenses, now]);
  const months = useMemo(() => lastMonths(6, now), [now]);
  const trend = useMemo(() => monthlySpendTrend(tripExpenses, months), [tripExpenses, months]);
  const breakdown = useMemo(() => expenseBreakdown(tripExpenses), [tripExpenses]);

  const trendData = trend.map((point) => ({
    label: new Intl.DateTimeFormat(locale, { month: "short" }).format(point.monthDate),
    value: point.total,
  }));

  const expenseData = breakdown.map((item) => ({
    key: item.category,
    name: tCategory(item.category),
    value: item.total,
    fill: TRAVEL_EXPENSE_CATEGORY_META[item.category].chartColor,
  }));

  const statusCounts: Record<TripStatus, number> = { upcoming: 0, ongoing: 0, completed: 0 };
  for (const trip of trips) {
    statusCounts[tripStatus(trip, now)] += 1;
  }
  const statusData = TRIP_STATUSES.map((status) => ({
    key: status,
    name: tStatus(status),
    value: statusCounts[status],
    fill: TRIP_STATUS_META[status].chartColor,
  }));

  const statCards = [
    { label: t("totalTrips"), value: String(stats.totalTrips), icon: PlaneIcon },
    { label: t("totalDays"), value: String(stats.totalDays), icon: CalendarDaysIcon },
    { label: t("destinations"), value: String(stats.uniqueDestinations), icon: MapPinIcon },
    { label: t("totalSpend"), value: formatCurrency(stats.totalSpend, locale), icon: WalletIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("spendTrend")} className="lg:col-span-3">
          <TrendChart
            data={trendData}
            valueLabel={tTravel("totalSpend")}
            color="var(--chart-accent)"
            variant="bar"
            yHide
            tooltipFormatter={(value) => formatCurrency(value, locale)}
          />
        </WidgetCard>
        <WidgetCard title={t("tripStatus")} className="lg:col-span-2">
          <DonutChart data={statusData} emptyLabel={t("noData")} />
        </WidgetCard>
      </div>

      <WidgetCard title={t("spendByCategory")}>
        <DonutChart
          data={expenseData}
          emptyLabel={t("noData")}
          tooltipFormatter={(value) => formatCurrency(value, locale)}
        />
      </WidgetCard>
    </div>
  );
}
