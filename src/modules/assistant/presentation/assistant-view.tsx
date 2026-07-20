"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SparklesIcon } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { PageHeader } from "@/shared/components/composed/page-header";
import { formatCurrency } from "@/shared/lib/format";
import { useAssistantStore } from "../application/assistant-store";
import { AssistantProvider } from "./assistant-provider";
import { ChatInput } from "./components/chat-input";
import { MessageBubble } from "./components/message-bubble";
import { SuggestedPrompts } from "./components/suggested-prompts";

export function AssistantView() {
  const tModule = useTranslations("modules.assistant");
  const t = useTranslations("assistant");
  const locale = useLocale() as "en" | "vi";

  const messages = useAssistantStore((s) => s.messages);
  const sending = useAssistantStore((s) => s.sending);
  const apiAvailable = useAssistantStore((s) => s.apiAvailable);
  const sendMessage = useAssistantStore((s) => s.sendMessage);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function handleSend(text: string) {
    sendMessage(text, t, (amount) => formatCurrency(amount, locale), locale);
  }

  return (
    <AssistantProvider>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={tModule("title")}
          description={tModule("description")}
          actions={
            <Badge variant={apiAvailable ? "default" : "secondary"} className="gap-1">
              <SparklesIcon className="size-3" />
              {apiAvailable ? t("poweredBy.api") : t("poweredBy.local")}
            </Badge>
          }
        />

        <Card className="gap-0 py-0">
          <CardContent className="flex h-[65vh] flex-col p-0">
            <ScrollArea className="flex-1 px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                  <div className="space-y-1">
                    <h3 className="text-base font-medium">{t("emptyTitle")}</h3>
                    <p className="text-muted-foreground max-w-sm text-sm text-balance">{t("emptyDescription")}</p>
                  </div>
                  <div className="w-full max-w-md">
                    <SuggestedPrompts onSelect={handleSend} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {sending ? (
                    <div className="text-muted-foreground flex items-center gap-2 pl-9.5 text-sm">
                      <span className="flex gap-1">
                        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                        <span className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full" />
                      </span>
                      {t("thinking")}
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </ScrollArea>
            <div className="border-border border-t p-3">
              <ChatInput disabled={sending} onSend={handleSend} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AssistantProvider>
  );
}
