"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { SendIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

interface ChatInputProps {
  disabled: boolean;
  onSend: (message: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const t = useTranslations("assistant");
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("inputPlaceholder")}
        disabled={disabled}
        className="min-h-11 resize-none"
        rows={1}
      />
      <Button type="button" size="icon" disabled={disabled || !value.trim()} onClick={submit} aria-label={t("send")}>
        <SendIcon />
      </Button>
    </div>
  );
}
