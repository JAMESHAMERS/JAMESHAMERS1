"use client";

import { useEffect } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMealsStore } from "../application/meals-store";

/**
 * Triggers `hydrate()` after mount (never during SSR — see
 * application/meals-store.ts) and renders a skeleton until the store has
 * real data, avoiding any server/client markup mismatch from
 * `localStorage`-backed state.
 */
export function MealsProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useMealsStore((s) => s.hydrated);
  const hydrate = useMealsStore((s) => s.hydrate);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return <>{children}</>;
}
