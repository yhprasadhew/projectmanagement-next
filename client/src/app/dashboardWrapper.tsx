"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import StoreProvider, { useAppSelector } from "./redux";
import LoginView from "@/components/auth/LoginView";
import { Amplify } from "aws-amplify";

// Configure AWS Amplify Cognito dynamically
const isCognitoConfigured = !!(
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID &&
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
);

if (isCognitoConfigured) {
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
          userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        },
      },
    });
  } catch (error) {
    console.error("Amplify configuration failed:", error);
  }
}

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
      if (isCognitoConfigured) {
        try {
          const { getCurrentUser, fetchUserAttributes } = await import("aws-amplify/auth");
          const cognitoUser = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          setUser({
            username: attributes.name || cognitoUser.username,
            email: attributes.email || "",
            role: "USER", // Default role
          });
          setIsAuthenticated(true);
          return;
        } catch (e) {
          // Not logged in via Cognito
        }
      }

      // Local storage fallback for mock authentication
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("authUser");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
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
        isCognitoConfigured={isCognitoConfigured}
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