"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  X,
  LayoutDashboard,
  Briefcase,
  Settings,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

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
      href: "/projects",
      label: "Projects",
      icon: Briefcase,
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
        <div>
          {/* ===================== LOGO ===================== */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              {/* Custom logo mark */}
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

          {/* ===================== NAVIGATION ===================== */}
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
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="border-t border-gray-200 pt-4 dark:border-stroke-dark">
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