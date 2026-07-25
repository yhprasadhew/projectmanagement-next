"use client";

import React, { useState, useMemo } from "react";
import { Loader2, Inbox, Calendar, AlertCircle, Save } from "lucide-react";
import { Task, useGetTasksQuery, useUpdateTaskMutation } from "@/state/api";
import { cn } from "@/lib/utils";

type Props = {
  projectId: number;
};

const BacklogView = ({ projectId }: Props) => {
  const { data: tasks, isLoading, isError } = useGetTasksQuery({ projectId });
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(0);

  // Filter tasks that lack startDate, dueDate, or priority
  const backlogTasks = useMemo(() => {
    return (
      tasks?.filter((task) => !task.startDate || !task.dueDate || !task.priority) ??
      []
    );
  }, [tasks]);

  const selectedTask = useMemo(() => {
    return tasks?.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status || "Todo");
    setPriority(task.priority || "Medium");
    setStartDate(task.startDate ? task.startDate.split("T")[0] : "");
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setPoints(task.points || 0);
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;

    try {
      await updateTask({
        taskId: selectedTaskId,
        task: {
          title,
          description: description || undefined,
          status,
          priority: priority || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          points: points ? Number(points) : undefined,
        },
      }).unwrap();

      // Deselect task after saving if it's no longer backlog
      setSelectedTaskId(null);
    } catch (err) {
      console.error("Failed to update task during backlog triage:", err);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Backlog List (Left 2 Columns on LG screens) */}
      <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-stroke-dark mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Inbox className="h-5 w-5 text-gray-400" />
                Backlog Tasks
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tasks waiting to be scheduled, estimated, or prioritized.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 text-xs font-semibold">
              {backlogTasks.length} Issues
            </span>
          </div>

          {backlogTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-100 dark:border-stroke-dark rounded-xl mt-4">
              <Inbox className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Clean Backlog!</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All tasks are currently scheduled and prioritized.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {backlogTasks.map((task) => {
                const isSelected = task.id === selectedTaskId;
                const missingIssues = [
                  !task.priority && "Priority",
                  !task.startDate && "Start Date",
                  !task.dueDate && "Due Date",
                ].filter(Boolean);

                return (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-2",
                      isSelected
                        ? "border-blue-500 bg-blue-50/35 dark:border-blue-500 dark:bg-blue-950/20 shadow-sm"
                        : "border-gray-150 bg-white hover:border-gray-300 dark:border-stroke-dark dark:bg-dark-secondary dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {task.title}
                      </h4>
                      <span className="text-[10px] bg-gray-100 dark:bg-dark-tertiary px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-medium">
                        {task.status || "Todo"}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-semibold mt-2">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>Needs: {missingIssues.join(", ")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Triage Panel (Right Column on LG screens) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary flex flex-col justify-between">
        {selectedTask ? (
          <form onSubmit={handleSaveTriage} className="space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 dark:border-stroke-dark">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  Triage Panel
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Update scheduling for Task #{selectedTask.id}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                  >
                    <option value="Todo">Todo</option>
                    <option value="Working Progress">Working Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Points / Estimation
                </label>
                <input
                  type="number"
                  min={0}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6 dark:border-stroke-dark">
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-stroke-dark dark:text-gray-300 dark:hover:bg-dark-tertiary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Triage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-100 dark:border-stroke-dark rounded-2xl">
            <Inbox className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
            <h4 className="text-sm font-semibold text-gray-750 dark:text-gray-300">Select an Issue</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mt-1.5">
              Click on a backlog task from the list on the left to edit and schedule it inside the triage panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklogView;
