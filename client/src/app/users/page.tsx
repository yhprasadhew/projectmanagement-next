"use client";

import React from "react";
import { User as UserIcon, Mail, Shield, CheckCircle } from "lucide-react";

// Mock users data matching the seeded users database schema
const mockUsers = [
  { id: 1, username: "AliceJones", email: "alice.jones@example.com", role: "Product Owner", status: "Active" },
  { id: 2, username: "BobSmith", email: "bob.smith@example.com", role: "Project Manager", status: "Active" },
  { id: 3, username: "CarolWhite", email: "carol.white@example.com", role: "Developer", status: "Active" },
  { id: 4, username: "DaveBrown", email: "dave.brown@example.com", role: "Developer", status: "Inactive" },
  { id: 5, username: "EveClark", email: "eve.clark@example.com", role: "Designer", status: "Active" },
  { id: 6, username: "FrankWright", email: "frank.wright@example.com", role: "QA Engineer", status: "Active" },
];

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage team members, roles, and permissions across your projects.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary"
          >
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-dark-tertiary dark:text-gray-300">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="h-3 w-3" />
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-stroke-dark">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  user.status === "Active"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-dark-tertiary dark:text-gray-400"
                }`}
              >
                <CheckCircle className="h-2.5 w-2.5" />
                {user.status}
              </span>
              <button className="text-xs font-semibold text-gray-900 hover:underline dark:text-white">
                Edit Member
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
