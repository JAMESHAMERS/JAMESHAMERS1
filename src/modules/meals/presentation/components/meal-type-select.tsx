"use client";

import { useTranslations } from "next-intl";

import { MEAL_TYPES, type MealType } from "../../domain/types";
import { MEAL_TYPE_META } from "../meals-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function MealTypeSelect({
  value,
  onChange,
  className,
}: {
  value: MealType;
  onChange: (type: MealType) => void;
  className?: string;
}) {
  const t = useTranslations("meals.type");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MealType)}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MEAL_TYPES.map((type) => {
          const { icon: Icon, className: colorClassName } = MEAL_TYPE_META[type];
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
