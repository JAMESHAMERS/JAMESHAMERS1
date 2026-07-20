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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: "vi" | "en";
          theme: "light" | "dark" | "system";
          timezone: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["profiles"]["Row"], "id">> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "todo" | "in_progress" | "done" | "archived";
          priority: "low" | "medium" | "high";
          due_date: DateString | null;
          completed_at: Timestamptz | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
          deleted_at: Timestamptz | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
      };
      habits: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["habits"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Row"]>;
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          logged_date: DateString;
          count: number;
          note: string | null;
          created_at: Timestamptz;
        };
        Insert: Partial<Database["public"]["Tables"]["habit_logs"]["Row"]> & {
          habit_id: string;
          user_id: string;
          logged_date: DateString;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Row"]>;
      };
      goals: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["goals"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          mood: string | null;
          entry_date: DateString;
          created_at: Timestamptz;
          updated_at: Timestamptz;
          deleted_at: Timestamptz | null;
        };
        Insert: Partial<Database["public"]["Tables"]["journal_entries"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          currency: string;
          category: string | null;
          note: string | null;
          occurred_at: Timestamptz;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]> & {
          user_id: string;
          type: "income" | "expense";
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          monthly_limit: number;
          currency: string;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: Partial<Database["public"]["Tables"]["budgets"]["Row"]> & {
          user_id: string;
          category: string;
          monthly_limit: number;
        };
        Update: Partial<Database["public"]["Tables"]["budgets"]["Row"]>;
      };
    };
  };
}
