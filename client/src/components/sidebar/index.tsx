"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  X,
  LayoutDashboard,
  Briefcase,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  const { data: projects, error, isLoading } = useGetProjectsQuery();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sidebarCollapsed = isMounted ? isSidebarCollapsed : false;

  const sidebarClassNames = `fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-stroke-dark dark:bg-dark-secondary ${
    sidebarCollapsed
      ? "pointer-events-none w-0 -translate-x-full opacity-0"
      : "pointer-events-auto w-64 translate-x-0 opacity-100"
  }`;

  const navLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className={sidebarClassNames}>
      <div className="flex h-full flex-col justify-between p-5">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 shadow-md ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 dark:bg-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    className="fill-white dark:fill-gray-900"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    className="fill-white/40 dark:fill-gray-900/40"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1.5"
                    className="fill-white/40 dark:fill-gray-900/40"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1.5"
                    className="fill-white dark:fill-gray-900"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-base font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
                  TaskFlow
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Project Manager
                </p>
              </div>
            </Link>

            <button
              onClick={() => dispatch(setIsSidebarCollapsed(true))}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-tertiary dark:hover:text-gray-200"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Menu
          </p>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-tertiary dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute -left-5 h-5 w-1 rounded-r-full bg-gray-900 dark:bg-white" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex min-h-0 flex-1 flex-col border-t border-gray-200 pt-4 dark:border-stroke-dark">
            <button
              onClick={() => setShowProjects((prev) => !prev)}
              className="flex w-full shrink-0 items-center justify-between px-4 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                Projects
                {projects && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-dark-tertiary dark:text-gray-400">
                    {projects.length}
                  </span>
                )}
              </span>
              {showProjects ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showProjects && (
              <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading projects...
                  </div>
                )}

                {error && (
                  <div className="mx-2 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Could not load projects. Check API connection.</span>
                  </div>
                )}

                {!isLoading && !error && projects?.length === 0 && (
                  <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">
                    No projects yet
                  </p>
                )}

                {projects?.map((project) => {
                  const projectPath = `/projects/${project.id}`;
                  const isActive = pathname === projectPath;

                  return (
                    <Link
                      key={project.id}
                      href={projectPath}
                      className={`group relative flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-tertiary dark:hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -left-5 h-5 w-1 rounded-r-full bg-gray-900 dark:bg-white" />
                      )}
                      <Briefcase className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 truncate">{project.name}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 pt-4 dark:border-stroke-dark">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
              v1
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                TaskFlow
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                © 2026 · All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
