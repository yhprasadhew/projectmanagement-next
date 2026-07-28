export const ROLES = {
  PROJECT_MANAGER: "PROJECT_LEADER",
  DEVELOPER: "USER",
} as const;

export function isProjectManager(role?: string): boolean {
  return (
    role === ROLES.PROJECT_MANAGER ||
    role === "Project Leader" ||
    role === "Project Manager"
  );
}

export function isDeveloper(role?: string): boolean {
  return !isProjectManager(role);
}
