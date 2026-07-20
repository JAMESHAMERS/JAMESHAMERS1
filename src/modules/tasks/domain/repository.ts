import type { Attachment, Comment, Label, Subtask, Task, TaskPriority, TaskStatus } from "./types";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  reminderAt?: string | null;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  reminderAt?: string | null;
}

export interface NewAttachmentInput {
  fileName: string;
  contentType: string | null;
  sizeBytes: number | null;
  /** A `File`/`Blob` in the browser; the repository decides how (or whether) to persist it. */
  file: File;
}

/**
 * Storage-agnostic contract for everything the Tasks module needs to
 * persist. `LocalTaskRepository` (active today, browser-only) and
 * `SupabaseTaskRepository` (production adapter, wired in once auth exists —
 * see docs/ROADMAP.md) both implement this exactly, so `application` and
 * `presentation` never know which one is behind it.
 */
export interface TaskRepository {
  listTasks(): Promise<Task[]>;
  listLabels(): Promise<Label[]>;

  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(taskId: string, input: UpdateTaskInput): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  /** Move a task to `status` at `index` within that column, resequencing positions. */
  moveTask(taskId: string, status: TaskStatus, index: number): Promise<void>;
  /** Persist a same-column reorder. */
  reorderTasks(status: TaskStatus, orderedTaskIds: string[]): Promise<void>;

  createLabel(input: { name: string; color: string }): Promise<Label>;
  setTaskLabels(taskId: string, labelIds: string[]): Promise<void>;

  addSubtask(taskId: string, title: string): Promise<Subtask>;
  updateSubtask(
    taskId: string,
    subtaskId: string,
    input: { title?: string; done?: boolean },
  ): Promise<Subtask>;
  deleteSubtask(taskId: string, subtaskId: string): Promise<void>;
  reorderSubtasks(taskId: string, orderedSubtaskIds: string[]): Promise<void>;

  addComment(taskId: string, body: string): Promise<Comment>;
  deleteComment(taskId: string, commentId: string): Promise<void>;

  addAttachment(taskId: string, input: NewAttachmentInput): Promise<Attachment>;
  deleteAttachment(taskId: string, attachmentId: string): Promise<void>;
}
