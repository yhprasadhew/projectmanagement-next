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
  Users,
} from "lucide-react";
import { Project } from "@/state/api";

type Props = {
  project: Project;
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
  { name: "Members", icon: Users },
];

const ProjectHeader = ({
  project,
  activeTab,
  setActiveTab,
  setIsModalNewTaskOpen,
}: Props) => {
  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mb-0.5 text-xs text-gray-400 dark:text-gray-500">
            Projects
          </p>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-stroke-dark dark:text-gray-300 dark:hover:bg-dark-tertiary"
            aria-label="Filter tasks"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          <button
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-stroke-dark dark:text-gray-300 dark:hover:bg-dark-tertiary"
            aria-label="Share project"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            aria-label="Add new task"
            onClick={() => setIsModalNewTaskOpen?.(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="relative border-b border-gray-200 dark:border-stroke-dark">
        <nav className="flex gap-0 overflow-x-auto" aria-label="Project tabs">
          {tabs.map(({ name, icon: Icon }) => {
            const isActive = activeTab === name;
            return (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {name}
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
