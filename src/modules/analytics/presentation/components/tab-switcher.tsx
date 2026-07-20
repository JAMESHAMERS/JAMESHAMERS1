"use client";

import { useTranslations } from "next-intl";

import { ANALYTICS_TABS, type AnalyticsTab } from "../../domain/types";
import { useAnalyticsStore } from "../../application/analytics-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TAB_META } from "../analytics-meta";

export function TabSwitcher() {
  const t = useTranslations("analytics.tabs");
  const tab = useAnalyticsStore((s) => s.tab);
  const setTab = useAnalyticsStore((s) => s.setTab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as AnalyticsTab)}>
      <div className="overflow-x-auto">
        <TabsList>
          {ANALYTICS_TABS.map((tabKey) => {
            const { icon: Icon } = TAB_META[tabKey];
            return (
              <TabsTrigger key={tabKey} value={tabKey} className="gap-1.5">
                <Icon className="size-3.5" />
                {t(tabKey)}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}
