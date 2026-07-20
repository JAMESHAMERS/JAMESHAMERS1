import { getTranslations } from "next-intl/server";

import { JournalView } from "@/modules/journal/presentation/journal-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.journal");
  return { title: t("title") };
}

export default function JournalPage() {
  return <JournalView />;
}
