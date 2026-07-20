"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import { useMealsStore } from "../application/meals-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { Button } from "@/shared/components/ui/button";
import { MealsProvider } from "./meals-provider";
import { TabSwitcher } from "./components/tab-switcher";
import { MealDialog } from "./components/meal-dialog";
import { TodayTab } from "./tabs/today-tab";
import { WeeklyTab } from "./tabs/weekly-tab";

export function MealsView() {
  const t = useTranslations("modules.meals");
  const tMeals = useTranslations("meals");
  const tab = useMealsStore((s) => s.tab);
  const setTab = useMealsStore((s) => s.setTab);
  const activeDay = useMealsStore((s) => s.activeDay);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <MealsProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button
              onClick={() => {
                setTab("today");
                setDialogOpen(true);
              }}
              className="gap-1.5"
            >
              <PlusIcon className="size-4" />
              {tMeals("addEntry")}
            </Button>
          }
        />

        <TabSwitcher />

        {tab === "today" ? <TodayTab /> : null}
        {tab === "weekly" ? <WeeklyTab /> : null}
      </div>

      <MealDialog open={dialogOpen} onOpenChange={setDialogOpen} entry={null} day={activeDay} />
    </MealsProvider>
  );
}
