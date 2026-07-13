"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./(components)/sidebar";
import Navbar from "./(components)/navbar";
import StoreProvider, { useAppSelector } from "./redux";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const sidebarCollapsed = isMounted ? isSidebarCollapsed : false;

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