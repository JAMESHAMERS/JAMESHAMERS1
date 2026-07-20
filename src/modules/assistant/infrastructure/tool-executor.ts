import type { AssistantContextSnapshot } from "../domain/rules";
import type { AssistantToolName, ToolResult } from "../domain/types";

/**
 * Executes one named tool against an already-built context snapshot.
 * Real tool "execution" (the sibling-module reads) already happened in
 * `buildContextSnapshot` — this just looks up that tool's slice, which is
 * what both the local engine and the client-side leg of the real-API
 * tool-use loop (see `application/assistant-store.ts`) call when Claude
 * requests a `tool_use`.
 */
export function executeTool(name: AssistantToolName, snapshot: AssistantContextSnapshot): ToolResult {
  return { name, data: snapshot[name] };
}
