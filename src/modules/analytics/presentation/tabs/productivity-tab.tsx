"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangleIcon, CheckCircle2Icon, ListTodoIcon, TrendingUpIcon } from "lucide-react";

import { lastWeeks, productivityStats, taskPriorityBreakdown, taskStatusBreakdown, weeklyCompletionTrend } from "../../domain/rules";
import { useAnalyticsStore } from "../../application/analytics-store";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { DonutChart } from "../components/donut-chart";
import { TrendChart } from "../components/trend-chart";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "../analytics-meta";

export function ProductivityTab() {
  const t = useTranslations("analytics.productivity");
  const tStatus = useTranslations("tasks.status");
  const tPriority = useTranslations("tasks.priority");
  const locale = useLocale();
  const tasks = useAnalyticsStore((s) => s.tasks);

  const stats = useMemo(() => productivityStats(tasks), [tasks]);
  const statusBreakdown = useMemo(() => taskStatusBreakdown(tasks), [tasks]);
  const priorityBreakdown = useMemo(() => taskPriorityBreakdown(tasks), [tasks]);
  const weeks = useMemo(() => lastWeeks(8), []);
  const trend = useMemo(() => weeklyCompletionTrend(tasks, weeks), [tasks, weeks]);

  const statusData = statusBreakdown.map((d) => ({
    key: d.category,
    name: tStatus(d.category),
    value: d.total,
    fill: TASK_STATUS_META[d.category].chartColor,
  }));

  const priorityData = priorityBreakdown.map((d) => ({
    key: d.category,
    name: tPriority(d.category),
    value: d.total,
    fill: TASK_PRIORITY_META[d.category].chartColor,
  }));

  const trendData = trend.map((point) => ({
    label: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(point.weekStart),
    value: point.count,
  }));

  const statCards = [
    { label: t("totalTasks"), value: String(stats.total), icon: ListTodoIcon },
    { label: t("completed"), value: String(stats.completed), icon: CheckCircle2Icon },
    { label: t("completionRate"), value: `${stats.completionRate}%`, icon: TrendingUpIcon },
    { label: t("overdue"), value: String(stats.overdue), icon: AlertTriangleIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <WidgetCard title={t("weeklyCompletions")}>
        <TrendChart data={trendData} valueLabel={t("completed")} color="var(--chart-accent)" variant="bar" />
      </WidgetCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <WidgetCard title={t("byStatus")}>
          <DonutChart data={statusData} emptyLabel={t("noData")} />
        </WidgetCard>
        <WidgetCard title={t("byPriority")}>
          <DonutChart data={priorityData} emptyLabel={t("noData")} />
        </WidgetCard>
      </div>
    </div>
  );
}
