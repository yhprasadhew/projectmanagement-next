export const ROLES = {
    PROJECT_MANAGER: "PROJECT_LEADER",
    DEVELOPER: "USER",
};
export function isProjectManager(role) {
    return (role === ROLES.PROJECT_MANAGER ||
        role === "Project Leader" ||
        role === "Project Manager");
}
export function isDeveloper(role) {
    return !isProjectManager(role);
}
//# sourceMappingURL=roles.js.map