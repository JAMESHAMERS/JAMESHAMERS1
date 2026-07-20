export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  /** Tool names the assistant drew on to answer, surfaced as small citations under the bubble. */
  toolsUsed?: AssistantToolName[];
}

export type AssistantToolName =
  | "get_tasks_today"
  | "get_finance_month_summary"
  | "get_goals_status"
  | "get_journal_mood"
  | "get_meals_today"
  | "get_travel_upcoming";

/** JSON Schema for a tool's input — the same shape both MCP and the Anthropic API expect. */
export interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

/**
 * A tool definition in MCP-compatible shape (name + description + JSON
 * Schema input) — see `domain/tools.ts` for the registry and
 * `src/modules/assistant/README.md` for why this shape, not a live MCP
 * transport, is what "MCP-compatible" means today.
 */
export interface AssistantTool {
  name: AssistantToolName;
  description: string;
  inputSchema: JsonSchema;
}

export interface ToolResult {
  name: AssistantToolName;
  data: unknown;
}
