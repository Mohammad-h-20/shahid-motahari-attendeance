"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  School,
  LogIn,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  BellRing,
  BookOpen,
} from "lucide-react";
import HeaderClock from "@/components/HeaderClock";
import ThemeToggle from "@/components/ThemeToggle";
import { toPersianDigits } from "@/lib/jalali";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalStudents: 15,
    totalClasses: 7,
    totalGrades: 3,
    attendanceRate: 98,
  });

  useEffect(() => {
    fetch("/api/attendance?overview=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalStudents !== undefined) {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Right side: School Title & Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                سامانه حضور و غیاب مدرسه شهید مطهری
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                دبیرستان دوره اول دخترانه هوشمند • سال تحصیلی ۱۴۰۴-۱۴۰۵
              </p>
            </div>
          </div>

          {/* Center: Live Clock */}
          <div className="hidden lg:block">
            <HeaderClock />
          </div>

          {/* Left side: Theme toggle and Login Button as explicitly requested */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود به سامانه حضور و غیاب</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Mobile Clock view */}
        <div className="lg:hidden mb-6 flex justify-center">
          <HeaderClock />
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-500/20 mb-12">
          {/* Background decorative patterns */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پیشرفته‌ترین سامانه هوشمند ثبت کلاسی</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight sm:leading-snug">
              سامانه جامع حضور و غیاب
              <br />
              <span className="text-emerald-400">دبیرستان دخترانه شهید مطهری</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              مدیریت یکپارچه پایه‌های هفتم، هشتم و نهم با امکان ثبت آنی غیبت، دقیقه‌شمار تاخیر، یادداشت‌های انضباطی، تقویم جلالی و ذخیره‌سازی ابری دائمی بر روی سرور.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
              >
                <span>ورود ناظمین و کادر مدرسه</span>
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {toPersianDigits(stats.totalStudents)}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">دانش‌آموز فعال</div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <School className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {toPersianDigits(stats.totalClasses)}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">کلاس‌های درسی دایر</div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {toPersianDigits(stats.totalGrades)}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">پایه‌های تحصیلی (۷، ۸، ۹)</div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {toPersianDigits(stats.attendanceRate)}٪
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">نرخ انضباط و حضور</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              محاسبه دقیق دقایق تاخیر
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              امکان ثبت میزان تاخیر به دقیقه همراه با ثبت علت تاخیر و درج در سوابق دائمی انضباطی دانش‌آموز.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              تقویم رسمی شمسی روزبه‌روز
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ثبت مستقل برای هر روز تحصیلی با امکان بازبینی سوابق ماه‌های گذشته و ثبت تغییرات مجدد در سرور.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-3">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              اطلاع‌رسانی پیامکی به اولیا
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ارسال پیامک با یک کلیک به شماره تلفن همراه ثبت‌شده والدین در صورت غیبت یا تاخیر غیرموجه.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
