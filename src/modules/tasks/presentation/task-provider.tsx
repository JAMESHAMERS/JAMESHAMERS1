"use client";

import { useEffect } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTaskStore } from "../application/task-store";

/**
 * Triggers `hydrate()` after mount (never during SSR — see
 * application/task-store.ts) and renders a skeleton until the store has
 * real data, avoiding any server/client markup mismatch from
 * `localStorage`-backed state.
 */
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useTaskStore((s) => s.hydrated);
  const hydrate = useTaskStore((s) => s.hydrate);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
