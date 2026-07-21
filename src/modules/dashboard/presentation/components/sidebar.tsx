"use client";

import { Link } from "@/shared/i18n/navigation";
import { footerNav, mainNav } from "@/shared/config/nav";
import { siteConfig } from "@/shared/config/site";
import { Logo } from "@/shared/components/composed/logo";
import { Separator } from "@/shared/components/ui/separator";
import { NavLink } from "./nav-link";

/**
 * Desktop sidebar. Fixed width, always visible at `lg` and up; hidden below
 * that breakpoint in favor of the sheet-based `MobileNav`.
 */
export function Sidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-14 items-center gap-2 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo className="size-7" />
          <span>{siteConfig.name}</span>
        </Link>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <Separator className="bg-sidebar-border" />
      <nav className="flex flex-col gap-1 p-3">
        {footerNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </aside>
  );
}
