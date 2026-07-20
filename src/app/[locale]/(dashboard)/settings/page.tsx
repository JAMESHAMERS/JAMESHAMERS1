import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/shared/components/composed/page-header";
import { AppearanceSection } from "@/modules/settings/presentation/components/appearance-section";
import { LanguageSection } from "@/modules/settings/presentation/components/language-section";

export async function generateMetadata() {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid max-w-2xl gap-6">
        <AppearanceSection />
        <LanguageSection />
      </div>
    </div>
  );
}
