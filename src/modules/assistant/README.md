# assistant module

Like `modules/analytics`, this owns no data of its own — there's no
`0014_assistant.sql` migration, nothing here to persist. It follows the
same `domain/application/infrastructure/presentation` shape, but each
layer means something slightly different, and this is also the first
module to talk to an external API and the first to need a server-side
Route Handler (`src/app/api/assistant/route.ts`).

- `domain/tools.ts` — a six-tool registry (`get_tasks_today`,
  `get_finance_month_summary`, `get_goals_status`, `get_journal_mood`,
  `get_meals_today`, `get_travel_upcoming`), each a plain
  `{ name, description, inputSchema }` object. That shape is
  MCP-compatible on purpose (see "Why MCP-compatible, not a live MCP
  server" below).
- `domain/rules.ts` — per-tool summarizers, reusing sibling modules' own
  pure `domain/rules.ts` functions the same way Analytics does
  (`isOverdue` from Tasks, `categoryBreakdown` from Finance,
  `journalingStreak`/`averageMoodScore` from Journal, `summarizeDay` from
  Meals, `tripStatus` from Travel), plus the two genuinely new pieces:
  `matchIntent()` (a bilingual en/vi keyword matcher) and `localAnswer()`
  (a deterministic, template-based answer engine — the no-API-key path).
- `infrastructure/read-sources.ts` — constructs each sibling module's own
  `Local<X>Repository` and reads a snapshot, mirroring
  `analytics/infrastructure/read-sources.ts` exactly (see
  `docs/ARCHITECTURE.md`'s "Cross-module reads" for why both modules do
  this instead of extracting a shared layer). `tool-executor.ts` looks up
  one tool's slice of that snapshot. `anthropic-tools.ts` converts the
  registry to the Anthropic SDK's `Tool[]` shape — server-only, never
  imported client-side.
- `application/assistant-store.ts` — chat history, `hydrate()` (loads the
  snapshot + checks whether the server has an API key), and
  `sendMessage()`.
- `presentation/assistant-view.tsx` — the chat UI: message bubbles with
  tool-citation chips, suggested prompts for the three example questions
  from the original request plus a mood question, and a badge showing
  whether the last answer came from Claude or the local engine.

## Why the tool-use loop runs client-side

Every tool reads `Local<X>Repository` data, and every one of those
repositories reads `localStorage` in its constructor — see
`src/modules/tasks/infrastructure/local-task-repository.ts` and its
siblings. A server Route Handler has no access to a browser's
`localStorage`, so tool *execution* can never happen inside
`src/app/api/assistant/route.ts`. That route stays deliberately thin: it
proxies one `client.messages.create` call (model `claude-opus-4-8`,
`thinking: {type: "adaptive"}`, the tool registry attached) and returns
whatever Claude said, including any `tool_use` blocks.

The actual multi-turn loop lives in `application/assistant-store.ts`,
in `runApiToolLoop()`:

1. Post the growing message history to `/api/assistant`.
2. If the response's `stop_reason` is `"tool_use"`, execute the
   requested tool(s) locally (`tool-executor.ts`, against the
   already-hydrated snapshot), append `tool_result` blocks, and post
   again — capped at 4 iterations.
3. Otherwise, extract the text and show it.

This is unusual for a "tool use" implementation — normally the whole
loop lives server-side — but it's what this app's local-first data
model requires today. Once Supabase reads replace `localStorage`
(`docs/ROADMAP.md` Phase 1), the loop can move entirely into the route
handler unchanged in shape, just relocated.

## Always answers, key or no key

`GET /api/assistant` reports whether `ANTHROPIC_API_KEY` is set
server-side (never sent to the client). This repository has no
Anthropic credential configured, so `apiAvailable` is `false` here and
`sendMessage()` always uses `localAnswer()` — matching every other
module's "Local repo active, Supabase repo written but not wired"
pattern: the real integration is fully implemented, just inert without
a secret. The same `localAnswer()` fallback also fires if the real API
call throws mid-conversation (network failure, rate limit, etc.), so a
configured deployment degrades gracefully instead of showing an error.

## Why MCP-compatible, not a live MCP server

The original request asked for "MCP-compatible architecture for future
AI integrations." Read narrowly, that's a request to *shape* the tool
contract so a real MCP integration is a natural next step, not a
request to stand up a live MCP server transport today — there is no
external MCP client anywhere in this codebase that would connect to
one. `domain/tools.ts`'s `{ name, description, inputSchema }` shape
already is MCP's tool-definition shape (JSON Schema input, same as
what `@modelcontextprotocol/sdk`'s `server.tool()` expects); adding a
live transport (e.g. mounting `@modelcontextprotocol/sdk` at
`/api/mcp`) is a follow-up with no design changes required to this
registry, tracked in `docs/ROADMAP.md`. Building that transport now,
with nothing to talk to it, would be exactly the kind of speculative
infrastructure this codebase avoids elsewhere (see `AGENTS.md`/system
principles on not designing for hypothetical requirements).

## Why "which goals are behind schedule" gets an honest answer

`get_goals_status` always returns `{ trackingAvailable: false }` — the
Goals module has no data model yet (`docs/ROADMAP.md` Phase 4). Both
`localAnswer()` and the real API path (via the system prompt) are told
to say so plainly rather than invent goal data, the same choice
Analytics made by rendering an `EmptyState` instead of a fabricated
Goals chart.
