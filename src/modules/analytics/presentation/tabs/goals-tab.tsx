"use client";

import { useTranslations } from "next-intl";
import { TargetIcon } from "lucide-react";

import { EmptyState } from "@/shared/components/composed/empty-state";

export function GoalsTab() {
  const t = useTranslations("analytics.goals");

  return <EmptyState icon={TargetIcon} title={t("title")} description={t("description")} />;
}
