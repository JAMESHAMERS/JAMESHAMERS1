import { getTranslations } from "next-intl/server";

import { AnalyticsView } from "@/modules/analytics/presentation/analytics-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.analytics");
  return { title: t("title") };
}

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
