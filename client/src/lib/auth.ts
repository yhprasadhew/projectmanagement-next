export type AuthUser = {
  id: number;
  userId?: number;
  username: string;
  email: string;
  role: string;
  position?: string;
};

export function isProjectManager(role?: string): boolean {
  return (
    role === "PROJECT_LEADER" ||
    role === "Project Leader" ||
    role === "Project Manager"
  );
}

export function roleLabel(role?: string): string {
  return isProjectManager(role) ? "Project Manager" : "Developer";
}

export function readStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id ?? parsed.userId,
      userId: parsed.userId ?? parsed.id,
      username: parsed.username,
      email: parsed.email,
      role: parsed.role,
      position: parsed.position,
    };
  } catch {
    return null;
  }
}

export function persistAuthUser(user: AuthUser): void {
  localStorage.setItem(
    "authUser",
    JSON.stringify({
      ...user,
      userId: user.id ?? user.userId,
    })
  );
}

export function clearAuthStorage(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}
