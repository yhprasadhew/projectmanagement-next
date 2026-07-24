import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateProjectMutation } from "@/state/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    try {
      await createProject({
        name: projectName,
        description: description || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      }).unwrap();

      // Reset form
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");

      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-dark-secondary border border-gray-100 dark:border-stroke-dark">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-stroke-dark">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-tertiary dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
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
              placeholder="Enter project description"
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg resize-none"
            />
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
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-stroke-dark dark:bg-dark-tertiary dark:text-gray-200 dark:focus:bg-dark-bg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 mt-6 dark:border-stroke-dark">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-stroke-dark dark:text-gray-300 dark:hover:bg-dark-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNewProject;
