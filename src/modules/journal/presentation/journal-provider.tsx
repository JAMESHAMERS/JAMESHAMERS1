"use client";

import { useEffect } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useJournalStore } from "../application/journal-store";

/**
 * Triggers `hydrate()` after mount (never during SSR — see
 * application/journal-store.ts) and renders a skeleton until the store has
 * real data, avoiding any server/client markup mismatch from
 * `localStorage`-backed state.
 */
export function JournalProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useJournalStore((s) => s.hydrated);
  const hydrate = useJournalStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
