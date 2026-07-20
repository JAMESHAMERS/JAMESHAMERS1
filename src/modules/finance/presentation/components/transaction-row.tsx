"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { Transaction } from "../../domain/types";
import { useFinanceStore } from "../../application/finance-store";
import { TYPE_META } from "../finance-meta";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { CategoryChip } from "./category-chip";

export function TransactionRow({
  transaction,
  onEdit,
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}) {
  const t = useTranslations("finance");
  const locale = useLocale();
  const categories = useFinanceStore((s) => s.categories);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const category = categories.find((c) => c.id === transaction.categoryId);
  const { icon: Icon, className } = TYPE_META[transaction.type];

  const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(transaction.occurredAt),
  );

  return (
    <div className="hover:bg-accent/40 group flex items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0">
      <div className={cn("bg-muted flex size-8 shrink-0 items-center justify-center rounded-full", className)}>
        <Icon className="size-4" />
      </div>

      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="truncate text-sm font-medium">
          {transaction.note || t(`type.${transaction.type}`)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {category ? <CategoryChip category={category} /> : null}
          <span className="text-muted-foreground text-xs">{dateLabel}</span>
        </div>
      </button>

      <span className={cn("shrink-0 text-sm font-semibold tabular-nums", className)}>
        {transaction.type === "income" ? "+" : "−"}
        {formatCurrency(transaction.amount, locale, transaction.currency)}
      </span>

      <button
        type="button"
        onClick={() => void deleteTransaction(transaction.id)}
        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={t("actions.delete")}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}
