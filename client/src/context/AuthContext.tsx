"use client";

import React, { createContext, useContext, useMemo } from "react";
import { AuthUser, isProjectManager } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isProjectManager: boolean;
  isDeveloper: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isProjectManager: false,
  isDeveloper: true,
});

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      user,
      isProjectManager: isProjectManager(user?.role),
      isDeveloper: !isProjectManager(user?.role),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
