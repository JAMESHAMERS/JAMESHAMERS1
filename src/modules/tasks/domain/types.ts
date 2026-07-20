export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string | null;
  sizeBytes: number | null;
  /** Resolved, directly usable URL — an object URL locally, a signed Storage URL in production. */
  url: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO date (YYYY-MM-DD), no time component. */
  dueDate: string | null;
  /** ISO datetime — when to surface a reminder for this task. */
  reminderAt: string | null;
  labelIds: string[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  /** Manual sort order within its status column/list. */
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskFilters {
  search: string;
  labelIds: string[];
  priorities: TaskPriority[];
}

export const EMPTY_FILTERS: TaskFilters = {
  search: "",
  labelIds: [],
  priorities: [],
};
