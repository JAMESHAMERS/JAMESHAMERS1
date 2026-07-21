import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { LocaleSwitcher } from "@/shared/components/composed/locale-switcher";
import { ThemeToggle } from "@/shared/components/composed/theme-toggle";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MobileNav />
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
        <Avatar className="ml-1 size-8">
          <AvatarFallback>LO</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
