"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { filterTransactions, sortByDateDesc } from "../../domain/rules";
import { useFinanceStore } from "../../application/finance-store";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { TransactionRow } from "../components/transaction-row";

export function TransactionsTab({ onEditTransaction }: { onEditTransaction: (id: string) => void }) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const transactions = useFinanceStore((s) => s.transactions);
  const filters = useFinanceStore((s) => s.filters);

  const groups = useMemo(() => {
    const sorted = sortByDateDesc(filterTransactions(transactions, filters));
    const map = new Map<string, typeof sorted>();
    for (const transaction of sorted) {
      const d = new Date(transaction.occurredAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, [...(map.get(key) ?? []), transaction]);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
        new Date(items[0].occurredAt),
      ),
      items,
    }));
  }, [transactions, filters, locale]);

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (total === 0) {
    return <EmptyState title={t("noTransactions")} description={t("noTransactionsHint")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key}>
          <p className="text-muted-foreground mb-2 px-1 text-xs font-medium capitalize">
            {group.label}
          </p>
          <div className="overflow-hidden rounded-lg border">
            {group.items.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} onEdit={(tx) => onEditTransaction(tx.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
