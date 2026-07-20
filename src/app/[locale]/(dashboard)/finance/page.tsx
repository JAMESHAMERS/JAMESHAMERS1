import { WalletIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/shared/components/composed/page-header";
import { EmptyState } from "@/shared/components/composed/empty-state";

export async function generateMetadata() {
  const t = await getTranslations("modules.finance");
  return { title: t("title") };
}

export default async function FinancePage() {
  const t = await getTranslations("modules.finance");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <EmptyState
        icon={WalletIcon}
        title={t("empty.title")}
        description={t("empty.description")}
      />
    </div>
  );
}
