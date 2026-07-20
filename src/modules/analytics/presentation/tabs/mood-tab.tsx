"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenIcon, FlameIcon, SmileIcon } from "lucide-react";

import { averageMoodScore, journalingStreak, lastDays, moodDistribution, moodTrend } from "@/modules/journal/domain/rules";
import { MOOD_LEVELS } from "@/modules/journal/domain/types";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { useAnalyticsStore } from "../../application/analytics-store";
import { TrendChart } from "../components/trend-chart";
import { DonutChart } from "../components/donut-chart";
import { MOOD_META } from "../analytics-meta";

const SCORE_TO_MOOD = Object.fromEntries(MOOD_LEVELS.map((mood, i) => [5 - i, mood])) as Record<number, string>;

export function MoodTab() {
  const t = useTranslations("analytics.mood");
  const tMood = useTranslations("journal.mood");
  const locale = useLocale();
  const journalEntries = useAnalyticsStore((s) => s.journalEntries);

  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => lastDays(30, now), [now]);
  const trend = useMemo(() => moodTrend(journalEntries, days), [journalEntries, days]);
  const distribution = useMemo(() => moodDistribution(journalEntries), [journalEntries]);
  const streak = useMemo(() => journalingStreak(journalEntries, now), [journalEntries, now]);
  const average = useMemo(() => averageMoodScore(journalEntries), [journalEntries]);

  const trendData = trend.map((point) => ({
    label: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(point.date),
    value: point.score,
  }));

  const distributionData = distribution.map((item) => ({
    key: item.mood,
    name: tMood(item.mood),
    value: item.count,
    fill: MOOD_META[item.mood].chartColor,
  }));

  const statCards = [
    { label: t("streak"), value: t("days", { count: streak }), icon: FlameIcon },
    { label: t("averageMood"), value: average ? `${average.toFixed(1)} / 5` : "—", icon: SmileIcon },
    { label: t("totalEntries"), value: String(journalEntries.length), icon: BookOpenIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("moodTrend")} className="lg:col-span-3">
          <TrendChart
            data={trendData}
            valueLabel={tMood("label")}
            color="var(--chart-accent)"
            variant="line"
            yDomain={[1, 5]}
            yTickFormatter={(value) => {
              const mood = SCORE_TO_MOOD[value];
              return mood ? tMood(mood) : "";
            }}
          />
        </WidgetCard>
        <WidgetCard title={t("moodDistribution")} className="lg:col-span-2">
          <DonutChart data={distributionData} emptyLabel={tMood("noData")} />
        </WidgetCard>
      </div>
    </div>
  );
}
