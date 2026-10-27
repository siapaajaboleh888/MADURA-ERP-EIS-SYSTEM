"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@madura-erp.local");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.message);
    }
  };

  const setRoleUser = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold text-2xl mb-3 shadow-lg shadow-amber-500/20">
            M
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Madura ERP / EIS</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Information System — Madura Salt MSME
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="name@madura-erp.local"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm shadow transition duration-150 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Enterprise"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Switch Demo Role:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => setRoleUser("admin@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              👑 ADMIN
            </button>
            <button
              onClick={() => setRoleUser("manager@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              👔 MANAGER
            </button>
            <button
              onClick={() => setRoleUser("sales@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              💼 SALES
            </button>
            <button
              onClick={() => setRoleUser("warehouse@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              📦 WAREHOUSE
            </button>
            <button
              onClick={() => setRoleUser("production@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              ⚙️ PRODUCTION
            </button>
            <button
              onClick={() => setRoleUser("finance@madura-erp.local")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
            >
              💰 FINANCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
