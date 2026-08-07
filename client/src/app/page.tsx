"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckSquare,
  Users,
  Percent,
  Loader2,
  MessageSquare,
  PlusCircle,
  FolderPlus,
  TrendingUp,
} from "lucide-react";
import { useGetProjectsQuery, useGetTasksGlobalQuery } from "@/state/api";
import { useAppSelector } from "./redux";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { normalizeStatus } from "@/lib/taskStatus";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS_STATUS = ["#9ca3af", "#3b82f6", "#f59e0b", "#10b981"]; // Todo, WP, UR, Completed
const COLORS_PRIORITY = {
  Urgent: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#06b6d4",
};

const getUserNameById = (userId: number) => {
  const users: Record<number, string> = {
    1: "AliceJones",
    2: "BobSmith",
    3: "CarolWhite",
    4: "DaveBrown",
    5: "EveClark",
    6: "FrankWright",
  };
  return users[userId] || `User #${userId}`;
};

export default function Home() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "Project Leader" && parsed.role !== "PROJECT_LEADER") {
          router.push("/developer");
          return;
        }
      } catch (e) {}
    }
    setIsMounted(true);
  }, [router]);

  const { data: projects, isLoading: projectsLoading, isError: projectsError } = useGetProjectsQuery(undefined, {
    skip: !isMounted,
  });
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useGetTasksGlobalQuery(undefined, {
    skip: !isMounted,
  });
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // 1. KPI Statistics Calculations
  const stats = useMemo(() => {
    const totalProjects = projects?.length || 0;
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t) => normalizeStatus(t.status) === "Completed").length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeUsersSet = new Set<string>();
    tasks?.forEach((t) => {
      if (t.author?.username) activeUsersSet.add(t.author.username);
      if (t.assignee?.username) activeUsersSet.add(t.assignee.username);
    });
    const activeUsers = activeUsersSet.size || 6; // Fallback to mock count if empty

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate,
      activeUsers,
    };
  }, [projects, tasks]);

  // 2. Chart Data Aggregations
  const statusChartData = useMemo(() => {
    const counts = { Todo: 0, "Working Progress": 0, "Under Review": 0, Completed: 0 };
    tasks?.forEach((t) => {
      const s = normalizeStatus(t.status);
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    tasks?.forEach((t) => {
      const p = t.priority || "Medium";
      if (counts[p] !== undefined) {
        counts[p]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: COLORS_PRIORITY[name as keyof typeof COLORS_PRIORITY],
    }));
  }, [tasks]);

  const timelineChartData = useMemo(() => {
    if (!tasks) return [];
    // Generate dates for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return days.map((day) => {
      let created = 0;
      let completed = 0;
      tasks.forEach((t) => {
        if (t.createdAt && t.createdAt.split("T")[0] === day) {
          created++;
        }
        if (
          normalizeStatus(t.status) === "Completed" &&
          t.updatedAt &&
          t.updatedAt.split("T")[0] === day
        ) {
          completed++;
        }
      });
      return {
        date: format(new Date(day), "d MMM"),
        Created: created,
        Completed: completed,
      };
    });
  }, [tasks]);

  // 3. Workload Data
  const workloadData = useMemo(() => {
    const map: Record<string, { total: number; completed: number; username: string }> = {};
    tasks?.forEach((t) => {
      if (t.assignee) {
        const u = t.assignee.username;
        if (!map[u]) {
          map[u] = { total: 0, completed: 0, username: u };
        }
        map[u].total++;
        if (normalizeStatus(t.status) === "Completed") {
          map[u].completed++;
        }
      }
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [tasks]);

  // 4. Activity Feed Data
  const activityFeed = useMemo(() => {
    interface ActivityItem {
      id: string;
      type: "task_create" | "comment" | "project_create";
      user: string;
      text: string;
      target: string;
      date: Date;
    }
    const items: ActivityItem[] = [];

    // Task creations
    tasks?.forEach((t) => {
      if (t.createdAt) {
        items.push({
          id: `task-create-${t.id}`,
          type: "task_create",
          user: t.author?.username || "Someone",
          text: "created task",
          target: t.title,
          date: new Date(t.createdAt),
        });
      }
    });

    // Comments
    tasks?.forEach((t) => {
      t.comments?.forEach((c) => {
        const commentDate = (c as any).createdAt || t.createdAt;
        if (commentDate) {
          items.push({
            id: `comment-${c.id}`,
            type: "comment",
            user: getUserNameById(c.userId),
            text: "commented on",
            target: t.title,
            date: new Date(commentDate),
          });
        }
      });
    });

    // Project creations
    projects?.forEach((p) => {
      if (p.createdAt) {
        items.push({
          id: `project-${p.id}`,
          type: "project_create",
          user: "System",
          text: "added project",
          target: p.name,
          date: new Date(p.createdAt),
        });
      }
    });

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [tasks, projects]);

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-900/10">
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Failed to load dashboard statistics. Please verify that the API server is running.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time metrics, project velocities, and team workload summary.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<Briefcase className="h-5 w-5" />}
          accentClass="bg-gradient-to-tr from-blue-500 to-blue-600 shadow-blue-100"
        />
        <DashboardCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<CheckSquare className="h-5 w-5" />}
          accentClass="bg-gradient-to-tr from-sky-500 to-sky-600 shadow-sky-100"
        />
        <DashboardCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users className="h-5 w-5" />}
          accentClass="bg-gradient-to-tr from-purple-500 to-purple-600 shadow-purple-100"
        />
        <DashboardCard
          title="Task Completion Rate"
          value={`${stats.completionRate}%`}
          icon={<Percent className="h-5 w-5" />}
          accentClass="bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-emerald-100"
        />
      </div>

      {/* Charts Grid */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
              Task Velocity (Last 7 Days)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCreated)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Task Status Distribution
            </h3>
            <div className="h-60 w-full flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                      borderRadius: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
              {statusChartData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS_STATUS[index] }}
                  />
                  <span className="truncate">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Task Priority Distribution
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData} margin={{ left: -20, right: 10, top: 10 }}>
                  <XAxis
                    dataKey="name"
                    stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workload Progress Tracker */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Team Workload Summary
            </h3>
            <div className="space-y-4 pt-2">
              {workloadData.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-6 text-center">
                  No workload allocations found.
                </p>
              ) : (
                workloadData.map((member) => {
                  const percent = member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0;
                  return (
                    <div key={member.username} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {member.username}
                        </span>
                        <span className="text-gray-450 dark:text-gray-500">
                          {member.completed}/{member.total} Tasks completed ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-dark-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Recent Activity Feed
            </h3>
            <div className="flow-root pt-2">
              {activityFeed.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-6 text-center">
                  No recent activities logged.
                </p>
              ) : (
                <ul className="-mb-8">
                  {activityFeed.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== activityFeed.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-100 dark:bg-dark-tertiary"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full text-white ring-8 ring-white dark:ring-dark-secondary",
                              activity.type === "comment" && "bg-blue-500",
                              activity.type === "task_create" && "bg-emerald-500",
                              activity.type === "project_create" && "bg-purple-500"
                            )}>
                              {activity.type === "comment" && <MessageSquare className="h-4 w-4" />}
                              {activity.type === "task_create" && <PlusCircle className="h-4 w-4" />}
                              {activity.type === "project_create" && <FolderPlus className="h-4 w-4" />}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-xs text-gray-650 dark:text-gray-300">
                              <span className="font-semibold text-gray-800 dark:text-gray-100">
                                {activity.user}
                              </span>{" "}
                              {activity.text}{" "}
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {activity.target}
                              </span>
                            </p>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">
                              {formatDistanceToNow(activity.date, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//dj

//BobSmith -manager
//AliceJones -developer
//CarolWhite -developer
//password123