"use client";

import { useLocale, useTranslations } from "next-intl";
import { LanguagesIcon } from "lucide-react";

import { routing } from "@/shared/i18n/routing";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const localeLabels: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export function LocaleSwitcher() {
  const t = useTranslations("theme");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")}>
          <LanguagesIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((nextLocale) => (
          <DropdownMenuItem
            key={nextLocale}
            disabled={nextLocale === locale}
            onClick={() => router.replace(pathname, { locale: nextLocale })}
          >
            {localeLabels[nextLocale] ?? nextLocale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
