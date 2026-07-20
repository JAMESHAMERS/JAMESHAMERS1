"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { MEAL_TYPES, type MealEntry, type MealType } from "../../domain/types";
import {
  dayKeyOf,
  entriesForDay,
  groupByMealType,
  sortByLoggedAtDesc,
  sumCalories,
  sumMacros,
} from "../../domain/rules";
import { useMealsStore } from "../../application/meals-store";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { MEAL_TYPE_META } from "../meals-meta";
import { CalorieRing } from "../components/calorie-ring";
import { MacroProgress } from "../components/macro-progress";
import { WaterTracker } from "../components/water-tracker";
import { MealEntryRow } from "../components/meal-entry-row";
import { MealDialog } from "../components/meal-dialog";

function isSameDay(a: Date, b: Date) {
  return dayKeyOf(a) === dayKeyOf(b);
}

function addDays(date: Date, delta: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

export function TodayTab() {
  const t = useTranslations("meals");
  const locale = useLocale();
  const mealEntries = useMealsStore((s) => s.mealEntries);
  const goals = useMealsStore((s) => s.goals);
  const activeDay = useMealsStore((s) => s.activeDay);
  const setActiveDay = useMealsStore((s) => s.setActiveDay);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogMealType, setDialogMealType] = useState<MealType>("breakfast");

  const dayKey = dayKeyOf(activeDay);
  const dayEntries = useMemo(() => entriesForDay(mealEntries, dayKey), [mealEntries, dayKey]);
  const groups = useMemo(() => groupByMealType(dayEntries), [dayEntries]);

  const totalCalories = sumCalories(dayEntries);
  const macros = sumMacros(dayEntries);

  const dateLabel = isSameDay(activeDay, new Date())
    ? t("today")
    : new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(activeDay);

  function openCreate(mealType: MealType) {
    setEditingId(null);
    setDialogMealType(mealType);
    setDialogOpen(true);
  }

  function openEdit(entry: MealEntry) {
    setEditingId(entry.id);
    setDialogMealType(entry.mealType);
    setDialogOpen(true);
  }

  const editingEntry = dayEntries.find((e) => e.id === editingId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setActiveDay(addDays(activeDay, -1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="w-44 text-center text-sm font-medium capitalize">{dateLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setActiveDay(addDays(activeDay, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CalorieRing consumed={totalCalories} goal={goals.calories} />
        <MacroProgress consumed={macros} goals={goals} />
        <WaterTracker day={activeDay} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MEAL_TYPES.map((mealType) => {
          const entries = sortByLoggedAtDesc(groups[mealType]);
          const { icon: Icon, className } = MEAL_TYPE_META[mealType];
          const calories = sumCalories(entries);

          return (
            <Card key={mealType} className="gap-4 py-5">
              <CardHeader className="flex flex-row items-center justify-between px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon className={cn("size-4", className)} />
                  {t(`type.${mealType}`)}
                  {calories > 0 ? (
                    <span className="text-muted-foreground text-xs font-normal tabular-nums">
                      {t("caloriesShort", { count: calories })}
                    </span>
                  ) : null}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => openCreate(mealType)}
                  aria-label={t("addEntry")}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-5">
                {entries.length === 0 ? (
                  <p className="text-muted-foreground text-xs">{t("noEntries")}</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    {entries.map((entry) => (
                      <MealEntryRow key={entry.id} entry={entry} onEdit={openEdit} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        day={activeDay}
        initialMealType={dialogMealType}
      />
    </div>
  );
}
