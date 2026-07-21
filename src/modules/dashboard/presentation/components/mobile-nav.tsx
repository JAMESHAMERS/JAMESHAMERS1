"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";

import { Link } from "@/shared/i18n/navigation";
import { footerNav, mainNav } from "@/shared/config/nav";
import { siteConfig } from "@/shared/config/site";
import { Logo } from "@/shared/components/composed/logo";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { NavLink } from "./nav-link";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("openMenu")}>
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-72 p-0">
        <SheetHeader className="h-14 justify-center">
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Logo className="size-7" />
              <span>{siteConfig.name}</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <Separator className="bg-sidebar-border" />
        <nav className="flex flex-col gap-1 p-3">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
        <Separator className="bg-sidebar-border" />
        <nav className="flex flex-col gap-1 p-3">
          {footerNav.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
