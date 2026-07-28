"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Search, Settings, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/redux';
import { toggleDarkMode, setIsSidebarCollapsed } from '@/state';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState("Prasad");

  useEffect(() => {
    setIsMounted(true);

    const checkUser = async () => {
      const savedUser = localStorage.getItem("authUser");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.username) {
            setUsername(parsed.username);
            return;
          }
        } catch (e) {}
      }

      try {
        const { getCurrentUser, fetchUserAttributes } = await import("aws-amplify/auth");
        const cognitoUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUsername(attributes.name || cognitoUser.username);
      } catch (e) {
        // Fallback
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { signOut } = await import("aws-amplify/auth");
      await signOut();
    } catch (e) {}
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.reload();
  };

  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 dark:bg-dark-secondary dark:border-stroke-dark transition-colors duration-300">
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left Side: Menu Button & Search Bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(false))}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors"
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="relative hidden sm:block">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Side: Theme, Notifications, Settings, Profile & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          
          <button 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors relative" 
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          
          <button 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors" 
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <hr className="h-6 w-px bg-gray-200 dark:bg-stroke-dark mx-2" />

          {/* User profile */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white font-medium flex items-center justify-center text-sm shadow-sm">
              {firstLetter}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {username}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;