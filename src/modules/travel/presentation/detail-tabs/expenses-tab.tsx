"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";

import type { TripExpense } from "../../domain/types";
import { budgetProgress, expensesForTrip } from "../../domain/rules";
import { useTravelStore } from "../../application/travel-store";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { ExpenseRow } from "../components/expense-row";
import { ExpenseDialog } from "../components/expense-dialog";

export function ExpensesTab({ tripId }: { tripId: string }) {
  const t = useTranslations("travel");
  const locale = useLocale();
  const trips = useTravelStore((s) => s.trips);
  const expenses = useTravelStore((s) => s.expenses);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === tripId) ?? null;
  const tripExpenses = useMemo(() => expensesForTrip(expenses, tripId), [expenses, tripId]);
  const progress = trip ? budgetProgress(trip, expenses) : null;

  function openCreate() {
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(expense: TripExpense) {
    setEditingId(expense.id);
    setDialogOpen(true);
  }

  const editingExpense = tripExpenses.find((e) => e.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {trip && trip.budget > 0 && progress ? (
        <div className="space-y-1.5 rounded-lg border p-3">
          <div className="flex items-center justify-between text-xs">
            <span className={cn("font-medium tabular-nums", progress.isOver && "text-destructive")}>
              {formatCurrency(progress.spent, locale)}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {t("budget.ofLimit", { limit: formatCurrency(progress.limit, locale) })}
            </span>
          </div>
          <Progress value={progress.percent} indicatorClassName={cn(progress.isOver && "bg-destructive")} />
        </div>
      ) : null}

      <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={openCreate}>
        <PlusIcon className="size-3.5" />
        {t("addExpense")}
      </Button>

      {tripExpenses.length === 0 ? (
        <EmptyState title={t("noExpenses")} className="py-10" />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {tripExpenses.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} onEdit={openEdit} />
          ))}
        </div>
      )}

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} tripId={tripId} expense={editingExpense} />
    </div>
  );
}
