import { getTranslations } from "next-intl/server";

import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

export default async function LandingPage() {
  const t = await getTranslations("common");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("appName")}
      </h1>
      <p className="text-muted-foreground max-w-md text-balance">
        {t("tagline")}
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard">{t("cta.enterApp")}</Link>
      </Button>
    </div>
  );
}
