import { getTranslations } from "next-intl/server";

import { FinanceView } from "@/modules/finance/presentation/finance-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.finance");
  return { title: t("title") };
}

export default function FinancePage() {
  return <FinanceView />;
}
