"use client";

import { useTranslations } from "next-intl";
import {
  ListPlusIcon,
  NotebookPenIcon,
  RepeatIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react";

import { Link } from "@/shared/i18n/navigation";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function QuickActionsCard() {
  const t = useTranslations("dashboard.widgets.quickActions");

  const actions = [
    { href: "/tasks", label: t("addTask"), icon: ListPlusIcon },
    { href: "/habits", label: t("addHabit"), icon: RepeatIcon },
    { href: "/finance", label: t("addTransaction"), icon: WalletIcon },
    { href: "/journal", label: t("addJournal"), icon: NotebookPenIcon },
  ] as const;

  return (
    <WidgetCard title={t("title")} icon={ZapIcon}>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto flex-col gap-1.5 py-3 text-xs font-normal",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </div>
    </WidgetCard>
  );
}
