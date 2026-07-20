"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { MealEntry, MealType } from "../../domain/types";
import { useMealsStore } from "../../application/meals-store";
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
import { MealTypeSelect } from "./meal-type-select";

interface MealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing entry; omitted when creating one. */
  entry?: MealEntry | null;
  /** Day the entry should be logged on when creating (ignored when editing — the entry's own day is kept). */
  day: Date;
  initialMealType?: MealType;
}

function timeStringOf(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function combineDayWithTime(day: Date, timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const combined = new Date(day);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
}

export function MealDialog({ open, onOpenChange, entry, day, initialMealType = "breakfast" }: MealDialogProps) {
  const t = useTranslations("meals");
  const createMealEntry = useMealsStore((s) => s.createMealEntry);
  const updateMealEntry = useMealsStore((s) => s.updateMealEntry);

  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [time, setTime] = useState(timeStringOf(new Date()));
  const [submitting, setSubmitting] = useState(false);

  // React's documented "adjust state during render" pattern (not an
  // effect): resets the form whenever the *identity* of what's being
  // edited changes — see finance/presentation/components/transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (entry?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setMealType(entry?.mealType ?? initialMealType);
      setName(entry?.name ?? "");
      setCalories(entry ? String(entry.calories) : "");
      setProtein(entry ? String(entry.protein) : "");
      setCarbs(entry ? String(entry.carbs) : "");
      setFat(entry ? String(entry.fat) : "");
      setTime(timeStringOf(entry ? new Date(entry.loggedAt) : new Date()));
    }
  }

  async function handleSubmit() {
    const numericCalories = Number(calories);
    if (!name.trim() || !numericCalories || numericCalories < 0 || submitting) return;
    setSubmitting(true);
    try {
      const loggedAt = combineDayWithTime(entry ? new Date(entry.loggedAt) : day, time).toISOString();
      const input = {
        mealType,
        name: name.trim(),
        calories: numericCalories,
        protein: protein ? Number(protein) : 0,
        carbs: carbs ? Number(carbs) : 0,
        fat: fat ? Number(fat) : 0,
        loggedAt,
      };

      if (entry) {
        await updateMealEntry(entry.id, input);
      } else {
        await createMealEntry(input);
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
          <DialogTitle>{entry ? t("editEntry") : t("addEntry")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("type.label")}</Label>
            <MealTypeSelect value={mealType} onChange={setMealType} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("name")}</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("calories")}</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("time")}</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("protein")}</Label>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("carbs")}</Label>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("fat")}</Label>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !calories || submitting}>
            {entry ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
