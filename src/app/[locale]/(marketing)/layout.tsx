import { Link } from "@/shared/i18n/navigation";
import { siteConfig } from "@/shared/config/site";
import { LocaleSwitcher } from "@/shared/components/composed/locale-switcher";
import { ThemeToggle } from "@/shared/components/composed/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-sm">
            L
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
