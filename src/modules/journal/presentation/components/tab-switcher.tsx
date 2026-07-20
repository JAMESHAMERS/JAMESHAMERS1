"use client";

import { useTranslations } from "next-intl";
import { HistoryIcon, SmileIcon } from "lucide-react";

import type { JournalTab } from "../../application/journal-store";
import { useJournalStore } from "../../application/journal-store";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function TabSwitcher() {
  const t = useTranslations("journal.tabs");
  const tab = useJournalStore((s) => s.tab);
  const setTab = useJournalStore((s) => s.setTab);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as JournalTab)}>
      <TabsList>
        <TabsTrigger value="timeline" className="gap-1.5">
          <HistoryIcon className="size-3.5" />
          {t("timeline")}
        </TabsTrigger>
        <TabsTrigger value="mood" className="gap-1.5">
          <SmileIcon className="size-3.5" />
          {t("mood")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
