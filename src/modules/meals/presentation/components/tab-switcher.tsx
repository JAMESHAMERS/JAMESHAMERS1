"use client";

import { useTranslations } from "next-intl";
import { BarChart3Icon, CalendarDaysIcon } from "lucide-react";

import type { MealsTab } from "../../application/meals-store";
import { useMealsStore } from "../../application/meals-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function TabSwitcher() {
  const t = useTranslations("meals.tabs");
  const tab = useMealsStore((s) => s.tab);
  const setTab = useMealsStore((s) => s.setTab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as MealsTab)}>
      <TabsList>
        <TabsTrigger value="today" className="gap-1.5">
          <CalendarDaysIcon className="size-3.5" />
          {t("today")}
        </TabsTrigger>
        <TabsTrigger value="weekly" className="gap-1.5">
          <BarChart3Icon className="size-3.5" />
          {t("weekly")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
