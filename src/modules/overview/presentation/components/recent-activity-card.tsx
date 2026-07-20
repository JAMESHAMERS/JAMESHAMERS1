"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ActivityIcon,
  CheckCircle2Icon,
  NotebookTextIcon,
  RepeatIcon,
  WalletIcon,
} from "lucide-react";

import type { ActivityItem, ActivityKind } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { formatRelativeMinutes } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const kindMeta: Record<ActivityKind, { icon: typeof CheckCircle2Icon; tone: string }> = {
  task: { icon: CheckCircle2Icon, tone: "text-success bg-success/10" },
  habit: { icon: RepeatIcon, tone: "text-chart-2 bg-chart-2/10" },
  finance: { icon: WalletIcon, tone: "text-chart-4 bg-chart-4/10" },
  journal: { icon: NotebookTextIcon, tone: "text-chart-3 bg-chart-3/10" },
};

export function RecentActivityCard({ activity }: { activity: ActivityItem[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <WidgetCard title={t("widgets.activity.title")} icon={ActivityIcon}>
      {activity.length === 0 ? (
        <EmptyState title={t("widgets.activity.title")} />
      ) : (
        <ul className="flex flex-col gap-4">
          {activity.map((item) => {
            const { icon: Icon, tone } = kindMeta[item.kind];
            return (
              <li key={item.id} className="flex items-start gap-3">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm">
                    {t(`demo.activity.${item.messageKey}`, item.messageValues)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatRelativeMinutes(item.minutesAgo, locale)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
