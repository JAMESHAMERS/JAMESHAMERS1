import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboardIcon,
  ListTodoIcon,
  RepeatIcon,
  WalletIcon,
  NotebookTextIcon,
  TargetIcon,
  SettingsIcon,
} from "lucide-react";

export interface NavItem {
  /** Path relative to the locale root, e.g. "/dashboard". */
  href: string;
  /** Key into the "nav" i18n namespace. */
  labelKey: string;
  icon: LucideIcon;
}

/**
 * Declarative registry of dashboard navigation entries. The sidebar and
 * mobile nav both render from this single list, so adding a module later
 * means adding one entry here instead of editing multiple nav components.
 */
export const mainNav: NavItem[] = [
  { href: "/dashboard", labelKey: "overview", icon: LayoutDashboardIcon },
  { href: "/tasks", labelKey: "tasks", icon: ListTodoIcon },
  { href: "/habits", labelKey: "habits", icon: RepeatIcon },
  { href: "/finance", labelKey: "finance", icon: WalletIcon },
  { href: "/journal", labelKey: "journal", icon: NotebookTextIcon },
  { href: "/goals", labelKey: "goals", icon: TargetIcon },
];

export const footerNav: NavItem[] = [
  { href: "/settings", labelKey: "settings", icon: SettingsIcon },
];
