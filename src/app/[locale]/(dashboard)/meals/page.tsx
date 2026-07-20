import { getTranslations } from "next-intl/server";

import { MealsView } from "@/modules/meals/presentation/meals-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.meals");
  return { title: t("title") };
}

export default function MealsPage() {
  return <MealsView />;
}
