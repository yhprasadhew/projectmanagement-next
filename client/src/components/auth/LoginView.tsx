"use client";

import React, { useState } from "react";
import { LogIn, ShieldAlert, Mail, Key, Sparkles, ArrowLeft, KeyRound } from "lucide-react";
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
      // Reset fields
      setPassword("");
      setConfirmPassword("");
      // Transition back to login view after delay
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-dark-bg dark:to-dark-secondary">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-md dark:border-stroke-dark/40 dark:bg-dark-secondary/80">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 mb-4 dark:bg-blue-500/20 dark:text-blue-400">
            {viewMode === "login" ? <Sparkles className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {viewMode === "login" ? "Welcome to TaskFlow" : "Set Your Password"}
          </h2>
          <p className="mt-1.5 text-xs text-gray-550 dark:text-gray-400">
            {viewMode === "login" 
              ? "Sign in to manage your projects and team workload"
              : "Invited members can set their login password below"
            }
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-955/20 dark:text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-green-50 p-4 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <Sparkles className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {viewMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-550 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. BobSmith"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-550 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
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
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-md"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleView}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Received an invitation email? Set your password
              </button>
            </div>
          </form>
        ) : (
          /* Set Password Form */
          <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-550 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-550 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-550" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-550 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-250/70 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-md"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Setting Password..." : "Set Password"}
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleView}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-505 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
