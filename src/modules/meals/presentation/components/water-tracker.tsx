"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { DropletsIcon, PlusIcon, XIcon } from "lucide-react";

import { WATER_QUICK_ADD } from "../../domain/types";
import { dayKeyOf, sortByLoggedAtDesc, sumWater, waterForDay } from "../../domain/rules";
import { useMealsStore } from "../../application/meals-store";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";

function loggedAtFor(day: Date) {
  const now = new Date();
  const isToday = dayKeyOf(day) === dayKeyOf(now);
  const result = new Date(day);
  if (isToday) {
    result.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  } else {
    result.setHours(12, 0, 0, 0);
  }
  return result.toISOString();
}

export function WaterTracker({ day }: { day: Date }) {
  const t = useTranslations("meals");
  const waterEntries = useMealsStore((s) => s.waterEntries);
  const goals = useMealsStore((s) => s.goals);
  const createWaterEntry = useMealsStore((s) => s.createWaterEntry);
  const deleteWaterEntry = useMealsStore((s) => s.deleteWaterEntry);

  const dayKey = dayKeyOf(day);
  const dayEntries = useMemo(
    () => sortByLoggedAtDesc(waterForDay(waterEntries, dayKey)),
    [waterEntries, dayKey],
  );
  const total = sumWater(dayEntries);
  const percent = goals.waterMl === 0 ? 0 : Math.min(100, Math.round((total / goals.waterMl) * 100));

  return (
    <WidgetCard title={t("water")} icon={DropletsIcon}>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums">
            {total}
            <span className="text-muted-foreground text-sm font-normal"> / {goals.waterMl} ml</span>
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">{percent}%</span>
        </div>

        <Progress value={percent} indicatorClassName="bg-chart-accent" />

        <div className="flex gap-2">
          {WATER_QUICK_ADD.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              className="flex-1 gap-1 px-1.5 text-xs"
              onClick={() => void createWaterEntry({ amountMl: amount, loggedAt: loggedAtFor(day) })}
            >
              <PlusIcon className="size-3" />
              {amount}ml
            </Button>
          ))}
        </div>

        {dayEntries.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {dayEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => void deleteWaterEntry(entry.id)}
                className="group border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors"
              >
                {entry.amountMl}ml
                <XIcon className="hidden size-2.5 group-hover:inline" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </WidgetCard>
  );
}
