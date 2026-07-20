import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRightIcon } from "lucide-react";

import { Link } from "@/shared/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface WidgetCardProps {
  title: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Shared shell for every dashboard widget: icon + title on the left,
 * an optional "view all" link on the right, consistent padding below.
 * Every widget in the overview module is built on this instead of a
 * one-off `Card` composition, so the grid reads as one visual system.
 */
export function WidgetCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
}: WidgetCardProps) {
  return (
    <Card className={cn("gap-4 py-5", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {Icon ? <Icon className="text-muted-foreground size-4" /> : null}
          {title}
        </CardTitle>
        {action ? (
          <Link
            href={action.href}
            className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs font-medium transition-colors"
          >
            {action.label}
            <ChevronRightIcon className="size-3.5" />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className={cn("px-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
