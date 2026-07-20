import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

/**
 * Reusable metric tile for module dashboards (task count, streak, balance...).
 * Ready for future modules to consume — not wired to real data yet.
 */
export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <Card className={cn("gap-2 py-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-4 pt-0">
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {label}
        </CardTitle>
        {Icon ? <Icon className="text-muted-foreground size-4" /> : null}
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
