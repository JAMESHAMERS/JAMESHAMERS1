"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, Trash2Icon } from "lucide-react";

import type { Budget } from "../../domain/types";
import { budgetProgress } from "../../domain/rules";
import { useFinanceStore } from "../../application/finance-store";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { BudgetDialog } from "../components/budget-dialog";

export function BudgetsTab() {
  const t = useTranslations("finance.budget");
  const tCommon = useTranslations("finance");
  const locale = useLocale();
  const budgets = useFinanceStore((s) => s.budgets);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const activeMonth = useFinanceStore((s) => s.activeMonth);
  const setActiveMonth = useFinanceStore((s) => s.setActiveMonth);
  const deleteBudget = useFinanceStore((s) => s.deleteBudget);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(activeMonth);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="w-36 text-center text-sm font-medium capitalize">{monthLabel}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingBudget(null);
            setDialogOpen(true);
          }}
        >
          <PlusIcon className="size-3.5" />
          {t("add")}
        </Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            const progress = budgetProgress(budget, transactions, activeMonth);

            return (
              <Card key={budget.id} className="gap-3 py-4">
                <CardContent className="space-y-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <span className="text-sm font-medium">{category?.name ?? tCommon("uncategorized")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudget(budget);
                          setDialogOpen(true);
                        }}
                        className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                      >
                        {tCommon("actions.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteBudget(budget.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label={tCommon("actions.delete")}
                      >
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <Progress
                    value={Math.min(100, progress.percent)}
                    indicatorClassName={cn(progress.isOver && "bg-destructive")}
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className={cn("font-medium tabular-nums", progress.isOver && "text-destructive")}>
                      {formatCurrency(progress.spent, locale)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {t("ofLimit", { limit: formatCurrency(progress.limit, locale) })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetDialog open={dialogOpen} onOpenChange={setDialogOpen} budget={editingBudget} />
    </div>
  );
}
