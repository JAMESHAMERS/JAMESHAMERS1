"use client";

import { useEffect } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAssistantStore } from "../application/assistant-store";

/**
 * Triggers `hydrate()` after mount (never during SSR — the store reads
 * `localStorage` and pings the API-availability route) and renders a
 * skeleton until data is ready, same pattern as every other module's
 * provider (see `AnalyticsProvider`).
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useAssistantStore((s) => s.hydrated);
  const hydrate = useAssistantStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
