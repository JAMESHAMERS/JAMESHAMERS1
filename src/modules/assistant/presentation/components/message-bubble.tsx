"use client";

import { useTranslations } from "next-intl";
import { BotIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "../../domain/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const t = useTranslations("assistant");
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <Avatar className="mt-0.5 size-7 shrink-0">
        <AvatarFallback className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
          {isUser ? <UserIcon className="size-3.5" /> : <BotIcon className="size-3.5" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex max-w-[80%] flex-col gap-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
            isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm",
          )}
        >
          {message.content}
        </div>
        {message.toolsUsed && message.toolsUsed.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {message.toolsUsed.map((tool) => (
              <Badge key={tool} variant="outline" className="text-muted-foreground text-[10px]">
                {t(`tools.${tool}`)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
