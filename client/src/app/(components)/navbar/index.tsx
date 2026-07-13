"use client";

import React, { useEffect, useState } from 'react';
import { Menu, Search, Settings, Bell, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux';
import { toggleDarkMode, setIsSidebarCollapsed } from '@/state';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 dark:bg-dark-secondary dark:border-stroke-dark transition-colors duration-300">
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left Side: Menu Button & Search Bar */}
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors"
            onClick={() => dispatch(setIsSidebarCollapsed(false))}
            aria-label="Open Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Search..."
              className="w-40 sm:w-64 rounded-lg bg-gray-100 dark:bg-dark-tertiary py-1.5 pl-9 pr-4 text-sm outline-none transition-all duration-200 focus:w-48 sm:focus:w-80 focus:bg-white dark:focus:bg-dark-bg focus:ring-1 focus:ring-blue-500 border border-gray-200 dark:border-stroke-dark focus:border-blue-500 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Side: Action Icons & Profile */}
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-tertiary transition-colors" 
            onClick={() => dispatch(toggleDarkMode())}
            aria-label="Toggle Dark Mode"
          >
            {isMounted && isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-300" />
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
              P
            </div>
            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Prasad
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;