import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/shared/types/database.types";

/**
 * Browser-side Supabase client. Use inside Client Components. Do not use
 * this for privileged operations — it carries the anon key and is subject
 * to Row Level Security.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
