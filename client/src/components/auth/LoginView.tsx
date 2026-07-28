"use client";

import React, { useState } from "react";
import { LogIn, ShieldAlert, Users, Mail, Key, Sparkles, HelpCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock users list matching seed data
const MOCK_USERS = [
  { username: "BobSmith", role: "Project Leader", email: "bobsmith@example.com", avatar: "B" },
  { username: "AliceJones", role: "Developer", email: "alicejones@example.com", avatar: "A" },
  { username: "CarolWhite", role: "Developer", email: "carolwhite@example.com", avatar: "C" },
];

type Props = {
  onLoginSuccess: (token: string, user: { username: string; email: string; role: string }) => void;
  isCognitoConfigured: boolean;
};

export default function LoginView({ onLoginSuccess, isCognitoConfigured }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCognitoAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { signIn, getCurrentUser } = await import("aws-amplify/auth");
      await signIn({ username: email, password });
      const user = await getCurrentUser();
      // Trigger a page reload to let prepareHeaders fetch the real session token
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Find user in MOCK_USERS matching email or username (case-insensitive)
    const normalizedInput = email.toLowerCase().trim();
    const matchedUser = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === normalizedInput ||
        u.username.toLowerCase() === normalizedInput
    );

    if (matchedUser) {
      // Simulate real auth validation delay
      setTimeout(() => {
        const mockToken = `mock-token-${matchedUser.username}`;
        localStorage.setItem("authToken", mockToken);
        localStorage.setItem("authUser", JSON.stringify({ 
          username: matchedUser.username, 
          email: matchedUser.email, 
          role: matchedUser.role 
        }));

        onLoginSuccess(mockToken, { 
          username: matchedUser.username, 
          email: matchedUser.email, 
          role: matchedUser.role 
        });
        setIsLoading(false);
      }, 800);
    } else {
      setTimeout(() => {
        setError("Invalid username or email. Please check the seed database accounts on the right.");
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-dark-bg dark:to-dark-secondary">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-md dark:border-stroke-dark/40 dark:bg-dark-secondary/70 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Login Form */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sign In to TaskFlow
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Access your company's projects, assigned tasks, and workflow dashboards
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-955/20 dark:text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isCognitoConfigured ? handleCognitoAuth : handleLocalLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-550 dark:text-gray-400 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. AliceJones or alicejones@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-550 dark:text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {!isCognitoConfigured && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 dark:border-blue-900/20 dark:bg-blue-950/10">
              <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed font-medium flex gap-1 items-start">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" />
                <span>Running in Local Mode. Enter any password and choose one of the pre-seeded credentials listed on the right panel to authenticate.</span>
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Information / Help Panel */}
        <div className="flex-1 bg-slate-900/5 dark:bg-black/10 border-t md:border-t-0 md:border-l border-gray-250/70 dark:border-stroke-dark/40 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Seeded Company Accounts
            </h3>
            <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 leading-relaxed">
              Use these pre-configured database profiles to test role-based access control inside the company:
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_USERS.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white dark:border-stroke-dark dark:bg-dark-tertiary select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold dark:bg-blue-500/20 dark:text-blue-450">
                    {user.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                      {user.username}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                  user.role === "Project Leader" 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
                )}>
                  {user.role === "Project Leader" ? "Project Mgr" : "Developer"}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-6 text-center leading-relaxed">
            * Developer accounts automatically redirect to their workspace. Project Managers have full dashboard and Kanban board access.
          </p>
        </div>

      </div>
    </div>
  );
}
