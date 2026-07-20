"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2Icon } from "lucide-react";

import type { TripExpense } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import { EXPENSE_CATEGORY_META } from "../travel-meta";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function ExpenseRow({
  expense,
  onEdit,
}: {
  expense: TripExpense;
  onEdit: (expense: TripExpense) => void;
}) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const deleteExpense = useTravelStore((s) => s.deleteExpense);
  const { icon: Icon, className } = EXPENSE_CATEGORY_META[expense.category];

  const dateLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
    new Date(expense.spentAt),
  );

  return (
    <div className="hover:bg-accent/40 group flex items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0">
      <div className={cn("bg-muted flex size-8 shrink-0 items-center justify-center rounded-full", className)}>
        <Icon className="size-4" />
      </div>

      <button
        type="button"
        onClick={() => onEdit(expense)}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="truncate text-sm font-medium">
          {expense.note || t(`expenseCategory.${expense.category}`)}
        </span>
        <span className="text-muted-foreground text-xs">{dateLabel}</span>
      </button>

      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {formatCurrency(expense.amount, locale, expense.currency)}
      </span>

      <button
        type="button"
        onClick={() => void deleteExpense(expense.id)}
        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={t("actions.delete")}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}
