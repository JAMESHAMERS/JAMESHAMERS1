"use client";

import { useLocale, useTranslations } from "next-intl";

import { routing } from "@/shared/i18n/routing";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const localeLabels: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export function LanguageSection() {
  const t = useTranslations("settings.language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {routing.locales.map((nextLocale) => (
          <Button
            key={nextLocale}
            variant="outline"
            onClick={() => router.replace(pathname, { locale: nextLocale })}
            className={cn(
              locale === nextLocale && "border-primary ring-primary/30 ring-1",
            )}
          >
            {localeLabels[nextLocale] ?? nextLocale}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
