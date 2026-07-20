"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { FileIcon, PaperclipIcon, XIcon } from "lucide-react";

import type { Attachment } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { Button } from "@/shared/components/ui/button";
import { formatBytes } from "@/shared/lib/format";

export function AttachmentList({ taskId, attachments }: { taskId: string; attachments: Attachment[] }) {
  const t = useTranslations("tasks.detail");
  const addAttachment = useTaskStore((s) => s.addAttachment);
  const deleteAttachment = useTaskStore((s) => s.deleteAttachment);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2.5">
      {attachments.length > 0 ? (
        <ul className="space-y-1.5">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="group hover:bg-accent/50 flex items-center gap-2.5 rounded-md border px-2.5 py-2"
            >
              {attachment.contentType?.startsWith("image/") ? (
                // blob: object URL preview; next/image's optimizer can't
                // process these and there's nothing to optimize for a local file.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.url}
                  alt=""
                  className="size-8 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded">
                  <FileIcon className="text-muted-foreground size-4" />
                </div>
              )}
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm hover:underline"
              >
                {attachment.fileName}
              </a>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {formatBytes(attachment.sizeBytes)}
              </span>
              <button
                type="button"
                onClick={() => void deleteAttachment(taskId, attachment.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void addAttachment(taskId, file);
          e.target.value = "";
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => inputRef.current?.click()}
      >
        <PaperclipIcon className="size-3.5" />
        {t("addAttachment")}
      </Button>
    </div>
  );
}
