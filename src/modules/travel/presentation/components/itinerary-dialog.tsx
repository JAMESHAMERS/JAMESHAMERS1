"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { ItineraryCategory, ItineraryItem } from "../../domain/types";
import { useTravelStore } from "../../application/travel-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/composed/date-picker";
import { ItineraryCategorySelect } from "./itinerary-category-select";

interface ItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  item?: ItineraryItem | null;
}

function timeStringOf(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function combineDateWithTime(date: Date, timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
}

export function ItineraryDialog({ open, onOpenChange, tripId, item }: ItineraryDialogProps) {
  const t = useTranslations("travel");
  const createItineraryItem = useTravelStore((s) => s.createItineraryItem);
  const updateItineraryItem = useTravelStore((s) => s.updateItineraryItem);

  const [category, setCategory] = useState<ItineraryCategory>("activity");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's "adjust state during render" pattern — see finance's transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (item?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setCategory(item?.category ?? "activity");
      setTitle(item?.title ?? "");
      setLocation(item?.location ?? "");
      setDate(item ? new Date(item.startAt) : new Date());
      setStartTime(timeStringOf(item ? new Date(item.startAt) : new Date()));
      setEndTime(item?.endAt ? timeStringOf(new Date(item.endAt)) : "");
      setNotes(item?.notes ?? "");
    }
  }

  async function handleSubmit() {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const startAt = combineDateWithTime(date, startTime).toISOString();
      const endAt = endTime ? combineDateWithTime(date, endTime).toISOString() : null;
      const input = { category, title: title.trim(), location, startAt, endAt, notes };

      if (item) {
        await updateItineraryItem(item.id, input);
      } else {
        await createItineraryItem({ tripId, ...input });
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? t("editItineraryItem") : t("addItineraryItem")}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("itineraryCategory.label")}</Label>
            <ItineraryCategorySelect value={category} onChange={setCategory} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("title")}</Label>
            <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("location")}</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("locationPlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("date")}</Label>
            <DatePicker value={date} onChange={(d) => setDate(d ?? new Date())} className="w-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("startTime")}</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("endTime")}</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {item ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
