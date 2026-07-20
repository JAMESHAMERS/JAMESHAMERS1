import type { AssistantTool } from "./types";

const EMPTY_INPUT_SCHEMA = { type: "object" as const, properties: {} };

/**
 * The Assistant's full tool registry, in MCP-compatible shape: each entry
 * is exactly `{ name, description, inputSchema }` — a JSON Schema input,
 * no framework types. This same array is:
 *  - executed directly by `infrastructure/tool-executor.ts` for the local
 *    deterministic engine (no API key needed);
 *  - converted to the Anthropic API's `tools` param (input_schema, same
 *    shape) by `infrastructure/anthropic-tools.ts` for the real-API path.
 *
 * All six tools are read-only and take no input — every question this
 * module answers is scoped to "today" / "this month" / "right now", so
 * there is nothing for the model to parameterize yet. Params can be added
 * per-tool later (e.g. a date range) without changing this shape.
 */
export const ASSISTANT_TOOLS: AssistantTool[] = [
  {
    name: "get_tasks_today",
    description:
      "Get the user's tasks that are due today or overdue, plus a count of what's in progress. Use this to answer questions like 'what should I do today' or 'what's on my plate'.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
  {
    name: "get_finance_month_summary",
    description:
      "Get the user's total income, expenses, and top spending categories for the current calendar month. Use this to answer questions about spending, budget, or money.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
  {
    name: "get_goals_status",
    description:
      "Get the status of the user's goals, including which are behind schedule. Use this to answer questions about goals.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
  {
    name: "get_journal_mood",
    description:
      "Get the user's recent journaling streak and average mood over the last two weeks. Use this to answer questions about mood, feelings, or journaling.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
  {
    name: "get_meals_today",
    description:
      "Get the user's calories and water logged so far today against their daily goals. Use this to answer questions about food, calories, or hydration.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
  {
    name: "get_travel_upcoming",
    description:
      "Get the user's ongoing and next upcoming trip, if any. Use this to answer questions about travel or trips.",
    inputSchema: EMPTY_INPUT_SCHEMA,
  },
];
