"use client";

import { useTranslations } from "next-intl";
import { BellIcon } from "lucide-react";

import { DatePicker } from "@/shared/components/composed/date-picker";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toDateKey } from "@/shared/lib/date-grid";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface DueDateFieldProps {
  dueDate: string | null;
  reminderAt: string | null;
  onChangeDueDate: (dueDate: string | null) => void;
  onChangeReminder: (reminderAt: string | null) => void;
}

export function DueDateField({
  dueDate,
  reminderAt,
  onChangeDueDate,
  onChangeReminder,
}: DueDateFieldProps) {
  const t = useTranslations("tasks.detail");

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">{t("dueDate")}</Label>
        <DatePicker
          value={dueDate ? new Date(`${dueDate}T00:00:00`) : null}
          onChange={(date) => onChangeDueDate(date ? toDateKey(date) : null)}
          placeholder={t("noDueDate")}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <BellIcon className="size-3.5" />
            {t("reminder")}
          </Label>
          <Switch
            checked={Boolean(reminderAt)}
            onCheckedChange={(checked) => {
              if (checked) {
                const base = dueDate ? new Date(`${dueDate}T09:00:00`) : new Date(Date.now() + 60 * 60 * 1000);
                onChangeReminder(base.toISOString());
              } else {
                onChangeReminder(null);
              }
            }}
          />
        </div>
        {reminderAt ? (
          <Input
            type="datetime-local"
            value={toLocalInputValue(reminderAt)}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              onChangeReminder(new Date(value).toISOString());
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
