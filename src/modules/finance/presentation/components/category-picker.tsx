"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import type { TransactionType } from "../../domain/types";
import { useFinanceStore } from "../../application/finance-store";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

const PALETTE = ["#8b5cf6", "#0ea5e9", "#22c55e", "#ef4444", "#f59e0b", "#ec4899", "#14b8a6", "#6366f1"];

interface CategoryPickerProps {
  kind: TransactionType;
  value: string | null;
  onChange: (categoryId: string | null) => void;
  /** Category ids to hide from the list — e.g. categories that already have a budget. */
  excludeIds?: string[];
  className?: string;
}

/**
 * Single-select category dropdown, scoped to one transaction type (an
 * "Emergency Fund" category shouldn't show up when logging an expense).
 * Same create-inline pattern as Tasks' `LabelPicker`, but single-select.
 */
export function CategoryPicker({ kind, value, onChange, excludeIds, className }: CategoryPickerProps) {
  const t = useTranslations("finance.category");
  const categories = useFinanceStore((s) => s.categories).filter(
    (c) => c.kind === kind && (c.id === value || !excludeIds?.includes(c.id)),
  );
  const createCategory = useFinanceStore((s) => s.createCategory);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const selected = categories.find((c) => c.id === value);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const color = PALETTE[categories.length % PALETTE.length];
    const category = await createCategory({ name, color, kind });
    setNewName("");
    onChange(category.id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-between font-normal", className)}>
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: selected.color }} />
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("placeholder")}</span>
          )}
          <ChevronsUpDownIcon className="text-muted-foreground size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2" align="start">
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                onChange(category.id);
                setOpen(false);
              }}
              className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
              <span className="flex-1">{category.name}</span>
              {value === category.id ? <CheckIcon className="size-3.5" /> : null}
            </button>
          ))}
          {categories.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1.5 text-xs">{t("noCategories")}</p>
          ) : null}
        </div>
        <div className="mt-2 flex gap-1.5 border-t pt-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("newCategory")}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <Button size="sm" className="h-7 px-2" onClick={handleCreate}>
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
