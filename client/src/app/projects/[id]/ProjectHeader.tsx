"use client";

import React from "react";
import {
  LayoutGrid,
  List,
  BarChart2,
  Table2,
  AlignLeft,
  Plus,
  Share2,
  Filter,
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isModalNewTaskOpen?: boolean;
  setIsModalNewTaskOpen?: (open: boolean) => void;
};

const tabs = [
  { name: "Board", icon: LayoutGrid },
  { name: "List", icon: List },
  { name: "Timeline", icon: BarChart2 },
  { name: "Table", icon: Table2 },
  { name: "Backlog", icon: AlignLeft },
];

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  setIsModalNewTaskOpen,
}: Props) => {
  return (
    <div className="mb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        {/* Project breadcrumb / title */}
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
            Projects
          </p>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Project Details
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-stroke-dark px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
            aria-label="Filter tasks"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          <button
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-stroke-dark px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
            aria-label="Share project"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors shadow-sm"
            aria-label="Add new task"
            onClick={() => setIsModalNewTaskOpen?.(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative border-b border-gray-200 dark:border-stroke-dark">
        <nav className="flex gap-0 overflow-x-auto" aria-label="Project tabs">
          {tabs.map(({ name, icon: Icon }) => {
            const isActive = activeTab === name;
            return (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {name}
                {/* Active underline */}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProjectHeader;
