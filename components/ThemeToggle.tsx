"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-2xl border transition-all duration-300 flex items-center justify-center ${
        isDark
          ? "bg-slate-800 border-slate-700 text-amber-300 shadow-md shadow-amber-400/10 hover:bg-slate-700"
          : "bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900"
      } ${className}`}
      title={isDark ? "تغییر به تم روشن" : "تغییر به حالت شب (دارک مود)"}
      aria-label="تغییر تم"
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
