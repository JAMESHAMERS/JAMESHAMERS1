import type Anthropic from "@anthropic-ai/sdk";

import { ASSISTANT_TOOLS } from "../domain/tools";

/**
 * Converts the MCP-compatible registry in `domain/tools.ts` into the
 * Anthropic Messages API's `tools` param shape — same `name`/`description`
 * fields, `inputSchema` renamed to `input_schema`. Used only by the
 * server-side Route Handler (`src/app/api/assistant/route.ts`); never
 * imported client-side.
 */
export function toAnthropicTools(): Anthropic.Tool[] {
  return ASSISTANT_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  }));
}
