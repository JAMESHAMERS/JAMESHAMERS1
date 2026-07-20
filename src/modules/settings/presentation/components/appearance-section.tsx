"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const options = [
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
  { value: "system", icon: MonitorIcon },
] as const;

export function AppearanceSection() {
  const t = useTranslations("settings.appearance");
  const tTheme = useTranslations("theme");
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {options.map(({ value, icon: Icon }) => (
          <Button
            key={value}
            variant="outline"
            onClick={() => setTheme(value)}
            className={cn(
              "gap-2",
              theme === value && "border-primary ring-primary/30 ring-1",
            )}
          >
            <Icon /> {tTheme(value)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
