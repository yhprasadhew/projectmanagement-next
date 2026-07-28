"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  useGetTasksGlobalQuery, 
  useUpdateTaskStatusMutation, 
  useCreateCommentMutation, 
  useCreateAttachmentMutation,
  Task,
  Comment,
  Attachment 
} from "@/state/api";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Upload, 
  Search, 
  User, 
  Tag, 
  Folder,
  ChevronRight,
  X,
  FileText,
  Check,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isBefore, isAfter, endOfWeek, parseISO } from "date-fns";

const priorityStyles: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/40",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
  "working progress": "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40",
  "under review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/40",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
};

export default function DeveloperWorkspace() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all"); // all, overdue, today, thisWeek, later, undated
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, completed

  // Detail Drawer state
  const [newCommentText, setNewCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useGetTasksGlobalQuery();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [createAttachment] = useCreateAttachmentMutation();

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  // Filter tasks assigned to logged in user
  const assignedTasks = useMemo(() => {
    if (!tasks || !currentUser) return [];
    const currentId = currentUser.id || currentUser.userId;
    return tasks.filter(t => t.assignedUserId === currentId);
  }, [tasks, currentUser]);

  // Sync selected task with latest data
  const latestSelectedTask = useMemo(() => {
    if (!selectedTask || !tasks) return null;
    return tasks.find(t => t.id === selectedTask.id) || null;
  }, [tasks, selectedTask]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return assignedTasks.filter(task => {
      // 1. Search Query
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Priority Filter
      const matchesPriority = priorityFilter === "all" || 
        task.priority?.toLowerCase() === priorityFilter.toLowerCase();

      // 3. Status Filter
      const isCompleted = task.status?.toLowerCase() === "completed";
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "completed" && isCompleted) ||
        (statusFilter === "active" && !isCompleted);

      // 4. Due Date Filter
      let matchesDueDate = true;
      if (dueDateFilter !== "all") {
        if (!task.dueDate) {
          matchesDueDate = dueDateFilter === "undated";
        } else {
          const taskDate = parseISO(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (dueDateFilter === "overdue") {
            matchesDueDate = isBefore(taskDate, today) && !isCompleted;
          } else if (dueDateFilter === "today") {
            matchesDueDate = isToday(taskDate);
          } else if (dueDateFilter === "thisWeek") {
            const endOfCurrentWeek = endOfWeek(today);
            matchesDueDate = !isBefore(taskDate, today) && !isAfter(taskDate, endOfCurrentWeek);
          } else if (dueDateFilter === "later") {
            const endOfCurrentWeek = endOfWeek(today);
            matchesDueDate = isAfter(taskDate, endOfCurrentWeek);
          }
        }
      }

      return matchesSearch && matchesPriority && matchesStatus && matchesDueDate;
    });
  }, [assignedTasks, searchQuery, priorityFilter, statusFilter, dueDateFilter]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = assignedTasks.length;
    const completed = assignedTasks.filter(t => t.status?.toLowerCase() === "completed").length;
    const pending = total - completed;
    const urgent = assignedTasks.filter(t => t.priority?.toLowerCase() === "urgent" && t.status?.toLowerCase() !== "completed").length;
    
    // Calculate Overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = assignedTasks.filter(t => {
      if (!t.dueDate || t.status?.toLowerCase() === "completed") return false;
      return isBefore(parseISO(t.dueDate), today);
    }).length;

    return { total, completed, pending, urgent, overdue };
  }, [assignedTasks]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskStatus({ taskId, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestSelectedTask || !newCommentText.trim()) return;

    try {
      await createComment({
        taskId: latestSelectedTask.id,
        text: newCommentText.trim()
      }).unwrap();
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !latestSelectedTask) return;

    setIsUploading(true);
    setUploadError("");

    // Limit check (frontend safeguard)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      setIsUploading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await createAttachment({
            taskId: latestSelectedTask.id,
            fileName: file.name,
            fileURL: base64String
          }).unwrap();
          setIsUploading(false);
        } catch (err: any) {
          console.error("Upload mutation failed:", err);
          setUploadError(err.data?.message || "Failed to save attachment.");
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading failed:", err);
      setUploadError("Error reading file details.");
      setIsUploading(false);
    }
  };

  const getPriorityIcon = (p?: string) => {
    switch (p?.toLowerCase()) {
      case "urgent": return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (tasksError || !currentUser) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
          {!currentUser ? "Please log in as a developer first." : "Failed to load developer workspace tasks."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Greetings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Developer Workspace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, <span className="font-semibold text-gray-700 dark:text-gray-300">{currentUser.username}</span>. Here are your assigned tickets.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tasks</p>
          <p className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{metrics.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</p>
          <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">{metrics.pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.completed}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Urgent Active</p>
          <p className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">{metrics.urgent}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue</p>
          <p className="mt-2 text-2xl font-extrabold text-orange-600 dark:text-orange-400">{metrics.overdue}</p>
        </div>
      </div>

      {/* Workspace Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-405" />
          <input
            type="text"
            placeholder="Search tickets, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10.5 pr-4 py-2.5 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter tabs */}
          <div className="flex rounded-xl bg-gray-150/60 dark:bg-dark-tertiary p-1 text-[11px] font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn("px-3 py-1.5 rounded-lg transition-colors", statusFilter === "all" ? "bg-white dark:bg-dark-secondary text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300")}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn("px-3 py-1.5 rounded-lg transition-colors", statusFilter === "active" ? "bg-white dark:bg-dark-secondary text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300")}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={cn("px-3 py-1.5 rounded-lg transition-colors", statusFilter === "completed" ? "bg-white dark:bg-dark-secondary text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300")}
            >
              Completed
            </button>
          </div>

          {/* Priority Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Due date Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Timeline:</span>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="overdue">Overdue Active</option>
              <option value="today">Due Today</option>
              <option value="thisWeek">Due This Week</option>
              <option value="later">Due Later</option>
              <option value="undated">No Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-16 text-center dark:border-stroke-dark bg-white dark:bg-dark-secondary">
          <AlertCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="font-bold text-gray-700 dark:text-gray-200">No tickets found</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs leading-relaxed">
            There are no assigned tasks matching your search or filters. Get some tea and take a break!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map(task => {
            const isCompleted = task.status?.toLowerCase() === "completed";
            const priorityKey = task.priority?.toLowerCase() || "";
            const statusKey = task.status?.toLowerCase() || "todo";

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTask(task)}
                className="w-full text-left flex flex-col justify-between gap-4 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all dark:border-stroke-dark dark:bg-dark-secondary group"
              >
                <div className="flex flex-col gap-3 w-full">
                  {/* Category and priority badge */}
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-gray-400">
                    <span className="flex items-center gap-1">
                      <Folder className="h-3.5 w-3.5 text-gray-450" />
                      Project #{task.projectId}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold", priorityStyles[priorityKey] || "bg-gray-150 text-gray-650")}>
                      {task.priority || "Medium"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    "font-bold text-gray-800 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1",
                    isCompleted && "line-through text-gray-400 dark:text-gray-500 font-normal"
                  )}>
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Tags */}
                  {task.tags && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.split(",").map(tag => (
                        <span key={tag} className="flex items-center gap-1 rounded bg-slate-50 border border-gray-100 px-2 py-0.5 text-[9px] text-gray-500 dark:bg-dark-tertiary dark:border-stroke-dark dark:text-gray-400">
                          <Tag className="h-2.5 w-2.5" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {task.assignee && (
                  <div className="mb-3 flex items-center gap-1.5 text-[11px] text-gray-505 dark:text-gray-405 font-medium w-full mt-2">
                    <User className="h-3.5 w-3.5 text-gray-450" />
                    <span>Assignee: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{task.assignee.username}</strong></span>
                  </div>
                )}

                {/* Footer with date & status */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2 w-full dark:border-stroke-dark">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-550 font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {task.dueDate ? format(parseISO(task.dueDate), "d MMM yyyy") : "No due date"}
                    </span>
                  </div>

                  <span className={cn("px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider", statusColors[statusKey] || "bg-gray-100 text-gray-755")}>
                    {task.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Task detail Slide-over panel */}
      {latestSelectedTask && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
              aria-hidden="true"
              onClick={() => setSelectedTask(null)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md md:max-w-lg transform bg-white dark:bg-dark-secondary shadow-2xl transition-transform duration-300 ease-in-out">
                <div className="flex h-full flex-col overflow-y-scroll">
                  {/* Drawer Header */}
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 dark:bg-dark-tertiary dark:border-stroke-dark flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> Ticket Details
                      </span>
                      <h2 className="text-base font-bold text-gray-800 dark:text-white mt-0.5 truncate max-w-xs md:max-w-md">
                        {latestSelectedTask.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="rounded-lg p-1.5 text-gray-450 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-dark-secondary dark:hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Drawer Body */}
                  <div className="flex-1 p-6 space-y-6">
                    {/* Status & Priority badges row */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">Assignee</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-550 rounded-lg border border-gray-200 dark:border-stroke-dark dark:text-gray-400">
                          <User className="h-3.5 w-3.5 text-gray-450" />
                          <span>{latestSelectedTask.assignee?.username || "Unassigned"}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">Status</span>
                        <select
                          value={latestSelectedTask.status || "Todo"}
                          onChange={(e) => handleStatusChange(latestSelectedTask.id, e.target.value)}
                          className={cn("px-2.5 py-1 text-xs font-bold rounded-lg outline-none cursor-pointer", statusColors[latestSelectedTask.status?.toLowerCase() || "todo"])}
                        >
                          <option value="Todo">To Do</option>
                          <option value="Working Progress">In Progress</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">Priority</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-stroke-dark">
                          {getPriorityIcon(latestSelectedTask.priority)}
                          <span>{latestSelectedTask.priority || "Medium"}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">Due Date</span>
                        <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-500 rounded-lg border border-gray-200 dark:border-stroke-dark dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{latestSelectedTask.dueDate ? format(parseISO(latestSelectedTask.dueDate), "d MMM yyyy") : "No due date"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-400">Description</span>
                      <div className="p-4 rounded-xl bg-gray-50 text-xs text-gray-700 dark:bg-dark-tertiary dark:text-gray-300 leading-relaxed min-h-[60px]">
                        {latestSelectedTask.description || "No description provided for this task."}
                      </div>
                    </div>

                    {/* Quick Complete Section */}
                    {latestSelectedTask.status !== "Completed" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(latestSelectedTask.id, "Completed")}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 py-3 text-xs font-bold text-white shadow transition-all hover:scale-[1.01]"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mark Task Complete</span>
                      </button>
                    )}

                    {/* Attachments Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-150 dark:border-stroke-dark">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" /> Files & Attachments ({latestSelectedTask.attachments?.length || 0})
                        </span>
                        
                        <label className="flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 cursor-pointer transition-colors">
                          <Upload className="h-3 w-3" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {uploadError && (
                        <p className="text-[10px] font-bold text-red-500">{uploadError}</p>
                      )}

                      {isUploading && (
                        <div className="flex items-center justify-center py-4">
                          <Clock className="h-5 w-5 animate-spin text-blue-500" />
                          <span className="text-xs text-gray-550 ml-1.5">Uploading attachment...</span>
                        </div>
                      )}

                      {latestSelectedTask.attachments && latestSelectedTask.attachments.length > 0 ? (
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                          {latestSelectedTask.attachments.map((file: Attachment) => (
                            <a
                              key={file.id}
                              href={file.fileURL}
                              download={file.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 dark:border-stroke-dark dark:bg-dark-tertiary dark:hover:bg-dark-bg/40 transition-colors"
                            >
                              <FileText className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                                  {file.fileName}
                                </p>
                                <p className="text-[9px] text-gray-400 mt-0.5">
                                  Uploaded by {file.uploadedBy?.username || "You"}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 dark:text-gray-550 italic py-2">
                          No files attached yet.
                        </p>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-stroke-dark">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Comments ({latestSelectedTask.comments?.length || 0})
                      </span>

                      {/* Comment Form */}
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Add a comment..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary"
                        />
                        <button
                          type="submit"
                          disabled={isCommenting || !newCommentText.trim()}
                          className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>

                      {/* Comments Feed */}
                      {latestSelectedTask.comments && latestSelectedTask.comments.length > 0 ? (
                        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                          {latestSelectedTask.comments.map((comment: Comment) => {
                            const authorInitial = comment.user?.username.charAt(0).toUpperCase() || "?";
                            return (
                              <div key={comment.id} className="flex gap-2.5 text-xs">
                                <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0 dark:bg-blue-900/30 dark:text-blue-450">
                                  {authorInitial}
                                </div>
                                <div className="flex-1 min-w-0 bg-gray-50/50 p-2.5 rounded-xl border border-gray-150/70 dark:bg-dark-tertiary dark:border-stroke-dark/40">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {comment.user?.username || "Unknown user"}
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                      {comment.createdAt ? format(parseISO(comment.createdAt), "d MMM h:mm a") : ""}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-gray-650 dark:text-gray-300 leading-normal">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 dark:text-gray-555 italic py-2">
                          No comments on this task yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
