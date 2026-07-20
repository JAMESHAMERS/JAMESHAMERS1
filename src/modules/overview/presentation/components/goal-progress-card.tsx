"use client";

import { useTranslations } from "next-intl";
import { TargetIcon } from "lucide-react";

import type { GoalSummary } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";

export function GoalProgressCard({ goals }: { goals: GoalSummary[] }) {
  const t = useTranslations("dashboard");

  return (
    <WidgetCard
      title={t("widgets.goals.title")}
      icon={TargetIcon}
      action={{ href: "/goals", label: t("widgets.goals.viewAll") }}
    >
      {goals.length === 0 ? (
        <EmptyState title={t("widgets.goals.title")} />
      ) : (
        <ul className="flex flex-col gap-4">
          {goals.map((goal) => (
            <li key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {t(`demo.goals.${goal.titleKey}`)}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {t(`demo.categories.${goal.categoryKey}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={goal.progress} className="h-1.5" />
                <span className="text-muted-foreground w-9 shrink-0 text-right text-xs tabular-nums">
                  {goal.progress}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
