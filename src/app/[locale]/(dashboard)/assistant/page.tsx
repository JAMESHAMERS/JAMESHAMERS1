import { getTranslations } from "next-intl/server";

import { AssistantView } from "@/modules/assistant/presentation/assistant-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.assistant");
  return { title: t("title") };
}

export default function AssistantPage() {
  return <AssistantView />;
}
