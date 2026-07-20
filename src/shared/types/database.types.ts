/**
 * Hand-written to match `supabase/migrations/*.sql` until a real Supabase
 * project is provisioned. Once it is, replace this file's contents with:
 *
 *   supabase gen types typescript --project-id <id> > src/shared/types/database.types.ts
 *
 * and delete this notice — the generated file is the source of truth from
 * that point on, not this one.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamptz = string;
type DateString = string;

/**
 * postgrest-js's generic table shape requires a `Relationships` array (used
 * to type nested `select()` embeds via foreign keys). We don't introspect
 * the real schema here, so it's always empty — nested selects in
 * `SupabaseTaskRepository` are cast manually instead of type-inferred.
 * Without this (and `Views`/`Functions` below), every `.from()` call
 * silently resolves to `never`.
 */
type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: "vi" | "en";
          theme: "light" | "dark" | "system";
          timezone: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        Partial<{
          full_name: string | null;
          avatar_url: string | null;
          locale: "vi" | "en";
          theme: "light" | "dark" | "system";
          timezone: string;
        }> & { id: string },
        Partial<{
          full_name: string | null;
          avatar_url: string | null;
          locale: "vi" | "en";
          theme: "light" | "dark" | "system";
          timezone: string;
        }>
      >;
      tasks: TableDef<
        {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "in_review" | "done";
          priority: "low" | "medium" | "high" | "urgent";
          due_date: DateString | null;
          reminder_at: Timestamptz | null;
          position: number;
          completed_at: Timestamptz | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
          deleted_at: Timestamptz | null;
        },
        Partial<{
          description: string | null;
          status: "todo" | "in_progress" | "in_review" | "done";
          priority: "low" | "medium" | "high" | "urgent";
          due_date: DateString | null;
          reminder_at: Timestamptz | null;
          position: number;
          completed_at: Timestamptz | null;
          deleted_at: Timestamptz | null;
        }> & { user_id: string; title: string },
        Partial<{
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "in_review" | "done";
          priority: "low" | "medium" | "high" | "urgent";
          due_date: DateString | null;
          reminder_at: Timestamptz | null;
          position: number;
          completed_at: Timestamptz | null;
          deleted_at: Timestamptz | null;
        }>
      >;
      labels: TableDef<
        { id: string; user_id: string; name: string; color: string; created_at: Timestamptz },
        { user_id: string; name: string; color?: string },
        Partial<{ name: string; color: string }>
      >;
      task_labels: TableDef<
        { task_id: string; label_id: string; user_id: string },
        { task_id: string; label_id: string; user_id: string },
        Partial<{ task_id: string; label_id: string; user_id: string }>
      >;
      subtasks: TableDef<
        {
          id: string;
          task_id: string;
          user_id: string;
          title: string;
          done: boolean;
          position: number;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        { task_id: string; user_id: string; title: string; done?: boolean; position?: number },
        Partial<{ title: string; done: boolean; position: number }>
      >;
      task_comments: TableDef<
        { id: string; task_id: string; user_id: string; body: string; created_at: Timestamptz },
        { task_id: string; user_id: string; body: string },
        Partial<{ body: string }>
      >;
      task_attachments: TableDef<
        {
          id: string;
          task_id: string;
          user_id: string;
          file_name: string;
          content_type: string | null;
          size_bytes: number | null;
          storage_path: string;
          created_at: Timestamptz;
        },
        {
          task_id: string;
          user_id: string;
          file_name: string;
          content_type?: string | null;
          size_bytes?: number | null;
          storage_path: string;
        },
        Partial<{ file_name: string; content_type: string | null; size_bytes: number | null }>
      >;
      habits: TableDef<
        {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: "daily" | "weekly" | "custom";
          target_count: number;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        Partial<{
          description: string | null;
          frequency: "daily" | "weekly" | "custom";
          target_count: number;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
        }> & { user_id: string; name: string },
        Partial<{
          name: string;
          description: string | null;
          frequency: "daily" | "weekly" | "custom";
          target_count: number;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
        }>
      >;
      habit_logs: TableDef<
        {
          id: string;
          habit_id: string;
          user_id: string;
          logged_date: DateString;
          count: number;
          note: string | null;
          created_at: Timestamptz;
        },
        { habit_id: string; user_id: string; logged_date: DateString; count?: number; note?: string | null },
        Partial<{ count: number; note: string | null }>
      >;
      goals: TableDef<
        {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          target_date: DateString | null;
          status: "active" | "completed" | "abandoned";
          progress: number;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        Partial<{
          description: string | null;
          category: string | null;
          target_date: DateString | null;
          status: "active" | "completed" | "abandoned";
          progress: number;
        }> & { user_id: string; title: string },
        Partial<{
          title: string;
          description: string | null;
          category: string | null;
          target_date: DateString | null;
          status: "active" | "completed" | "abandoned";
          progress: number;
        }>
      >;
      journal_entries: TableDef<
        {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          mood: string | null;
          entry_date: DateString;
          created_at: Timestamptz;
          updated_at: Timestamptz;
          deleted_at: Timestamptz | null;
        },
        Partial<{
          title: string | null;
          content: string;
          mood: string | null;
          entry_date: DateString;
          deleted_at: Timestamptz | null;
        }> & { user_id: string },
        Partial<{
          title: string | null;
          content: string;
          mood: string | null;
          entry_date: DateString;
          deleted_at: Timestamptz | null;
        }>
      >;
      categories: TableDef<
        {
          id: string;
          user_id: string;
          name: string;
          color: string;
          kind: "income" | "expense" | "saving" | "investment";
          created_at: Timestamptz;
        },
        { user_id: string; name: string; color?: string; kind: "income" | "expense" | "saving" | "investment" },
        Partial<{ name: string; color: string }>
      >;
      transactions: TableDef<
        {
          id: string;
          user_id: string;
          type: "income" | "expense" | "saving" | "investment";
          amount: number;
          currency: string;
          category_id: string | null;
          note: string | null;
          occurred_at: Timestamptz;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        Partial<{ currency: string; category_id: string | null; note: string | null; occurred_at: Timestamptz }> & {
          user_id: string;
          type: "income" | "expense" | "saving" | "investment";
          amount: number;
        },
        Partial<{
          type: "income" | "expense" | "saving" | "investment";
          amount: number;
          currency: string;
          category_id: string | null;
          note: string | null;
          occurred_at: Timestamptz;
        }>
      >;
      budgets: TableDef<
        {
          id: string;
          user_id: string;
          category_id: string;
          monthly_limit: number;
          currency: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        },
        Partial<{ currency: string }> & { user_id: string; category_id: string; monthly_limit: number },
        Partial<{ category_id: string; monthly_limit: number; currency: string }>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
