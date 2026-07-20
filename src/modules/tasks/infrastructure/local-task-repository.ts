import type {
  CreateTaskInput,
  NewAttachmentInput,
  TaskRepository,
  UpdateTaskInput,
} from "../domain/repository";
import type { Attachment, Comment, Label, Subtask, Task, TaskStatus } from "../domain/types";
import { nextPosition } from "../domain/rules";
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "lifeos:tasks:v1";

interface StoredData {
  tasks: Task[];
  labels: Label[];
}

function loadFromStorage(): StoredData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredData) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: StoredData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable (private browsing) — state still works
    // for the rest of the session, it just won't survive a reload.
  }
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function findTask(data: StoredData, taskId: string): Task {
  const task = data.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);
  return task;
}

/**
 * Browser `localStorage`-backed `TaskRepository`. This is the active
 * implementation until auth exists (see docs/ROADMAP.md and
 * src/modules/tasks/README.md) — every method still returns a Promise so
 * swapping in `SupabaseTaskRepository` later doesn't change any call site.
 *
 * Must only be constructed client-side (it touches `localStorage` in its
 * constructor); `application/task-store.ts` only does so from a
 * post-mount effect, never at module scope, so it never runs during SSR.
 */
export class LocalTaskRepository implements TaskRepository {
  private data: StoredData;

  constructor() {
    this.data = loadFromStorage() ?? createSeedData();
    this.persist();
  }

  private persist() {
    saveToStorage(this.data);
  }

  async listTasks(): Promise<Task[]> {
    return structuredClone(this.data.tasks);
  }

  async listLabels(): Promise<Label[]> {
    return structuredClone(this.data.labels);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const status = input.status ?? "todo";
    const task: Task = {
      id: uid(),
      title: input.title,
      description: input.description ?? "",
      status,
      priority: input.priority ?? "medium",
      dueDate: input.dueDate ?? null,
      reminderAt: input.reminderAt ?? null,
      labelIds: input.labelIds ?? [],
      subtasks: [],
      comments: [],
      attachments: [],
      position: nextPosition(this.data.tasks, status),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    this.data.tasks.push(task);
    this.persist();
    return structuredClone(task);
  }

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const task = findTask(this.data, taskId);
    Object.assign(task, input);
    if (input.status === "done" && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    } else if (input.status && input.status !== "done") {
      task.completedAt = null;
    }
    task.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.persist();
  }

  async moveTask(taskId: string, status: TaskStatus, index: number): Promise<void> {
    const task = findTask(this.data, taskId);
    const fromStatus = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();

    const column = sortColumn(this.data.tasks, status, taskId);
    const withoutTask = column.filter((t) => t.id !== taskId);
    withoutTask.splice(index, 0, task);
    withoutTask.forEach((t, i) => {
      t.position = i;
    });

    if (fromStatus !== status) {
      resequence(this.data.tasks, fromStatus);
    }
    this.persist();
  }

  async reorderTasks(status: TaskStatus, orderedTaskIds: string[]): Promise<void> {
    orderedTaskIds.forEach((id, index) => {
      const task = this.data.tasks.find((t) => t.id === id && t.status === status);
      if (task) task.position = index;
    });
    this.persist();
  }

  async createLabel(input: { name: string; color: string }): Promise<Label> {
    const label: Label = { id: uid(), name: input.name, color: input.color };
    this.data.labels.push(label);
    this.persist();
    return structuredClone(label);
  }

  async setTaskLabels(taskId: string, labelIds: string[]): Promise<void> {
    const task = findTask(this.data, taskId);
    task.labelIds = labelIds;
    task.updatedAt = new Date().toISOString();
    this.persist();
  }

  async addSubtask(taskId: string, title: string): Promise<Subtask> {
    const task = findTask(this.data, taskId);
    const subtask: Subtask = { id: uid(), title, done: false, position: task.subtasks.length };
    task.subtasks.push(subtask);
    task.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(subtask);
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    input: { title?: string; done?: boolean },
  ): Promise<Subtask> {
    const task = findTask(this.data, taskId);
    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) throw new Error(`Subtask not found: ${subtaskId}`);
    Object.assign(subtask, input);
    task.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(subtask);
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const task = findTask(this.data, taskId);
    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    task.updatedAt = new Date().toISOString();
    this.persist();
  }

  async reorderSubtasks(taskId: string, orderedSubtaskIds: string[]): Promise<void> {
    const task = findTask(this.data, taskId);
    orderedSubtaskIds.forEach((id, index) => {
      const subtask = task.subtasks.find((s) => s.id === id);
      if (subtask) subtask.position = index;
    });
    task.subtasks.sort((a, b) => a.position - b.position);
    this.persist();
  }

  async addComment(taskId: string, body: string): Promise<Comment> {
    const task = findTask(this.data, taskId);
    const comment: Comment = { id: uid(), body, createdAt: new Date().toISOString() };
    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(comment);
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    const task = findTask(this.data, taskId);
    task.comments = task.comments.filter((c) => c.id !== commentId);
    this.persist();
  }

  async addAttachment(taskId: string, input: NewAttachmentInput): Promise<Attachment> {
    const task = findTask(this.data, taskId);
    const attachment: Attachment = {
      id: uid(),
      fileName: input.fileName,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      // Object URLs only live for this browsing session — real durable
      // storage is SupabaseTaskRepository's job (see its addAttachment).
      url: URL.createObjectURL(input.file),
      createdAt: new Date().toISOString(),
    };
    task.attachments.push(attachment);
    task.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(attachment);
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    const task = findTask(this.data, taskId);
    task.attachments = task.attachments.filter((a) => a.id !== attachmentId);
    this.persist();
  }
}

function sortColumn(tasks: Task[], status: TaskStatus, excludeId?: string) {
  return tasks
    .filter((t) => t.status === status && t.id !== excludeId)
    .sort((a, b) => a.position - b.position);
}

function resequence(tasks: Task[], status: TaskStatus) {
  sortColumn(tasks, status).forEach((t, i) => {
    t.position = i;
  });
}
