"use client";

import { useTranslations } from "next-intl";

import { TRANSACTION_TYPES, type TransactionType } from "../../domain/types";
import { TYPE_META } from "../finance-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function TypeSelect({
  value,
  onChange,
  className,
}: {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
}) {
  const t = useTranslations("finance.type");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as TransactionType)}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TRANSACTION_TYPES.map((type) => {
          const { icon: Icon, className: colorClassName } = TYPE_META[type];
          return (
            <SelectItem key={type} value={type}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-3.5", colorClassName)} />
                {t(type)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
