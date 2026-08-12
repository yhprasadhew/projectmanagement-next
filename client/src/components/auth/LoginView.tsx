"use client";

import React, { useState } from "react";
import { LogIn, ShieldAlert, Mail, Key, Sparkles, ArrowLeft, KeyRound, Briefcase, User, CheckCircle2 } from "lucide-react";
import axios from "axios";

type Props = {
  onLoginSuccess: (token: string, user: { id: number; username: string; email: string; role: string }) => void;
  isCognitoConfigured: boolean;
};

export default function LoginView({ onLoginSuccess }: Props) {
  const [viewMode, setViewMode] = useState<"login" | "setPassword">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          usernameOrEmail: email,
          password: password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      onLoginSuccess(token, user);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (username: string) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          usernameOrEmail: username,
          password: "password123",
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      onLoginSuccess(token, user);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          `Failed to sign in automatically as ${username}.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/set-password`,
        {
          email: email,
          password: password,
        }
      );
      setSuccessMessage(response.data.message || "Password set successfully!");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setViewMode("login");
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to set password. Please make sure your email is invited by a manager first."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setViewMode((prev) => (prev === "login" ? "setPassword" : "login"));
    setError("");
    setSuccessMessage("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* Left Panel: Hero Showcase (Hidden on Mobile) */}
      <div className="relative hidden w-3/5 items-center justify-center overflow-hidden bg-slate-900 lg:flex">
        
        {/* Radial mesh background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.indigo.900),transparent_50%),radial-gradient(circle_at_bottom_left,theme(colors.blue.950),transparent_50%)]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative z-10 max-w-lg px-8 text-center text-white">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 backdrop-blur-sm border border-indigo-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            TaskFlow Workspace
          </h1>
          <p className="mt-4 text-base text-slate-350 font-light">
            Streamline tasks, measure workloads, and align milestones with developer boards.
          </p>

          {/* Floating UI Mockup widget */}
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-left shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-rose-400 uppercase border border-rose-500/20">
                Priority: Urgent
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ID-204</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-150">Migrate Neon Serverless database and test schemas</h4>
            <p className="mt-2 text-xs text-slate-400 font-light">
              Successfully migrated local schema definitions to the production serverless Neon database.
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  BS
                </div>
                <span className="text-xs text-slate-400">Assigned: BobSmith</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form Card */}
      <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-2/5 dark:bg-slate-950">
        <div className="w-full max-w-md">
          
          {/* Logo / Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">TaskFlow</span>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {viewMode === "login" ? "Sign in to account" : "Set Your Password"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {viewMode === "login" 
                ? "Enter your credentials or try a quick demo sign-in below."
                : "Invited members can configure their access credentials."
              }
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50/75 p-3.5 text-xs font-medium text-rose-800 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/30">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-450" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50/75 p-3.5 text-xs font-medium text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-950/30">
              <Sparkles className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {viewMode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 shadow-md hover:shadow-indigo-500/10 active:scale-[0.98]"
              >
                <LogIn className="h-4.5 w-4.5" />
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Toggle to invite view */}
              <div className="text-center mt-5">
                <button
                  type="button"
                  onClick={toggleView}
                  className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline"
                >
                  Set your account password with email
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-3 text-slate-500 dark:bg-slate-950 dark:text-slate-550">
                    Quick demo login
                  </span>
                </div>
              </div>

              {/* Demo Account Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoLogin("BobSmith")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/50 transition-all text-center group disabled:opacity-50 active:scale-95"
                >
                  <Briefcase className="h-5 w-5 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Bob Smith</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500">Project Leader</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoLogin("AliceJones")}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/50 transition-all text-center group disabled:opacity-50 active:scale-95"
                >
                  <User className="h-5 w-5 text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Alice Jones</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500">Developer</span>
                </button>
              </div>

            </form>
          ) : (
            /* Set Password Form */
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10.5 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 shadow-md hover:shadow-indigo-500/10 active:scale-[0.98]"
              >
                <LogIn className="h-4.5 w-4.5" />
                {isLoading ? "Setting Password..." : "Set Password"}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={toggleView}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
          
        </div>
      </div>

    </div>
  );
}
