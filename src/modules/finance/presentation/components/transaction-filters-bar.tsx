"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";

import { TRANSACTION_TYPES, EMPTY_FILTERS, type TransactionType } from "../../domain/types";
import { useFinanceStore } from "../../application/finance-store";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function TransactionFiltersBar() {
  const t = useTranslations("finance");
  const tType = useTranslations("finance.type");
  const filters = useFinanceStore((s) => s.filters);
  const setFilters = useFinanceStore((s) => s.setFilters);
  const categories = useFinanceStore((s) => s.categories);

  const hasActiveFilters =
    filters.search.length > 0 || filters.types.length > 0 || filters.categoryIds.length > 0;

  function toggleType(type: TransactionType) {
    const next = filters.types.includes(type)
      ? filters.types.filter((x) => x !== type)
      : [...filters.types, type];
    setFilters({ types: next });
  }

  function toggleCategory(categoryId: string) {
    const next = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    setFilters({ categoryIds: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder={t("filters.searchPlaceholder")}
          className="h-8 w-44 pl-8 text-sm sm:w-56"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("filters.type")}
            {filters.types.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.types.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          {TRANSACTION_TYPES.map((type) => (
            <label
              key={type}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox checked={filters.types.includes(type)} onCheckedChange={() => toggleType(type)} />
              {tType(type)}
            </label>
          ))}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {t("filters.category")}
            {filters.categoryIds.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 text-[10px]">
                {filters.categoryIds.length}
              </Badge>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <Checkbox
                  checked={filters.categoryIds.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
          {t("filters.clear")}
        </Button>
      ) : null}
    </div>
  );
}
