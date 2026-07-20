import { getTranslations } from "next-intl/server";

import { OverviewView } from "@/modules/overview/presentation/overview-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.overview");
  return { title: t("title") };
}

export default function OverviewPage() {
  return <OverviewView />;
}
