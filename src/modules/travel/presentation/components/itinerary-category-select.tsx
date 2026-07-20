"use client";

import { useTranslations } from "next-intl";

import { ITINERARY_CATEGORIES, type ItineraryCategory } from "../../domain/types";
import { ITINERARY_CATEGORY_META } from "../travel-meta";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export function ItineraryCategorySelect({
  value,
  onChange,
  className,
}: {
  value: ItineraryCategory;
  onChange: (category: ItineraryCategory) => void;
  className?: string;
}) {
  const t = useTranslations("travel.itineraryCategory");

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ItineraryCategory)}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ITINERARY_CATEGORIES.map((category) => {
          const { icon: Icon, className: colorClassName } = ITINERARY_CATEGORY_META[category];
          return (
            <SelectItem key={category} value={category}>
              <span className="flex items-center gap-2">
                <Icon className={cn("size-3.5", colorClassName)} />
                {t(category)}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
