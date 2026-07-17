"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Tag } from "lucide-react";
import { Task } from "@/state/api";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const TaskCard = ({ task }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(task.id),
      data: { task },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const priorityKey = task.priority?.toLowerCase() ?? "";
  const priorityClass =
    priorityStyles[priorityKey] ??
    "bg-gray-100 text-gray-600 dark:bg-dark-tertiary dark:text-gray-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary",
        isDragging && "opacity-50 shadow-lg ring-2 ring-blue-400"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug text-gray-800 dark:text-gray-100">
          {task.title}
        </h4>
        <button
          type="button"
          className="cursor-grab rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
          aria-label="Drag task"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      )}

      {task.tags && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-dark-tertiary dark:text-gray-400"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {task.priority && (
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              priorityClass
            )}
          >
            {task.priority}
          </span>
        )}

        {task.dueDate && (
          <div className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
