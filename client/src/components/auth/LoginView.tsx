import React, { useState } from "react";
import { LogIn, UserPlus, ShieldAlert, Users, Mail, User, Key, Check } from "lucide-react";
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCognitoAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { signUp } = await import("aws-amplify/auth");
        await signUp({
          username: email, // Cognito typically expects email as username if configured that way
          password,
          options: {
            userAttributes: {
              email,
              name: username,
            },
          },
        });
        alert("Sign up successful! Please check your email for the verification code. Then log in.");
        setIsSignUp(false);
      } else {
        const { signIn, getCurrentUser } = await import("aws-amplify/auth");
        await signIn({ username: email, password });
        const user = await getCurrentUser();
        // Trigger a page reload to let prepareHeaders fetch the real session token
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = (mockUsername: string, mockEmail: string, mockRole: string) => {
    setIsLoading(true);
    // Write mock token to localStorage
    const mockToken = `mock-token-${mockUsername}`;
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("authUser", JSON.stringify({ username: mockUsername, email: mockEmail, role: mockRole }));
    
    setTimeout(() => {
      onLoginSuccess(mockToken, { username: mockUsername, email: mockEmail, role: mockRole });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-dark-bg dark:to-dark-secondary">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-md dark:border-stroke-dark/40 dark:bg-dark-secondary/70 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Login Form */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isSignUp ? "Create your Account" : "Sign In to TaskFlow"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isSignUp ? "Start managing your team's project deliverables" : "Access your projects, tasks, and analytics dashboard"}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isCognitoConfigured ? (
            <form onSubmit={handleCognitoAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Username (Full Name)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alice Jones"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-450 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10.5 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-900/10">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5" />
                AWS Cognito Not Configured
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-550 mt-1.5 leading-relaxed">
                We detected that `NEXT_PUBLIC_COGNITO_USER_POOL_ID` is not defined in your frontend environment. Please use the **Local Demo Bypass** panel on the right to log in as a seeded developer.
              </p>
            </div>
          )}

          {isCognitoConfigured && (
            <div className="mt-6 text-center text-xs">
              <span className="text-gray-450 dark:text-gray-500">
                {isSignUp ? "Already have an account? " : "Need a new account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Demo Bypass Panel */}
        <div className="flex-1 bg-slate-900/5 dark:bg-black/10 border-t md:border-t-0 md:border-l border-gray-200 dark:border-stroke-dark/40 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <Users className="h-5 w-5 text-blue-500" />
              Local Demo Bypass
            </h3>
            <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
              Select one of the pre-seeded PostgreSQL users below to simulate role-based authorization:
            </p>
          </div>

          <div className="space-y-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.username}
                type="button"
                onClick={() => handleMockLogin(user.username, user.email, user.role)}
                disabled={isLoading}
                className="w-full text-left flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-stroke-dark dark:bg-dark-tertiary"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold dark:bg-blue-500/20 dark:text-blue-400">
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
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  user.role === "Project Leader" 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                )}>
                  {user.role}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-5 text-center leading-relaxed">
            * Simulates a verified login state. In this mode, standard members only see projects they are assigned to, and leaders see all.
          </p>
        </div>

      </div>
    </div>
  );
}
