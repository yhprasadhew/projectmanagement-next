export const TASK_COLUMNS = [
  {
    id: "Todo",
    label: "To Do",
    accent: "border-t-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "Working Progress",
    label: "Working Progress",
    accent: "border-t-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    id: "Under Review",
    label: "Under Review",
    accent: "border-t-purple-500",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "Completed",
    label: "Completed",
    accent: "border-t-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
] as const;

export type TaskStatus = (typeof TASK_COLUMNS)[number]["id"];

const STATUS_ALIASES: Record<string, TaskStatus> = {
  todo: "Todo",
  "to do": "Todo",
  "to-do": "Todo",
  "working progress": "Working Progress",
  "work in progress": "Working Progress",
  "in progress": "Working Progress",
  "under review": "Under Review",
  "under-review": "Under Review",
  completed: "Completed",
  done: "Completed",
};

export function normalizeStatus(status?: string | null): TaskStatus {
  if (!status) return "Todo";

  const normalized = STATUS_ALIASES[status.trim().toLowerCase()];
  if (normalized) return normalized;

  const match = TASK_COLUMNS.find(
    (column) => column.id.toLowerCase() === status.trim().toLowerCase()
  );

  return match?.id ?? "Todo";
}
