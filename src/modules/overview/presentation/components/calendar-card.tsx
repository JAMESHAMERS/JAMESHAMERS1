"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CalendarDaysIcon } from "lucide-react";

import { WidgetCard } from "@/shared/components/composed/widget-card";
import { MiniCalendar } from "@/shared/components/composed/mini-calendar";

export function CalendarCard({ markedDates }: { markedDates: string[] }) {
  const t = useTranslations("dashboard");
  const marked = useMemo(() => new Set(markedDates), [markedDates]);

  return (
    <WidgetCard title={t("widgets.calendar.title")} icon={CalendarDaysIcon}>
      <MiniCalendar markedDates={marked} />
    </WidgetCard>
  );
}
