import { getTranslations } from "next-intl/server";

import { TravelView } from "@/modules/travel/presentation/travel-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.travel");
  return { title: t("title") };
}

export default function TravelPage() {
  return <TravelView />;
}
