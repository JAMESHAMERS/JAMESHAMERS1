"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/shared/i18n/navigation";
import type { NavItem } from "@/shared/config/nav";
import { cn } from "@/shared/lib/utils";

interface NavLinkProps {
  item: NavItem;
  onNavigate?: () => void;
}

export function NavLink({ item, onNavigate }: NavLinkProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md py-2 pr-3 pl-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn("h-4 w-1 shrink-0 rounded-full transition-colors", isActive ? "bg-primary" : "bg-transparent")}
      />
      <Icon className="size-4 shrink-0" />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}
