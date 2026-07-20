"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { Transaction, TransactionType } from "../../domain/types";
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
import { DatePicker } from "@/shared/components/composed/date-picker";
import { TypeSelect } from "./type-select";
import { CategoryPicker } from "./category-picker";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing transaction; omitted when creating one. */
  transaction?: Transaction | null;
  initialType?: TransactionType;
}

function combineDateWithTime(datePart: Date, timeSource: Date) {
  const combined = new Date(datePart);
  combined.setHours(timeSource.getHours(), timeSource.getMinutes(), timeSource.getSeconds());
  return combined;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  initialType = "expense",
}: TransactionDialogProps) {
  const t = useTranslations("finance");
  const createTransaction = useFinanceStore((s) => s.createTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's documented "adjust state during render" pattern (not an
  // effect): resets the form whenever the *identity* of what's being
  // edited changes (opening fresh vs. opening a different transaction),
  // not on every render while the dialog stays open.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (transaction?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setType(transaction?.type ?? initialType);
      setAmount(transaction ? String(transaction.amount) : "");
      setCategoryId(transaction?.categoryId ?? null);
      setDate(transaction ? new Date(transaction.occurredAt) : new Date());
      setNote(transaction?.note ?? "");
    }
  }

  async function handleSubmit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0 || submitting) return;
    setSubmitting(true);
    try {
      const occurredAt = combineDateWithTime(
        date,
        transaction ? new Date(transaction.occurredAt) : new Date(),
      ).toISOString();

      if (transaction) {
        await updateTransaction(transaction.id, {
          type,
          amount: numericAmount,
          categoryId,
          note,
          occurredAt,
        });
      } else {
        await createTransaction({ type, amount: numericAmount, categoryId, note, occurredAt });
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
          <DialogTitle>{transaction ? t("editTransaction") : t("addTransaction")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("type.label")}</Label>
            <TypeSelect
              value={type}
              onChange={(next) => {
                setType(next);
                setCategoryId(null);
              }}
            />
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
            <Label className="text-muted-foreground text-xs">{t("category.label")}</Label>
            <CategoryPicker kind={type} value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("date")}</Label>
            <DatePicker value={date} onChange={(d) => setDate(d ?? new Date())} className="w-full" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("note")}</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!amount || Number(amount) <= 0 || submitting}>
            {transaction ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
