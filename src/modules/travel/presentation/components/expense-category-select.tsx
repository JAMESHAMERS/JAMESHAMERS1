"use client";

import { useTranslations } from "next-intl";

import { EXPENSE_CATEGORIES, type ExpenseCategory } from "../../domain/types";
import { EXPENSE_CATEGORY_META } from "../travel-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function ExpenseCategorySelect({
  value,
  onChange,
  className,
}: {
  value: ExpenseCategory;
  onChange: (category: ExpenseCategory) => void;
  className?: string;
}) {
  const t = useTranslations("travel.expenseCategory");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ExpenseCategory)}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {EXPENSE_CATEGORIES.map((category) => {
          const { icon: Icon, className: colorClassName } = EXPENSE_CATEGORY_META[category];
          return (
            <SelectItem key={category} value={category}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-3.5", colorClassName)} />
                {t(category)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
