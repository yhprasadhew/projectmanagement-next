"use client";

import React, { useState, useMemo } from "react";
import { Loader2, Calendar } from "lucide-react";
import { Task, useGetTasksQuery } from "@/state/api";
import { format, startOfWeek, addDays, addWeeks, addMonths, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  projectId: number;
};

type ViewMode = "day" | "week" | "month";

const barStyles: Record<string, string> = {
  urgent: "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-none",
  high: "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-none",
  medium: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm shadow-yellow-200 dark:shadow-none",
  low: "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none",
};

const TimelineView = ({ projectId }: Props) => {
  const { data: tasks, isLoading, isError } = useGetTasksQuery({ projectId });
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  // Determine timeline date boundaries
  const { timelineStart, timelineEnd, timeGrid } = useMemo(() => {
    const today = new Date();
    let start = today;
    let end = addDays(today, 30);

    // If we have tasks, calculate bounds based on tasks' range
    if (tasks && tasks.length > 0) {
      const startDates = tasks
        .map((t) => (t.startDate ? new Date(t.startDate).getTime() : null))
        .filter((d): d is number => d !== null);
      const dueDates = tasks
        .map((t) => (t.dueDate ? new Date(t.dueDate).getTime() : null))
        .filter((d): d is number => d !== null);

      if (startDates.length > 0) {
        start = new Date(Math.min(...startDates));
      }
      if (dueDates.length > 0) {
        end = new Date(Math.max(...dueDates));
      }

      // Add a buffer of 7 days before and after
      start = addDays(start, -7);
      end = addDays(end, 14);
    } else {
      start = addDays(start, -7);
    }

    // Generate grid labels based on view mode
    const grid: { date: Date; label: string }[] = [];
    if (viewMode === "day") {
      const daysCount = differenceInDays(end, start) + 1;
      const count = Math.max(daysCount, 30); // minimum 30 days
      for (let i = 0; i < count; i++) {
        const d = addDays(start, i);
        grid.push({ date: d, label: format(d, "d MMM") });
      }
      end = addDays(start, count - 1);
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(start);
      // Ensure we have at least 8 weeks
      for (let i = 0; i < 12; i++) {
        const d = addWeeks(weekStart, i);
        grid.push({ date: d, label: `w/c ${format(d, "d MMM")}` });
      }
      end = addDays(weekStart, 12 * 7 - 1);
    } else {
      // Month mode
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      for (let i = 0; i < 6; i++) {
        const d = addMonths(monthStart, i);
        grid.push({ date: d, label: format(d, "MMMM yyyy") });
      }
      end = addDays(addMonths(monthStart, 6), -1);
    }

    return {
      timelineStart: start,
      timelineEnd: end,
      timeGrid: grid,
    };
  }, [tasks, viewMode]);

  const totalTimelineDuration = timelineEnd.getTime() - timelineStart.getTime();

  // Tasks with valid schedule dates
  const scheduledTasks = useMemo(() => {
    return tasks?.filter((task) => task.startDate && task.dueDate) ?? [];
  }, [tasks]);

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            Project Schedule
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Gantt chart displaying task duration and dates.
          </p>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-dark-tertiary p-1 rounded-lg">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "rounded px-3 py-1 text-xs font-semibold capitalize transition-all duration-200",
                viewMode === mode
                  ? "bg-white text-gray-900 shadow-sm dark:bg-dark-bg dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {scheduledTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-100 dark:border-stroke-dark rounded-xl">
          <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">No scheduled tasks</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Make sure to assign Start Date and Due Date to tasks to show them here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 dark:border-stroke-dark rounded-xl">
          <div className="min-w-[800px] divide-y divide-gray-100 dark:divide-stroke-dark">
            
            {/* Grid Header */}
            <div className="flex bg-gray-50/50 dark:bg-dark-secondary/50 font-semibold text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <div className="w-1/4 min-w-[200px] p-3 border-r border-gray-100 dark:border-stroke-dark">
                Task Name
              </div>
              <div className="w-3/4 flex divide-x divide-gray-100 dark:divide-stroke-dark">
                {timeGrid.map((column, index) => (
                  <div
                    key={index}
                    className="flex-1 p-3 text-center truncate"
                  >
                    {column.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Rows */}
            {scheduledTasks.map((task) => {
              const priorityKey = task.priority?.toLowerCase() ?? "";
              const barClass =
                barStyles[priorityKey] ??
                "bg-gray-400 hover:bg-gray-500 text-white";

              // Date maths
              const taskStart = new Date(task.startDate!).getTime();
              const taskEnd = new Date(task.dueDate!).getTime();

              const startDiff = taskStart - timelineStart.getTime();
              const taskDuration = taskEnd - taskStart;

              // Percentages
              let left = (startDiff / totalTimelineDuration) * 100;
              let width = (taskDuration / totalTimelineDuration) * 100;

              // Constraint checking / Clamping
              if (left < 0) {
                width = width + left;
                left = 0;
              }
              if (left + width > 100) {
                width = 100 - left;
              }
              // Ensure minimum visual size (e.g. at least 3%)
              if (width < 3) {
                width = 3;
              }

              return (
                <div
                  key={task.id}
                  className="flex items-center text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/20"
                >
                  {/* Task Name Panel */}
                  <div className="w-1/4 min-w-[200px] p-3 font-medium border-r border-gray-100 dark:border-stroke-dark truncate">
                    {task.title}
                  </div>

                  {/* Task Bar Lane */}
                  <div className="w-3/4 p-3 relative h-12 flex items-center">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex divide-x divide-gray-50 dark:divide-stroke-dark/20 pointer-events-none">
                      {timeGrid.map((_, index) => (
                        <div key={index} className="flex-1 h-full" />
                      ))}
                    </div>

                    {/* Gantt Bar */}
                    <div
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                      className={cn(
                        "absolute h-6 rounded-lg px-2 flex items-center justify-between text-[10px] font-bold overflow-hidden select-none transition-all duration-200 cursor-help",
                        barClass
                      )}
                      title={`${task.title} (${format(new Date(task.startDate!), "d MMM")} - ${format(new Date(task.dueDate!), "d MMM")})`}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
