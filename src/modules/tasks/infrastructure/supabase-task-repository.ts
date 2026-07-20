import { createClient } from "@/shared/lib/supabase/client";
import type { Database } from "@/shared/types/database.types";
import type {
  CreateTaskInput,
  NewAttachmentInput,
  TaskRepository,
  UpdateTaskInput,
} from "../domain/repository";
import type { Attachment, Comment, Label, Subtask, Task, TaskStatus } from "../domain/types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type SubtaskRow = Database["public"]["Tables"]["subtasks"]["Row"];
type CommentRow = Database["public"]["Tables"]["task_comments"]["Row"];
type AttachmentRow = Database["public"]["Tables"]["task_attachments"]["Row"];

const ATTACHMENTS_BUCKET = "task-attachments";

type TaskWithRelations = TaskRow & {
  subtasks: SubtaskRow[] | null;
  task_comments: CommentRow[] | null;
  task_attachments: AttachmentRow[] | null;
  task_labels: { label_id: string }[] | null;
};

/**
 * Production `TaskRepository` implementation against
 * `supabase/migrations/0003_tasks.sql` + `0008_tasks_extended.sql`. Not
 * currently instantiated anywhere — `application/task-store.ts` uses
 * `LocalTaskRepository` until auth exists (there's no `auth.uid()` for RLS
 * to scope rows to yet). Swapping it in later is a one-line change there,
 * not a rewrite of this file or of `presentation`.
 */
export class SupabaseTaskRepository implements TaskRepository {
  private supabase = createClient();

  private async currentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("SupabaseTaskRepository requires an authenticated user.");
    return user.id;
  }

  private async signAttachmentUrl(storagePath: string): Promise<string> {
    const { data } = await this.supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .createSignedUrl(storagePath, 60 * 60);
    return data?.signedUrl ?? "";
  }

  private async toTask(row: TaskWithRelations): Promise<Task> {
    const attachments = await Promise.all(
      (row.task_attachments ?? []).map(async (a): Promise<Attachment> => ({
        id: a.id,
        fileName: a.file_name,
        contentType: a.content_type,
        sizeBytes: a.size_bytes,
        url: await this.signAttachmentUrl(a.storage_path),
        createdAt: a.created_at,
      })),
    );

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      status: row.status as TaskStatus,
      priority: row.priority as Task["priority"],
      dueDate: row.due_date,
      reminderAt: row.reminder_at,
      labelIds: (row.task_labels ?? []).map((l) => l.label_id),
      subtasks: (row.subtasks ?? [])
        .sort((a, b) => a.position - b.position)
        .map((s): Subtask => ({ id: s.id, title: s.title, done: s.done, position: s.position })),
      comments: (row.task_comments ?? [])
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((c): Comment => ({ id: c.id, body: c.body, createdAt: c.created_at })),
      attachments,
      position: row.position,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    };
  }

  private readonly selectWithRelations =
    "*, subtasks(*), task_comments(*), task_attachments(*), task_labels(label_id)";

  async listTasks(): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select(this.selectWithRelations)
      .is("deleted_at", null)
      .order("position", { ascending: true });
    if (error) throw error;
    return Promise.all((data as unknown as TaskWithRelations[]).map((row) => this.toTask(row)));
  }

  async listLabels(): Promise<Label[]> {
    const { data, error } = await this.supabase.from("labels").select("*").order("name");
    if (error) throw error;
    return data.map((l) => ({ id: l.id, name: l.name, color: l.color }));
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const userId = await this.currentUserId();
    const status = input.status ?? "todo";

    const { count } = await this.supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", status);

    const { data, error } = await this.supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description ?? null,
        status,
        priority: input.priority ?? "medium",
        due_date: input.dueDate ?? null,
        reminder_at: input.reminderAt ?? null,
        position: count ?? 0,
      })
      .select(this.selectWithRelations)
      .single();
    if (error) throw error;
    const created = data as unknown as TaskWithRelations;

    if (input.labelIds?.length) {
      await this.setTaskLabels(created.id, input.labelIds);
    }

    return this.toTask(created);
  }

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const patch: Database["public"]["Tables"]["tasks"]["Update"] = {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      reminder_at: input.reminderAt,
    };
    if (input.status === "done") patch.completed_at = new Date().toISOString();
    else if (input.status) patch.completed_at = null;

    const { data, error } = await this.supabase
      .from("tasks")
      .update(patch)
      .eq("id", taskId)
      .select(this.selectWithRelations)
      .single();
    if (error) throw error;
    return this.toTask(data as unknown as TaskWithRelations);
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await this.supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  }

  async moveTask(taskId: string, status: TaskStatus, index: number): Promise<void> {
    const { data: column, error } = await this.supabase
      .from("tasks")
      .select("id")
      .eq("status", status)
      .neq("id", taskId)
      .order("position", { ascending: true });
    if (error) throw error;

    const ids = column.map((r) => r.id);
    ids.splice(index, 0, taskId);

    await this.supabase.from("tasks").update({ status }).eq("id", taskId);
    await this.reorderTasks(status, ids);
  }

  async reorderTasks(status: TaskStatus, orderedTaskIds: string[]): Promise<void> {
    await Promise.all(
      orderedTaskIds.map((id, index) =>
        this.supabase.from("tasks").update({ position: index }).eq("id", id).eq("status", status),
      ),
    );
  }

  async createLabel(input: { name: string; color: string }): Promise<Label> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("labels")
      .insert({ user_id: userId, name: input.name, color: input.color })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, name: data.name, color: data.color };
  }

  async setTaskLabels(taskId: string, labelIds: string[]): Promise<void> {
    const userId = await this.currentUserId();
    await this.supabase.from("task_labels").delete().eq("task_id", taskId);
    if (labelIds.length === 0) return;
    const { error } = await this.supabase
      .from("task_labels")
      .insert(labelIds.map((labelId) => ({ task_id: taskId, label_id: labelId, user_id: userId })));
    if (error) throw error;
  }

  async addSubtask(taskId: string, title: string): Promise<Subtask> {
    const userId = await this.currentUserId();
    const { count } = await this.supabase
      .from("subtasks")
      .select("id", { count: "exact", head: true })
      .eq("task_id", taskId);

    const { data, error } = await this.supabase
      .from("subtasks")
      .insert({ task_id: taskId, user_id: userId, title, position: count ?? 0 })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, title: data.title, done: data.done, position: data.position };
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    input: { title?: string; done?: boolean },
  ): Promise<Subtask> {
    const { data, error } = await this.supabase
      .from("subtasks")
      .update(input)
      .eq("id", subtaskId)
      .eq("task_id", taskId)
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, title: data.title, done: data.done, position: data.position };
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const { error } = await this.supabase
      .from("subtasks")
      .delete()
      .eq("id", subtaskId)
      .eq("task_id", taskId);
    if (error) throw error;
  }

  async reorderSubtasks(taskId: string, orderedSubtaskIds: string[]): Promise<void> {
    await Promise.all(
      orderedSubtaskIds.map((id, index) =>
        this.supabase.from("subtasks").update({ position: index }).eq("id", id).eq("task_id", taskId),
      ),
    );
  }

  async addComment(taskId: string, body: string): Promise<Comment> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("task_comments")
      .insert({ task_id: taskId, user_id: userId, body })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, body: data.body, createdAt: data.created_at };
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    const { error } = await this.supabase
      .from("task_comments")
      .delete()
      .eq("id", commentId)
      .eq("task_id", taskId);
    if (error) throw error;
  }

  async addAttachment(taskId: string, input: NewAttachmentInput): Promise<Attachment> {
    const userId = await this.currentUserId();
    const storagePath = `${userId}/${taskId}/${Date.now()}-${input.fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(storagePath, input.file, { contentType: input.contentType ?? undefined });
    if (uploadError) throw uploadError;

    const { data, error } = await this.supabase
      .from("task_attachments")
      .insert({
        task_id: taskId,
        user_id: userId,
        file_name: input.fileName,
        content_type: input.contentType,
        size_bytes: input.sizeBytes,
        storage_path: storagePath,
      })
      .select()
      .single();
    if (error) throw error;

    return {
      id: data.id,
      fileName: data.file_name,
      contentType: data.content_type,
      sizeBytes: data.size_bytes,
      url: await this.signAttachmentUrl(data.storage_path),
      createdAt: data.created_at,
    };
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    const { data } = await this.supabase
      .from("task_attachments")
      .select("storage_path")
      .eq("id", attachmentId)
      .eq("task_id", taskId)
      .single();

    if (data) {
      await this.supabase.storage.from(ATTACHMENTS_BUCKET).remove([data.storage_path]);
    }
    const { error } = await this.supabase
      .from("task_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("task_id", taskId);
    if (error) throw error;
  }
}
