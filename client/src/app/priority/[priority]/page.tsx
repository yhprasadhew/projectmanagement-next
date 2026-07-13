"use client";

import React, { useState, useEffect } from "react";
import { useGetTasksQuery, Task } from "@/state/api";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  AlertCircle,
  Tag,
  Folder
} from "lucide-react";

type Props = {
  params: Promise<{ priority: string }>;
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Setup Next.js Project",
    description: "Initialize Next.js application with Tailwind CSS and Redux Toolkit.",
    status: "Completed",
    priority: "High",
    tags: "frontend, setup",
    startDate: "2026-07-01",
    dueDate: "2026-07-05",
    points: 5,
    projectId: 1,
  },
  {
    id: 2,
    title: "Implement Sidebar Navigation",
    description: "Add collapsible projects and priorities navigation with dynamic active states.",
    status: "In Progress",
    priority: "Medium",
    tags: "frontend, ui",
    startDate: "2026-07-05",
    dueDate: "2026-07-12",
    points: 3,
    projectId: 1,
  },
  {
    id: 3,
    title: "Define DB Schema & API Routes",
    description: "Design relational schema and setup database migrations for projects and tasks.",
    status: "To Do",
    priority: "Urgent",
    tags: "backend, db",
    startDate: "2026-07-10",
    dueDate: "2026-07-15",
    points: 8,
    projectId: 1,
  },
  {
    id: 4,
    title: "Create Brand Assets",
    description: "Design logos, color palettes, and social media banners for the project launch.",
    status: "Completed",
    priority: "Medium",
    tags: "design",
    startDate: "2026-07-01",
    dueDate: "2026-07-07",
    points: 2,
    projectId: 2,
  },
  {
    id: 5,
    title: "Write Press Release",
    description: "Draft official press release copy and schedule distribution platforms.",
    status: "To Do",
    priority: "Low",
    tags: "marketing",
    startDate: "2026-07-12",
    dueDate: "2026-07-18",
    points: 1,
    projectId: 2,
  },
];

export default function PriorityPage({ params }: Props) {
  const { priority: rawPriority } = React.use(params);
  const priority = rawPriority.toLowerCase();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch tasks for first project as base, merge with mocks
  const { data: apiTasks } = useGetTasksQuery({ projectId: 1 });

  if (!isMounted) return null;

  // Filter tasks matching this priority
  const allTasks = apiTasks && apiTasks.length > 0 ? apiTasks : mockTasks;
  const filteredTasks = allTasks.filter(t => {
    const taskPriority = t.priority?.toLowerCase();
    if (priority === "backlog") {
      return taskPriority === "backlog" || taskPriority === "backing" || taskPriority === "low" && t.status === "Backlog";
    }
    return taskPriority === priority;
  });

  const getPriorityColor = (p: string) => {
    switch (p.toLowerCase()) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40";
      default: return "bg-gray-100 text-gray-800 dark:bg-dark-tertiary dark:text-gray-400 border border-gray-200 dark:border-stroke-dark";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "in progress": return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <ListTodo className="h-4 w-4 text-blue-500" />;
    }
  };

  const getProjectName = (projId?: number) => {
    switch (projId) {
      case 1: return "TaskFlow";
      case 2: return "Marketing Campaign";
      case 3: return "Product Launch";
      default: return "General";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
          {priority} Priority Tasks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing all tasks assigned to the {priority} priority level.
        </p>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-12 text-center dark:border-stroke-dark bg-white dark:bg-dark-secondary">
          <AlertCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No tasks found</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">There are no tasks with {priority} priority.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow transition-shadow dark:border-stroke-dark dark:bg-dark-secondary"
            >
              <div className="flex flex-col gap-3">
                {/* Top Badge & Project info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                    <Folder className="h-3.5 w-3.5" />
                    <span>{getProjectName(task.projectId)}</span>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getPriorityColor(task.priority || "")}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-800 dark:text-white leading-snug line-clamp-2">
                  {task.title}
                </h3>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {task.description}
                  </p>
                )}

                {/* Tags */}
                {task.tags && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.split(",").map(tag => (
                      <span key={tag} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-dark-tertiary dark:text-gray-400">
                        <Tag className="h-2.5 w-2.5" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-stroke-dark">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "No date"}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{task.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
