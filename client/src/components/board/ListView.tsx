"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Loader2, Plus, Calendar, Tag, User } from "lucide-react";
import {
  Task,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "@/state/api";
import { TASK_COLUMNS, TaskStatus, normalizeStatus } from "@/lib/taskStatus";
import { cn } from "@/lib/utils";

type Props = {
  projectId: number;
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40",
  low: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-250 dark:border-sky-800/40",
};

const ListView = ({ projectId }: Props) => {
  const { data: tasks, isLoading, isError } = useGetTasksQuery({ projectId });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

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

  const handleToggleComplete = async (task: Task) => {
    const isCompleted = normalizeStatus(task.status) === "Completed";
    const newStatus: TaskStatus = isCompleted ? "Todo" : "Completed";

    try {
      await updateTaskStatus({ taskId: task.id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
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
          Failed to load tasks. Please verify that the API server is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {TASK_COLUMNS.map((column) => {
        const columnTasks = tasksByStatus[column.id];
        return (
          <div
            key={column.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-stroke-dark mb-4">
              <div className="flex items-center gap-3">
                <span className={cn("h-3 w-3 rounded-full", column.accent.replace("border-t-", "bg-"))} />
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {column.label}
                </h3>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", column.badge)}>
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks List */}
            {columnTasks.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-2">
                No tasks in this section.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-stroke-dark">
                {columnTasks.map((task) => {
                  const priorityKey = task.priority?.toLowerCase() ?? "";
                  const priorityClass =
                    priorityStyles[priorityKey] ??
                    "bg-gray-100 text-gray-650 dark:bg-dark-tertiary dark:text-gray-405 border border-gray-200 dark:border-stroke-dark";
                  const isCompleted = normalizeStatus(task.status) === "Completed";
                  const isManager = currentUser && (currentUser.role === "Project Leader" || currentUser.role === "PROJECT_LEADER");
                  const currentId = currentUser?.id || currentUser?.userId;
                  const isAssigned = currentId !== undefined && task.assignedUserId === currentId;
                  const canToggle = isManager || isAssigned;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {/* Completion Checkbox */}
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        disabled={!canToggle}
                        onChange={() => handleToggleComplete(task)}
                        className={cn(
                          "h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary mt-0.5",
                          canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                        )}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h4
                            className={cn(
                              "text-sm font-semibold text-gray-800 dark:text-gray-100 truncate",
                              isCompleted && "line-through text-gray-400 dark:text-gray-500 font-normal"
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.priority && (
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0",
                                priorityClass
                              )}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-gray-400 dark:text-gray-550">
                          {task.assignee && (
                            <div className="flex items-center gap-1 font-medium">
                              <User className="h-3 w-3 text-gray-405" />
                              <span>Assignee: <strong className="text-gray-600 dark:text-gray-300 font-semibold">{task.assignee.username}</strong></span>
                            </div>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}

                          {task.tags && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="h-3 w-3" />
                              <div className="flex gap-1">
                                {task.tags.split(",").map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded bg-gray-50 dark:bg-dark-tertiary px-1 py-0.5 border border-gray-100 dark:border-stroke-dark"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListView;
