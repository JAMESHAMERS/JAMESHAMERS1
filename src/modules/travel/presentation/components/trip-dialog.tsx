"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";

import type { Trip } from "../../domain/types";
import { COVER_COLORS } from "../../domain/types";
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
import { cn } from "@/shared/lib/utils";

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface TripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip | null;
}

export function TripDialog({ open, onOpenChange, trip }: TripDialogProps) {
  const t = useTranslations("travel");
  const createTrip = useTravelStore((s) => s.createTrip);
  const updateTrip = useTravelStore((s) => s.updateTrip);

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [budget, setBudget] = useState("");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // React's documented "adjust state during render" pattern (not an
  // effect) — see finance/presentation/components/transaction-dialog.tsx.
  const [formKey, setFormKey] = useState<string | null>(null);
  const nextFormKey = open ? (trip?.id ?? "new") : null;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (nextFormKey) {
      setName(trip?.name ?? "");
      setDestination(trip?.destination ?? "");
      setStartDate(trip ? new Date(trip.startDate) : new Date());
      setEndDate(trip ? new Date(trip.endDate) : new Date());
      setBudget(trip ? String(trip.budget) : "");
      setCoverColor(trip?.coverColor ?? COVER_COLORS[0]);
      setNotes(trip?.notes ?? "");
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !destination.trim() || !startDate || !endDate || submitting) return;
    if (endDate < startDate) return;
    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        destination: destination.trim(),
        startDate: toDateKey(startDate),
        endDate: toDateKey(endDate),
        budget: budget ? Number(budget) : 0,
        coverColor,
        notes,
      };

      if (trip) {
        await updateTrip(trip.id, input);
      } else {
        await createTrip(input);
      }
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const isInvalid = !name.trim() || !destination.trim() || !startDate || !endDate || (startDate && endDate && endDate < startDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{trip ? t("editTrip") : t("addTrip")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("name")}</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("destination")}</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t("destinationPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("startDate")}</Label>
              <DatePicker value={startDate} onChange={setStartDate} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">{t("endDate")}</Label>
              <DatePicker value={endDate} onChange={setEndDate} className="w-full" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("budgetAmount")}</Label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="pr-12"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                VND
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("cover")}</Label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCoverColor(color)}
                  className="flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow"
                  style={{ backgroundColor: color, boxShadow: coverColor === color ? `0 0 0 2px ${color}` : undefined }}
                >
                  {coverColor === color ? <CheckIcon className="size-3.5 text-white" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className={cn("min-h-16")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={Boolean(isInvalid) || submitting}>
            {trip ? t("actions.save") : t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
