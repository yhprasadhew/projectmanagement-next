"use client";

import React from "react";
import { Loader2, Table2 } from "lucide-react";
import { useGetTasksQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { normalizeStatus } from "@/lib/taskStatus";
import { cn } from "@/lib/utils";

type Props = {
  projectId: number;
};

const TableView = ({ projectId }: Props) => {
  const { data: tasks, isLoading, isError } = useGetTasksQuery({ projectId });
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "title", headerName: "Title", width: 200 },
    {
      field: "description",
      headerName: "Description",
      width: 250,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = params.value as string;
        const normalized = normalizeStatus(status);
        const colors: Record<string, string> = {
          Todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          "Working Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          "Under Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
        return (
          <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", colors[normalized] || "bg-gray-100 text-gray-800")}>
            {status}
          </span>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 110,
      renderCell: (params) => {
        const priority = params.value as string;
        const colors: Record<string, string> = {
          Urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          Low: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
        };
        return (
          <span className={cn("px-2 py-0.5 text-xs font-semibold rounded", colors[priority] || "bg-gray-100 text-gray-800")}>
            {priority}
          </span>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 130,
      valueFormatter: (value) => value ? new Date(value as string).toLocaleDateString() : "",
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
      valueFormatter: (value) => value ? new Date(value as string).toLocaleDateString() : "",
    },
    {
      field: "author",
      headerName: "Author",
      width: 130,
      valueGetter: (value, row) => row.author?.username || "Unknown",
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 130,
      valueGetter: (value, row) => row.assignee?.username || "Unassigned",
    },
  ];

  const dataGridSx = {
    border: "none",
    backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    "& .MuiDataGrid-cell": {
      borderBottom: isDarkMode ? "1px solid #1f2937" : "1px solid #f3f4f6",
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
      color: isDarkMode ? "#f3f4f6" : "#1f2937",
      borderBottom: isDarkMode ? "2px solid #374151" : "2px solid #e5e7eb",
    },
    "& .MuiDataGrid-columnHeader": {
      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: "bold",
      color: isDarkMode ? "#f3f4f6" : "#1f2937",
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
      borderTop: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiTablePagination-root": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiTablePagination-selectIcon": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiTablePagination-actions": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiDataGrid-menuIcon": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiDataGrid-sortIcon": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiDataGrid-iconButtonContainer": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
    "& .MuiButton-root": {
      color: isDarkMode ? "#60a5fa" : "#2563eb",
    },
    "& .MuiInputBase-input": {
      color: isDarkMode ? "#e5e7eb" : "#1f2937",
    },
  };

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
          Failed to load tasks. Please verify that the API server is running.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Table2 className="h-5 w-5 text-gray-400" />
          Task Spreadsheet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Detailed grid listing of all tasks. Sort, filter, and export tasks.
        </p>
      </div>

      <div className="h-[540px] w-full">
        <DataGrid
          rows={tasks || []}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          sx={dataGridSx}
          loading={isLoading}
          getRowId={(row) => row.id}
          className="dark:border-stroke-dark"
        />
      </div>
    </div>
  );
};

export default TableView;
