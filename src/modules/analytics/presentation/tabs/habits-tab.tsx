"use client";

import { useTranslations } from "next-intl";
import { RepeatIcon } from "lucide-react";

import { EmptyState } from "@/shared/components/composed/empty-state";

export function HabitsTab() {
  const t = useTranslations("analytics.habits");

  return <EmptyState icon={RepeatIcon} title={t("title")} description={t("description")} />;
}
