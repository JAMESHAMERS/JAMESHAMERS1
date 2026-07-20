"use client";

import { useTranslations } from "next-intl";

import { useAnalyticsStore } from "../application/analytics-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { AnalyticsProvider } from "./analytics-provider";
import { TabSwitcher } from "./components/tab-switcher";
import { ProductivityTab } from "./tabs/productivity-tab";
import { FinanceTab } from "./tabs/finance-tab";
import { HabitsTab } from "./tabs/habits-tab";
import { GoalsTab } from "./tabs/goals-tab";
import { MealsTab } from "./tabs/meals-tab";
import { MoodTab } from "./tabs/mood-tab";
import { TravelTab } from "./tabs/travel-tab";

export function AnalyticsView() {
  const t = useTranslations("modules.analytics");
  const tab = useAnalyticsStore((s) => s.tab);

  return (
    <AnalyticsProvider>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("title")} description={t("description")} />

        <TabSwitcher />

        {tab === "productivity" ? <ProductivityTab /> : null}
        {tab === "finance" ? <FinanceTab /> : null}
        {tab === "habits" ? <HabitsTab /> : null}
        {tab === "goals" ? <GoalsTab /> : null}
        {tab === "meals" ? <MealsTab /> : null}
        {tab === "mood" ? <MoodTab /> : null}
        {tab === "travel" ? <TravelTab /> : null}
      </div>
    </AnalyticsProvider>
  );
}
