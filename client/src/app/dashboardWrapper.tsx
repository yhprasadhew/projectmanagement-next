"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import StoreProvider, { useAppSelector } from "./redux";
import LoginView from "@/components/auth/LoginView";

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("authUser");
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Verify token validity against the backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            localStorage.setItem("authUser", JSON.stringify(userData));
          } else if (response.status === 401 || response.status === 403) {
            // Invalid or expired token
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (e) {
          console.error("Auth check failed:", e);
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const sidebarCollapsed = isMounted ? isSidebarCollapsed : false;

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <LoginView
        isCognitoConfigured={false}
        onLoginSuccess={(token, userDetails) => {
          setUser(userDetails);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-gray-600 dark:bg-dark-bg dark:text-gray-200">
      <Sidebar />
      <main
        className={`flex w-full flex-col bg-slate-50 dark:bg-dark-bg transition-all duration-300 ${
          sidebarCollapsed ? "" : "md:pl-64"
        }`}
      >
        <Navbar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

//redux
const DashboardWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider> //redux
  );
};

export default DashboardWrapper;