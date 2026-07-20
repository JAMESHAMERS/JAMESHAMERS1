import { getTranslations } from "next-intl/server";

import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground max-w-sm text-balance">
        {t("description")}
      </p>
      <Button asChild>
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
