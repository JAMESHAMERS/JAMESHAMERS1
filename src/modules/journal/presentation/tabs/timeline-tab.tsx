"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { NotebookPenIcon } from "lucide-react";

import { filterEntries, groupEntriesByMonth } from "../../domain/rules";
import { useJournalStore } from "../../application/journal-store";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { EntryCard } from "../components/entry-card";

export function TimelineTab() {
  const t = useTranslations("journal");
  const locale = useLocale();
  const entries = useJournalStore((s) => s.entries);
  const filters = useJournalStore((s) => s.filters);

  const groups = useMemo(() => groupEntriesByMonth(filterEntries(entries, filters)), [entries, filters]);
  const total = groups.reduce((sum, g) => sum + g.entries.length, 0);

  if (entries.length === 0) {
    return <EmptyState icon={NotebookPenIcon} title={t("noEntries")} description={t("noEntriesHint")} />;
  }

  if (total === 0) {
    return <EmptyState title={t("noMatches")} description={t("noMatchesHint")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.monthKey}>
          <p className="text-muted-foreground mb-2 px-1 text-xs font-medium capitalize">
            {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(group.monthDate)}
          </p>
          <div className="flex flex-col gap-2">
            {group.entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
