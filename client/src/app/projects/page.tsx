"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Calendar, Loader2, ArrowRight, Trash2 } from "lucide-react";
import { useGetProjectsQuery, useDeleteProjectMutation } from "@/state/api";
import ModalNewProject from "@/components/ModalNewProject";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useGetProjectsQuery();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);

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
          Failed to load projects. Please verify that the API server is running.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Directory of all active and scheduled team projects.
          </p>
        </div>
        <button
          onClick={() => setIsModalNewProjectOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary"
            >
              {/* Delete Project Button */}
              <button
                disabled={isDeleting}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the project "${project.name}"? This will permanently delete all tasks, comments, and attachments within this project.`)) {
                    try {
                      await deleteProject(project.id).unwrap();
                    } catch (err) {
                      console.error("Failed to delete project:", err);
                    }
                  }
                }}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all duration-200 disabled:opacity-50"
                aria-label="Delete project"
                title="Delete Project"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-stroke-dark flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "No start date"}
                    {" - "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "No end date"}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0">
                  <span>View</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 p-12 text-center dark:border-stroke-dark dark:bg-dark-secondary/20">
          <Briefcase className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            No projects found
          </h3>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 max-w-xs">
            Get started by creating your first project directory.
          </p>
          <button
            onClick={() => setIsModalNewProjectOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
      />
    </div>
  );
}
