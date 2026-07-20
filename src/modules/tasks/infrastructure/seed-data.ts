import type { Label, Task } from "../domain/types";

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoNow(offsetHours = 0) {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString();
}

/**
 * First-run demo content, seeded into `LocalTaskRepository` once so the
 * board isn't empty on first visit. Seeded once per browser — editing or
 * deleting these is exactly how a real task would be edited or deleted.
 */
export function createSeedData(): { tasks: Task[]; labels: Label[] } {
  const labels: Label[] = [
    { id: "label-design", name: "Design", color: "#8b5cf6" },
    { id: "label-backend", name: "Backend", color: "#0ea5e9" },
    { id: "label-bug", name: "Bug", color: "#ef4444" },
    { id: "label-personal", name: "Personal", color: "#22c55e" },
  ];

  const now = isoNow();

  const tasks: Task[] = [
    {
      id: "seed-1",
      title: "Design the onboarding flow",
      description: "Sketch the first-run experience for new LifeOS users, from sign-up to their first task.",
      status: "in_progress",
      priority: "high",
      dueDate: isoDate(2),
      reminderAt: null,
      labelIds: ["label-design"],
      subtasks: [
        { id: "seed-1-1", title: "Wireframe welcome screen", done: true, position: 0 },
        { id: "seed-1-2", title: "Design empty states", done: true, position: 1 },
        { id: "seed-1-3", title: "Prototype in Figma", done: false, position: 2 },
      ],
      comments: [
        { id: "seed-1-c1", body: "Let's keep it to 3 steps max.", createdAt: isoNow(-30) },
      ],
      attachments: [],
      position: 0,
      createdAt: isoNow(-72),
      updatedAt: now,
      completedAt: null,
    },
    {
      id: "seed-2",
      title: "Fix Supabase RLS policy for shared workspaces",
      description: "",
      status: "todo",
      priority: "urgent",
      dueDate: isoDate(-1),
      reminderAt: isoNow(2),
      labelIds: ["label-backend", "label-bug"],
      subtasks: [],
      comments: [],
      attachments: [],
      position: 0,
      createdAt: isoNow(-20),
      updatedAt: isoNow(-20),
      completedAt: null,
    },
    {
      id: "seed-3",
      title: "Write API docs for the tasks endpoint",
      description: "Document request/response shapes and error codes.",
      status: "todo",
      priority: "medium",
      dueDate: isoDate(5),
      reminderAt: null,
      labelIds: ["label-backend"],
      subtasks: [
        { id: "seed-3-1", title: "Document CRUD endpoints", done: false, position: 0 },
        { id: "seed-3-2", title: "Add example payloads", done: false, position: 1 },
      ],
      comments: [],
      attachments: [],
      position: 1,
      createdAt: isoNow(-10),
      updatedAt: isoNow(-10),
      completedAt: null,
    },
    {
      id: "seed-4",
      title: "Review pull request #482",
      description: "",
      status: "in_review",
      priority: "high",
      dueDate: isoDate(0),
      reminderAt: null,
      labelIds: [],
      subtasks: [],
      comments: [
        { id: "seed-4-c1", body: "Left a couple of comments on the diff.", createdAt: isoNow(-4) },
      ],
      attachments: [],
      position: 0,
      createdAt: isoNow(-5),
      updatedAt: isoNow(-4),
      completedAt: null,
    },
    {
      id: "seed-5",
      title: "Book dentist appointment",
      description: "",
      status: "todo",
      priority: "low",
      dueDate: null,
      reminderAt: null,
      labelIds: ["label-personal"],
      subtasks: [],
      comments: [],
      attachments: [],
      position: 2,
      createdAt: isoNow(-96),
      updatedAt: isoNow(-96),
      completedAt: null,
    },
    {
      id: "seed-6",
      title: "Set up CI pipeline",
      description: "GitHub Actions: lint, typecheck, build on every PR.",
      status: "done",
      priority: "medium",
      dueDate: isoDate(-6),
      reminderAt: null,
      labelIds: ["label-backend"],
      subtasks: [
        { id: "seed-6-1", title: "Add lint job", done: true, position: 0 },
        { id: "seed-6-2", title: "Add build job", done: true, position: 1 },
      ],
      comments: [],
      attachments: [],
      position: 0,
      createdAt: isoNow(-240),
      updatedAt: isoNow(-150),
      completedAt: isoNow(-150),
    },
    {
      id: "seed-7",
      title: "Weekly grocery run",
      description: "",
      status: "done",
      priority: "low",
      dueDate: isoDate(-2),
      reminderAt: null,
      labelIds: ["label-personal"],
      subtasks: [],
      comments: [],
      attachments: [],
      position: 1,
      createdAt: isoNow(-60),
      updatedAt: isoNow(-48),
      completedAt: isoNow(-48),
    },
  ];

  return { tasks, labels };
}
