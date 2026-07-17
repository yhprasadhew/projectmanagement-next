"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import {
  Task,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "@/state/api";
import {
  TASK_COLUMNS,
  TaskStatus,
  normalizeStatus,
} from "@/lib/taskStatus";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";

type Props = {
  projectId: number;
};

const BoardView = ({ projectId }: Props) => {
  const { data: tasks, isLoading, isError } = useGetTasksQuery({ projectId });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      Todo: [],
      "Working Progress": [],
      "Under Review": [],
      Completed: [],
    };

    tasks?.forEach((task) => {
      const status = normalizeStatus(task.status);
      grouped[status].push(task);
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find((item) => String(item.id) === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over || !tasks) return;

    const taskId = Number(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((item) => item.id === taskId);

    if (!task || normalizeStatus(task.status) === newStatus) return;

    try {
      await updateTaskStatus({ taskId, status: newStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Failed to load tasks. Please check that the API server is running.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {TASK_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              label={column.label}
              accent={column.accent}
              badge={column.badge}
              tasks={tasksByStatus[column.id]}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rotate-2 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default BoardView;
