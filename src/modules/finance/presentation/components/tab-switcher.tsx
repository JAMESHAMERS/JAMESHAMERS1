"use client";

import { useTranslations } from "next-intl";
import { LayoutGridIcon, ListIcon, PiggyBankIcon, BarChart3Icon } from "lucide-react";

import type { FinanceTab } from "../../application/finance-store";
import { useFinanceStore } from "../../application/finance-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function TabSwitcher() {
  const t = useTranslations("finance.tabs");
  const tab = useFinanceStore((s) => s.tab);
  const setTab = useFinanceStore((s) => s.setTab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as FinanceTab)}>
      <TabsList>
        <TabsTrigger value="overview" className="gap-1.5">
          <LayoutGridIcon className="size-3.5" />
          {t("overview")}
        </TabsTrigger>
        <TabsTrigger value="transactions" className="gap-1.5">
          <ListIcon className="size-3.5" />
          {t("transactions")}
        </TabsTrigger>
        <TabsTrigger value="budgets" className="gap-1.5">
          <PiggyBankIcon className="size-3.5" />
          {t("budgets")}
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-1.5">
          <BarChart3Icon className="size-3.5" />
          {t("reports")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
