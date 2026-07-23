"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/state/api";
import { TaskStatus } from "@/lib/taskStatus";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

type Props = {
  id: TaskStatus;
  label: string;
  accent: string;
  badge: string;
  tasks: Task[];
  onAddTaskClick?: () => void;
};

const BoardColumn = ({ id, label, accent, badge, tasks, onAddTaskClick }: Props) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex min-h-[520px] w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50/80 dark:border-stroke-dark dark:bg-dark-secondary/50",
        accent,
        "border-t-4"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {label}
          </h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              badge
            )}
          >
            {tasks.length}
          </span>
        </div>
        {id === "Todo" && onAddTaskClick && (
          <button
            onClick={onAddTaskClick}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-dark-tertiary dark:hover:text-gray-200 transition-colors"
            title="Add Task to To Do Column"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 transition-colors",
          isOver && "rounded-b-xl bg-blue-50/60 dark:bg-blue-900/10"
        )}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-stroke-dark">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Drop tasks here
            </p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
};

export default BoardColumn;
