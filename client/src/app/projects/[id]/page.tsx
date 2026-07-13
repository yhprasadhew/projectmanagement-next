"use client";

import React, { useState, useEffect } from "react";
import { useGetProjectsQuery, useGetTasksQuery, Task } from "@/state/api";
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ListTodo,
  TrendingUp,
  Tag,
  AlertCircle
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

const mockProjects = [
  { id: 1, name: "TaskFlow", description: "Standard project management workspace" },
  { id: 2, name: "Marketing Campaign", description: "Ad campaigns and asset creation" },
  { id: 3, name: "Product Launch", description: "Go-to-market release schedule" },
  { id: 4, name: "Design System", description: "Reusable UI components and styles" },
];

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

export default function ProjectPage({ params }: Props) {
  const { id: rawId } = React.use(params);
  const projectId = parseInt(rawId, 10);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: apiProjects } = useGetProjectsQuery();
  const { data: apiTasks, isLoading, error } = useGetTasksQuery({ projectId }, { skip: isNaN(projectId) });

  if (!isMounted) return null;

  const currentProject = (apiProjects || mockProjects).find(p => p.id === projectId) || mockProjects[0];
  const allTasks = apiTasks && apiTasks.length > 0 ? apiTasks : mockTasks.filter(t => t.projectId === projectId);

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40";
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
  };

  const todoTasks = allTasks.filter(t => t.status?.toLowerCase() === "to do" || t.status?.toLowerCase() === "todo");
  const inProgressTasks = allTasks.filter(t => t.status?.toLowerCase() === "in progress" || t.status?.toLowerCase() === "inprogress");
  const completedTasks = allTasks.filter(t => t.status?.toLowerCase() === "completed");

  const statCards = [
    { title: "To Do", count: todoTasks.length, icon: ListTodo, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { title: "In Progress", count: inProgressTasks.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { title: "Completed", count: completedTasks.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { title: "Total Tasks", count: allTasks.length, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
  ];

  const renderTaskColumn = (title: string, tasks: Task[], columnColor: string) => (
    <div className="flex flex-col gap-4 rounded-xl bg-gray-50/50 p-4 dark:bg-dark-secondary/35 border border-gray-100 dark:border-stroke-dark/50 flex-1 min-w-[280px]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-stroke-dark">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${columnColor}`} />
          <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-dark-tertiary dark:text-gray-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-500">
            <AlertCircle className="h-6 w-6 mb-1 opacity-50" />
            <p className="text-xs">No tasks in this stage</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm hover:shadow transition-shadow dark:border-stroke-dark dark:bg-dark-secondary cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {task.points && (
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {task.points} pts
                  </span>
                )}
              </div>

              <h4 className="font-medium text-gray-800 dark:text-white leading-snug line-clamp-2">
                {task.title}
              </h4>
              
              {task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
              )}

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

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-stroke-dark">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "No date"}</span>
                </div>

                <div className="h-6 w-6 rounded-full bg-blue-500 text-white font-medium flex items-center justify-center text-[10px] shadow-sm">
                  P
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {currentProject.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentProject.description || "No description provided."}
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{card.title}</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{card.count}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board columns */}
      <div className="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-4">
        {renderTaskColumn("To Do", todoTasks, "bg-blue-500")}
        {renderTaskColumn("In Progress", inProgressTasks, "bg-amber-500")}
        {renderTaskColumn("Completed", completedTasks, "bg-emerald-500")}
      </div>
    </div>
  );
}
