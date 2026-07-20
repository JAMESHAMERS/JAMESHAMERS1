import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { toAnthropicTools } from "@/modules/assistant/infrastructure/anthropic-tools";

/**
 * The app's first Route Handler. Deliberately thin: it only proxies a
 * single `messages.create` call to Anthropic. Tool *execution* can't live
 * here — every `Local<X>Repository` this app has reads `localStorage`,
 * which a server route can never reach — so the multi-turn tool-use loop
 * lives client-side, in `application/assistant-store.ts`: it calls this
 * route, executes any `tool_use` blocks the response contains against
 * the browser's local data, and calls back in with the results appended.
 * See `src/modules/assistant/README.md` for the full shape of that loop
 * and why it's split across the client/server boundary this way.
 *
 * Requires `ANTHROPIC_API_KEY` (server-only, see `.env.example`). Without
 * it, GET reports unavailable and the store falls back to the local
 * deterministic engine — the Assistant always answers something, key or
 * no key, mirroring every other module's "Local repo active / Supabase
 * repo written, not wired" pattern.
 */

export const runtime = "nodejs";

const MODEL = "claude-opus-4-8";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.unknown(),
      }),
    )
    .min(1)
    .max(40),
  locale: z.enum(["en", "vi"]).default("en"),
});

function buildSystemPrompt(locale: "en" | "vi") {
  const languageName = locale === "vi" ? "Vietnamese" : "English";
  return [
    "You are the LifeOS Assistant, embedded in the user's personal life-management app.",
    "You have read-only tools over the user's real tasks, finances, meals, journal, and travel data.",
    "Always call the relevant tool(s) before answering any question about the user's data — never guess or invent numbers.",
    "If asked about goals, call get_goals_status and be honest that goal tracking isn't built into the app yet — do not pretend to have goal data.",
    `Answer in ${languageName}, in 2-4 concise, warm, direct sentences.`,
  ].join(" ");
}

export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI Assistant is not configured on this server." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: buildSystemPrompt(parsed.data.locale),
      tools: toAnthropicTools(),
      messages: parsed.data.messages as Anthropic.MessageParam[],
    });

    return NextResponse.json({ content: response.content, stop_reason: response.stop_reason });
  } catch (error) {
    console.error("[assistant] Anthropic API error:", error);
    return NextResponse.json({ error: "The AI Assistant is temporarily unavailable." }, { status: 502 });
  }
}
