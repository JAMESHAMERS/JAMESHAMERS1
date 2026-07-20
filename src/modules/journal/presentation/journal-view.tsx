"use client";

import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import { useJournalStore } from "../application/journal-store";
import { PageHeader } from "@/shared/components/composed/page-header";
import { Button } from "@/shared/components/ui/button";
import { JournalProvider } from "./journal-provider";
import { TabSwitcher } from "./components/tab-switcher";
import { EntryFiltersBar } from "./components/entry-filters-bar";
import { EntryDetailSheet } from "./components/entry-detail-sheet";
import { TimelineTab } from "./tabs/timeline-tab";
import { MoodTab } from "./tabs/mood-tab";

function todayDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function JournalView() {
  const t = useTranslations("modules.journal");
  const tJournal = useTranslations("journal");
  const tab = useJournalStore((s) => s.tab);
  const createEntry = useJournalStore((s) => s.createEntry);
  const openEntry = useJournalStore((s) => s.openEntry);

  async function handleNewEntry() {
    const entry = await createEntry({ entryDate: todayDateKey() });
    openEntry(entry.id);
  }

  return (
    <JournalProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button onClick={() => void handleNewEntry()} className="gap-1.5">
              <PlusIcon className="size-4" />
              {tJournal("newEntry")}
            </Button>
          }
        />

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <TabSwitcher />
          {tab === "timeline" ? <EntryFiltersBar /> : null}
        </div>

        {tab === "timeline" ? <TimelineTab /> : null}
        {tab === "mood" ? <MoodTab /> : null}
      </div>

      <EntryDetailSheet />
    </JournalProvider>
  );
}
