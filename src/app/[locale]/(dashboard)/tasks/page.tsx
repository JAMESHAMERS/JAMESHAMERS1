import { getTranslations } from "next-intl/server";

import { TasksView } from "@/modules/tasks/presentation/tasks-view";

export async function generateMetadata() {
  const t = await getTranslations("modules.tasks");
  return { title: t("title") };
}

export default function TasksPage() {
  return <TasksView />;
}
