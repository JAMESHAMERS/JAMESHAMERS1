import { create } from "zustand";

import type { CreateTaskInput, TaskRepository, UpdateTaskInput } from "../domain/repository";
import type { Label, Task, TaskFilters, TaskStatus } from "../domain/types";
import { EMPTY_FILTERS } from "../domain/types";
import { LocalTaskRepository } from "../infrastructure/local-task-repository";

export type TaskView = "kanban" | "list" | "calendar";

function patchTask(tasks: Task[], taskId: string, updater: (task: Task) => Task): Task[] {
  return tasks.map((t) => (t.id === taskId ? updater(t) : t));
}

interface TaskStoreState {
  repo: TaskRepository | null;
  tasks: Task[];
  labels: Label[];
  filters: TaskFilters;
  view: TaskView;
  hydrated: boolean;
  selectedTaskId: string | null;

  hydrate: () => Promise<void>;
  setView: (view: TaskView) => void;
  setFilters: (patch: Partial<TaskFilters>) => void;
  selectTask: (taskId: string | null) => void;

  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus, index: number) => Promise<void>;
  reorderTasks: (status: TaskStatus, orderedIds: string[]) => Promise<void>;

  createLabel: (input: { name: string; color: string }) => Promise<Label>;
  setTaskLabels: (taskId: string, labelIds: string[]) => Promise<void>;

  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  renameSubtask: (taskId: string, subtaskId: string, title: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  addComment: (taskId: string, body: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  addAttachment: (taskId: string, file: File) => Promise<void>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

/**
 * The "application" layer for a client-heavy, drag-and-drop-driven module:
 * each action is a thin call into the injected `TaskRepository`, followed
 * by a local state patch mirroring what the repository just persisted.
 * `presentation` only ever calls these actions — it never imports a
 * repository implementation directly. See src/modules/tasks/README.md.
 */
export const useTaskStore = create<TaskStoreState>((set, get) => ({
  repo: null,
  tasks: [],
  labels: [],
  filters: EMPTY_FILTERS,
  view: "kanban",
  hydrated: false,
  selectedTaskId: null,

  hydrate: async () => {
    if (get().hydrated) return;
    // Constructed here, not at module scope: LocalTaskRepository touches
    // `localStorage` in its constructor, so this must only run client-side
    // after mount (see TaskProvider), never during SSR.
    const repo = new LocalTaskRepository();
    const [tasks, labels] = await Promise.all([repo.listTasks(), repo.listLabels()]);
    set({ repo, tasks, labels, hydrated: true });
  },

  setView: (view) => set({ view }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  createTask: async (input) => {
    const task = await get().repo!.createTask(input);
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (taskId, input) => {
    const updated = await get().repo!.updateTask(taskId, input);
    set((s) => ({ tasks: patchTask(s.tasks, taskId, () => updated) }));
  },

  deleteTask: async (taskId) => {
    await get().repo!.deleteTask(taskId);
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== taskId),
      selectedTaskId: s.selectedTaskId === taskId ? null : s.selectedTaskId,
    }));
  },

  moveTask: async (taskId, status, index) => {
    await get().repo!.moveTask(taskId, status, index);
    set((s) => {
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      const fromStatus = task.status;
      const moved = { ...task, status };

      const toColumn = s.tasks.filter((t) => t.status === status && t.id !== taskId);
      toColumn.splice(index, 0, moved);
      toColumn.forEach((t, i) => {
        t.position = i;
      });

      let rest = s.tasks.filter((t) => t.status !== status && t.id !== taskId);
      if (fromStatus !== status) {
        const fromColumn = rest
          .filter((t) => t.status === fromStatus)
          .sort((a, b) => a.position - b.position);
        fromColumn.forEach((t, i) => {
          t.position = i;
        });
        rest = rest.map((t) => fromColumn.find((f) => f.id === t.id) ?? t);
      }

      return { tasks: [...rest, ...toColumn] };
    });
  },

  reorderTasks: async (status, orderedIds) => {
    await get().repo!.reorderTasks(status, orderedIds);
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.status !== status) return t;
        const index = orderedIds.indexOf(t.id);
        return index === -1 ? t : { ...t, position: index };
      }),
    }));
  },

  createLabel: async (input) => {
    const label = await get().repo!.createLabel(input);
    set((s) => ({ labels: [...s.labels, label] }));
    return label;
  },

  setTaskLabels: async (taskId, labelIds) => {
    await get().repo!.setTaskLabels(taskId, labelIds);
    set((s) => ({ tasks: patchTask(s.tasks, taskId, (t) => ({ ...t, labelIds })) }));
  },

  addSubtask: async (taskId, title) => {
    const subtask = await get().repo!.addSubtask(taskId, title);
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({ ...t, subtasks: [...t.subtasks, subtask] })),
    }));
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const subtask = task?.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;
    const updated = await get().repo!.updateSubtask(taskId, subtaskId, { done: !subtask.done });
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        subtasks: t.subtasks.map((sub) => (sub.id === subtaskId ? updated : sub)),
      })),
    }));
  },

  renameSubtask: async (taskId, subtaskId, title) => {
    const updated = await get().repo!.updateSubtask(taskId, subtaskId, { title });
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        subtasks: t.subtasks.map((sub) => (sub.id === subtaskId ? updated : sub)),
      })),
    }));
  },

  deleteSubtask: async (taskId, subtaskId) => {
    await get().repo!.deleteSubtask(taskId, subtaskId);
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        subtasks: t.subtasks.filter((sub) => sub.id !== subtaskId),
      })),
    }));
  },

  addComment: async (taskId, body) => {
    const comment = await get().repo!.addComment(taskId, body);
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({ ...t, comments: [...t.comments, comment] })),
    }));
  },

  deleteComment: async (taskId, commentId) => {
    await get().repo!.deleteComment(taskId, commentId);
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        comments: t.comments.filter((c) => c.id !== commentId),
      })),
    }));
  },

  addAttachment: async (taskId, file) => {
    const attachment = await get().repo!.addAttachment(taskId, {
      fileName: file.name,
      contentType: file.type || null,
      sizeBytes: file.size,
      file,
    });
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        attachments: [...t.attachments, attachment],
      })),
    }));
  },

  deleteAttachment: async (taskId, attachmentId) => {
    await get().repo!.deleteAttachment(taskId, attachmentId);
    set((s) => ({
      tasks: patchTask(s.tasks, taskId, (t) => ({
        ...t,
        attachments: t.attachments.filter((a) => a.id !== attachmentId),
      })),
    }));
  },
}));
