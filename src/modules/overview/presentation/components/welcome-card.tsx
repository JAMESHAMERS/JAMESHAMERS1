"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FlameIcon, SparklesIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

function useGreetingKey() {
  return useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }, []);
}

export function WelcomeCard({ streakDays }: { streakDays: number }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const greetingKey = useGreetingKey();

  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <Card className="from-primary/5 via-card to-card overflow-hidden border-none bg-gradient-to-br py-0 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium capitalize">
            <SparklesIcon className="size-3.5" />
            {today}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t(`greeting.${greetingKey}`)}
          </h1>
          <p className="text-muted-foreground text-sm">{t("welcome.subtitle")}</p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 rounded-full px-3 py-1.5 text-sm"
        >
          <FlameIcon className="size-4 text-orange-500" />
          {t("welcome.streak", { days: streakDays })}
        </Badge>
      </CardContent>
    </Card>
  );
}
