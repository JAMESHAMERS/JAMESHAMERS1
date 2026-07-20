"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { TASK_STATUSES, type TaskStatus } from "../../domain/types";
import { filterTasks, groupByStatus } from "../../domain/rules";
import { useTaskStore } from "../../application/task-store";
import { TaskColumn } from "../components/task-column";
import { TaskCard } from "../components/task-card";

export function KanbanView({ onAddTask }: { onAddTask: (status: TaskStatus) => void }) {
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const moveTask = useTaskStore((s) => s.moveTask);
  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = groupByStatus(filterTasks(tasks, filters));
  const activeTask = activeId ? (tasks.find((t) => t.id === activeId) ?? null) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const task = tasks.find((t) => t.id === activeTaskId);
    if (!task) return;

    const overId = String(over.id);
    let targetStatus: TaskStatus;
    let targetIndex: number;

    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "") as TaskStatus;
      targetIndex = grouped[targetStatus].length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.status;
      targetIndex = grouped[targetStatus].findIndex((t) => t.id === overId);
    }

    const currentIndex = grouped[task.status].findIndex((t) => t.id === task.id);
    if (targetStatus === task.status && targetIndex === currentIndex) return;

    void moveTask(activeTaskId, targetStatus, targetIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <TaskColumn key={status} status={status} tasks={grouped[status]} onAddTask={onAddTask} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rotate-2">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
