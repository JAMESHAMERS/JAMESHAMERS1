"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SendIcon, XIcon } from "lucide-react";

import type { Comment } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";

function formatTimestamp(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function CommentList({ taskId, comments }: { taskId: string; comments: Comment[] }) {
  const t = useTranslations("tasks.detail");
  const locale = useLocale();
  const addComment = useTaskStore((s) => s.addComment);
  const deleteComment = useTaskStore((s) => s.deleteComment);
  const [body, setBody] = useState("");

  function handleSubmit() {
    const value = body.trim();
    if (!value) return;
    void addComment(taskId, value);
    setBody("");
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="group flex gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">You</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {formatTimestamp(comment.createdAt, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => void deleteComment(taskId, comment.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("addComment")}
          className="min-h-16 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <Button size="icon" variant="outline" className="h-8 w-8 shrink-0 self-end" onClick={handleSubmit}>
          <SendIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
