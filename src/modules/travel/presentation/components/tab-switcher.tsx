"use client";

import { useTranslations } from "next-intl";
import { BarChart3Icon, PlaneIcon } from "lucide-react";

import type { TravelTab } from "../../application/travel-store";
import { useTravelStore } from "../../application/travel-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function TabSwitcher() {
  const t = useTranslations("travel.tabs");
  const tab = useTravelStore((s) => s.tab);
  const setTab = useTravelStore((s) => s.setTab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TravelTab)}>
      <TabsList>
        <TabsTrigger value="trips" className="gap-1.5">
          <PlaneIcon className="size-3.5" />
          {t("trips")}
        </TabsTrigger>
        <TabsTrigger value="statistics" className="gap-1.5">
          <BarChart3Icon className="size-3.5" />
          {t("statistics")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
