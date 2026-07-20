"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { Budget } from "../../domain/types";
import { useFinanceStore } from "../../application/finance-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { CategoryPicker } from "./category-picker";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
}

export function BudgetDialog({ open, onOpenChange, budget }: BudgetDialogProps) {
  const t = useTranslations("finance.budget");
  const tCommon = useTranslations("finance");
  const createBudget = useFinanceStore((s) => s.createBudget);
  const updateBudget = useFinanceStore((s) => s.updateBudget);
  const budgets = useFinanceStore((s) => s.budgets);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [limit, setLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's "adjust state during render" pattern — see transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (budget?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setCategoryId(budget?.categoryId ?? null);
      setLimit(budget ? String(budget.monthlyLimit) : "");
    }
  }

  async function handleSubmit() {
    const numericLimit = Number(limit);
    if (!categoryId || !numericLimit || numericLimit <= 0 || submitting) return;
    setSubmitting(true);
    try {
      if (budget) {
        await updateBudget(budget.id, { monthlyLimit: numericLimit });
      } else {
        await createBudget({ categoryId, monthlyLimit: numericLimit });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const budgetedCategoryIds = budgets.filter((b) => b.id !== budget?.id).map((b) => b.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{budget ? t("edit") : t("add")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{tCommon("category.label")}</Label>
            <CategoryPicker
              kind="expense"
              value={categoryId}
              onChange={setCategoryId}
              excludeIds={budgetedCategoryIds}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("monthlyLimit")}</Label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="0"
                className="pr-12"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                VND
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!categoryId || !limit || submitting}>
            {budget ? tCommon("actions.save") : tCommon("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
