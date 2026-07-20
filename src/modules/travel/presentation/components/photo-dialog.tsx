"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, UploadIcon } from "lucide-react";

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
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/composed/date-picker";

interface PhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

/**
 * `URL.createObjectURL` on the selected file — same trade-off as Tasks'
 * `AttachmentList`: no network storage yet, so the preview doesn't survive
 * a reload. Real upload is `SupabaseTravelRepository.createPhoto`'s job
 * once auth/storage exist (see docs/ROADMAP.md).
 */
export function PhotoDialog({ open, onOpenChange, tripId }: PhotoDialogProps) {
  const t = useTranslations("travel");
  const createPhoto = useTravelStore((s) => s.createPhoto);
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  const [formKey, setFormKey] = useState<boolean | null>(null);
  if (open !== formKey) {
    setFormKey(open);
    if (open) {
      setFile(null);
      setPreviewUrl(null);
      setCaption("");
      setTakenAt(new Date());
    }
  }

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit() {
    if (!previewUrl || submitting) return;
    setSubmitting(true);
    try {
      await createPhoto({ tripId, url: previewUrl, caption, takenAt: takenAt.toISOString() });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addPhoto")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-40 w-full rounded-md border object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border-border text-muted-foreground hover:bg-accent/50 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm"
            >
              <ImageIcon className="size-6" />
              {t("choosePhoto")}
            </button>
          )}

          {file ? (
            <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => inputRef.current?.click()}>
              <UploadIcon className="size-3.5" />
              {t("changePhoto")}
            </Button>
          ) : null}

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("caption")}</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t("captionPlaceholder")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">{t("date")}</Label>
            <DatePicker value={takenAt} onChange={(d) => setTakenAt(d ?? new Date())} className="w-full" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!previewUrl || submitting}>
            {t("actions.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
