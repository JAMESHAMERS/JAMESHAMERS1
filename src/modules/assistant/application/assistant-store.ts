import { create } from "zustand";
import type Anthropic from "@anthropic-ai/sdk";

import type { AssistantContextSnapshot, CurrencyFormatter } from "../domain/rules";
import { buildContextSnapshot, localAnswer, type LocalAnswerTranslator } from "../domain/rules";
import type { AssistantToolName, ChatMessage } from "../domain/types";
import { loadAssistantSources } from "../infrastructure/read-sources";
import { executeTool } from "../infrastructure/tool-executor";

const MAX_TOOL_LOOP_ITERATIONS = 4;

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AssistantStoreState {
  messages: ChatMessage[];
  hydrated: boolean;
  /** null = not checked yet, true/false = the server route's answer to "is ANTHROPIC_API_KEY set". */
  apiAvailable: boolean | null;
  sending: boolean;
  snapshot: AssistantContextSnapshot | null;

  hydrate: () => Promise<void>;
  sendMessage: (
    question: string,
    t: LocalAnswerTranslator,
    formatCurrency: CurrencyFormatter,
    locale: "en" | "vi",
  ) => Promise<void>;
}

/**
 * The "application" layer for the Assistant module. `hydrate()` loads a
 * cross-module data snapshot (same pattern as Analytics) and checks
 * whether the server has an Anthropic API key configured. `sendMessage`
 * either runs the real Claude tool-use loop (client-side, because tool
 * execution needs `localStorage` — see `src/app/api/assistant/route.ts`)
 * or, with no key or on any failure, falls back to the deterministic
 * local engine in `domain/rules.ts`. Either way the user always gets an
 * answer.
 */
export const useAssistantStore = create<AssistantStoreState>((set, get) => ({
  messages: [],
  hydrated: false,
  apiAvailable: null,
  sending: false,
  snapshot: null,

  hydrate: async () => {
    if (get().hydrated) return;
    const [sources, availability] = await Promise.all([loadAssistantSources(), checkApiAvailability()]);
    set({ snapshot: buildContextSnapshot(sources), apiAvailable: availability, hydrated: true });
  },

  sendMessage: async (question, t, formatCurrency, locale) => {
    const trimmed = question.trim();
    if (!trimmed || get().sending) return;

    const userMessage: ChatMessage = { id: uid(), role: "user", content: trimmed, createdAt: new Date().toISOString() };
    set((s) => ({ messages: [...s.messages, userMessage], sending: true }));

    const { snapshot, apiAvailable, messages } = get();
    if (!snapshot) {
      set({ sending: false });
      return;
    }

    let answer: { text: string; toolsUsed: AssistantToolName[] };
    if (apiAvailable) {
      try {
        answer = await runApiToolLoop(trimmed, messages, snapshot, locale);
      } catch (error) {
        console.error("[assistant] falling back to local engine:", error);
        answer = localAnswer(trimmed, snapshot, t, formatCurrency);
      }
    } else {
      answer = localAnswer(trimmed, snapshot, t, formatCurrency);
    }

    const assistantMessage: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: answer.text,
      createdAt: new Date().toISOString(),
      toolsUsed: answer.toolsUsed,
    };
    set((s) => ({ messages: [...s.messages, assistantMessage], sending: false }));
  },
}));

async function checkApiAvailability(): Promise<boolean> {
  try {
    const res = await fetch("/api/assistant");
    if (!res.ok) return false;
    const data = (await res.json()) as { available: boolean };
    return data.available === true;
  } catch {
    return false;
  }
}

/**
 * The real, live tool-use loop — split across the client/server boundary
 * because tool execution reads `localStorage`. Sends the growing message
 * history to the route on each turn; when Claude asks for a `tool_use`,
 * executes it locally against `snapshot` and feeds the result back in.
 */
async function runApiToolLoop(
  question: string,
  priorMessages: ChatMessage[],
  snapshot: AssistantContextSnapshot,
  locale: "en" | "vi",
): Promise<{ text: string; toolsUsed: AssistantToolName[] }> {
  const working: Anthropic.MessageParam[] = [
    ...priorMessages.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: "user", content: question },
  ];
  const toolsUsed = new Set<AssistantToolName>();

  for (let iteration = 0; iteration < MAX_TOOL_LOOP_ITERATIONS; iteration += 1) {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: working, locale }),
    });
    if (!res.ok) throw new Error(`assistant route returned ${res.status}`);

    const data = (await res.json()) as { content: Anthropic.ContentBlock[]; stop_reason: string };

    if (data.stop_reason !== "tool_use") {
      const text = data.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join(" ")
        .trim();
      return { text: text || fallbackText(locale), toolsUsed: Array.from(toolsUsed) };
    }

    working.push({ role: "assistant", content: data.content });

    const toolUseBlocks = data.content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => {
      const name = block.name as AssistantToolName;
      toolsUsed.add(name);
      const result = executeTool(name, snapshot);
      return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result.data) };
    });
    working.push({ role: "user", content: toolResults });
  }

  throw new Error("assistant tool loop exceeded max iterations");
}

function fallbackText(locale: "en" | "vi") {
  return locale === "vi" ? "Xin lỗi, tôi không có câu trả lời ngay lúc này." : "Sorry, I don't have an answer right now.";
}
