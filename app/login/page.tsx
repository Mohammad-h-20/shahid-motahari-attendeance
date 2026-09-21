"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { School, LogIn, KeyRound, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import HeaderClock from "@/components/HeaderClock";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد نمایید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "خطا در ورود به سامانه");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "نام کاربری یا کلمه عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-tr from-slate-100 via-emerald-50/20 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      {/* Top back button, clock & theme toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
        <div className="flex items-center gap-2">
          <HeaderClock />
          <ThemeToggle />
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            ورود به سامانه حضور و غیاب
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            دبیرستان شهید مطهری • پنل ناظمین و مدیریت
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              نام کاربری
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال بررسی اطلاعات...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>ورود به داشبورد</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
