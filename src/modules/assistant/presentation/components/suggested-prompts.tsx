"use client";

import { useTranslations } from "next-intl";
import { CalendarCheckIcon, SmilePlusIcon, TargetIcon, WalletIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

const SUGGESTIONS = [
  { key: "today", icon: CalendarCheckIcon },
  { key: "spending", icon: WalletIcon },
  { key: "goals", icon: TargetIcon },
  { key: "mood", icon: SmilePlusIcon },
] as const;

export function SuggestedPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  const t = useTranslations("assistant");

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {SUGGESTIONS.map(({ key, icon: Icon }) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          className="h-auto justify-start gap-2 px-3 py-2.5 text-left whitespace-normal"
          onClick={() => onSelect(t(`suggestions.${key}`))}
        >
          <Icon className="text-muted-foreground size-4 shrink-0" />
          <span className="text-sm font-normal">{t(`suggestions.${key}`)}</span>
        </Button>
      ))}
    </div>
  );
}
