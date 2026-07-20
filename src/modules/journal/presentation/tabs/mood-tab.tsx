"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BookOpenIcon, FlameIcon, SmileIcon } from "lucide-react";

import { averageMoodScore, journalingStreak, lastDays, moodDistribution, moodTrend } from "../../domain/rules";
import { useJournalStore } from "../../application/journal-store";
import { StatCard } from "@/shared/components/composed/stat-card";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { MoodTrendChart } from "../components/mood-trend-chart";
import { MoodDistributionChart } from "../components/mood-distribution-chart";

export function MoodTab() {
  const t = useTranslations("journal");
  const entries = useJournalStore((s) => s.entries);

  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => lastDays(30, now), [now]);
  const trend = useMemo(() => moodTrend(entries, days), [entries, days]);
  const distribution = useMemo(() => moodDistribution(entries), [entries]);
  const streak = useMemo(() => journalingStreak(entries, now), [entries, now]);
  const average = useMemo(() => averageMoodScore(entries), [entries]);

  const stats = [
    { label: t("stats.streak"), value: t("stats.days", { count: streak }), icon: FlameIcon },
    { label: t("stats.averageMood"), value: average ? `${average.toFixed(1)} / 5` : "—", icon: SmileIcon },
    { label: t("stats.totalEntries"), value: String(entries.length), icon: BookOpenIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <WidgetCard title={t("moodTrend")} className="lg:col-span-3">
          <MoodTrendChart points={trend} />
        </WidgetCard>
        <WidgetCard title={t("moodDistribution")} className="lg:col-span-2">
          <MoodDistributionChart counts={distribution} />
        </WidgetCard>
      </div>
    </div>
  );
}
