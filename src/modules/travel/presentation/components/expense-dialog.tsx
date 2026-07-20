"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { ExpenseCategory, TripExpense } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
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
import { DatePicker } from "@/shared/components/composed/date-picker";
import { ExpenseCategorySelect } from "./expense-category-select";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  expense?: TripExpense | null;
}

function combineDateWithTime(datePart: Date, timeSource: Date) {
  const combined = new Date(datePart);
  combined.setHours(timeSource.getHours(), timeSource.getMinutes(), timeSource.getSeconds());
  return combined;
}

export function ExpenseDialog({ open, onOpenChange, tripId, expense }: ExpenseDialogProps) {
  const t = useTranslations("travel");
  const createExpense = useTravelStore((s) => s.createExpense);
  const updateExpense = useTravelStore((s) => s.updateExpense);

  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's "adjust state during render" pattern — see finance's transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (expense?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setCategory(expense?.category ?? "food");
      setAmount(expense ? String(expense.amount) : "");
      setDate(expense ? new Date(expense.spentAt) : new Date());
      setNote(expense?.note ?? "");
    }
  }

  async function handleSubmit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || submitting) return;
    setSubmitting(true);
    try {
      const spentAt = combineDateWithTime(date, expense ? new Date(expense.spentAt) : new Date()).toISOString();
      const input = { category, amount: numericAmount, note, spentAt };

      if (expense) {
        await updateExpense(expense.id, input);
      } else {
        await createExpense({ tripId, ...input });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? t("editExpense") : t("addExpense")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("expenseCategory.label")}</Label>
            <ExpenseCategorySelect value={category} onChange={setCategory} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("amount")}</Label>
            <div className="relative">
              <Input
                autoFocus
                type="number"
                min={0}
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pr-12"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                VND
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("date")}</Label>
            <DatePicker value={date} onChange={(d) => setDate(d ?? new Date())} className="w-full" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("note")}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!amount || Number(amount) <= 0 || submitting}>
            {expense ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
