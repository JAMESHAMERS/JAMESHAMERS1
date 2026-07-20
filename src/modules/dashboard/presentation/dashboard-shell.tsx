import type { ReactNode } from "react";

import { PageTransition } from "@/shared/components/composed/page-transition";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";

/**
 * Composition root for the authenticated app shell. `(dashboard)/layout.tsx`
 * is intentionally a thin wrapper around this — the shell lives in the
 * `dashboard` module so it can be unit-tested and evolved independently of
 * Next.js routing conventions.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
