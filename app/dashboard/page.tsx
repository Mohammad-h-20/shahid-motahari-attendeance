"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  School,
  PlusCircle,
  UserPlus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { toPersianDigits, formatJalaliFull } from "@/lib/jalali";
import AddClassModal from "@/components/AddClassModal";
import AddStudentModal from "@/components/AddStudentModal";

export default function DashboardPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalGrades: 3,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    attendanceRate: 100,
    today: "",
  });
  const [loading, setLoading] = useState(true);
  const [addClassGradeId, setAddClassGradeId] = useState<string | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gradesRes, statsRes] = await Promise.all([
        fetch("/api/grades"),
        fetch("/api/attendance?overview=true"),
      ]);

      const gradesData = await gradesRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(gradesData)) setGrades(gradesData);
      if (statsData.totalStudents !== undefined) setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleEvent = () => loadData();
    window.addEventListener("class_or_student_added", handleEvent);
    return () => window.removeEventListener("class_or_student_added", handleEvent);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>سامانه فعال و متصل به پایگاه داده سرور</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">
              پنل مدیریت حضور و غیاب مدرسه شهید مطهری
            </h1>
            <p className="text-xs sm:text-sm text-slate-200">
              برای آغاز فرآیند حضور و غیاب، پایه تحصیلی مورد نظر خود (هفتم، هشتم یا نهم) را انتخاب نمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAddStudentOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-800 font-bold text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>افزودن دانش‌آموز</span>
            </button>
            <button
              onClick={() => setAddClassGradeId(grades[0]?.id || "default")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>افزودن کلاس</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              کل دانش‌آموزان ثبت‌شده
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(stats.totalStudents)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            در تمام پایه‌ها و کلاس‌ها
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              کلاس‌های فعال
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {toPersianDigits(stats.totalClasses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            کلاس‌های تعریف شده در سامانه
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              حاضرین امروز
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {toPersianDigits(stats.presentCount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            نرخ حضور: {toPersianDigits(stats.attendanceRate)}٪
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              غایبین یا تاخیر امروز
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {toPersianDigits(stats.absentCount + stats.lateCount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {toPersianDigits(stats.absentCount)} غایب • {toPersianDigits(stats.lateCount)} تاخیر
          </div>
        </div>
      </div>

      {/* Grade Cards Section as explicitly requested */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              پایه‌های تحصیلی دبیرستان شهید مطهری
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              برای مشاهده کلاس‌ها و ثبت دفتر حضور و غیاب هر پایه کلیک کنید:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {grades.map((grade) => {
            const isGrade7 = grade.code === "grade-7";
            const isGrade8 = grade.code === "grade-8";
            const isGrade9 = grade.code === "grade-9";

            const gradientClass = isGrade7
              ? "from-emerald-500 to-teal-600"
              : isGrade8
              ? "from-blue-500 to-indigo-600"
              : "from-purple-500 to-violet-600";

            const borderHoverClass = isGrade7
              ? "hover:border-emerald-400"
              : isGrade8
              ? "hover:border-blue-400"
              : "hover:border-purple-400";

            return (
              <div
                key={grade.id}
                className={`relative group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${borderHoverClass}`}
              >
                <div>
                  {/* Card top badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${gradientClass} text-white flex items-center justify-center shadow-md`}
                    >
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      دوره اول متوسطه
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {grade.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    شامل کلاس‌های رسمی و ثبت سوابق روزانه دانش‌آموزان
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs">
                    <div>
                      <div className="text-slate-400">تعداد کلاس‌ها</div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {toPersianDigits(grade.classCount)} کلاس
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">تعداد دانش‌آموز</div>
                      <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {toPersianDigits(grade.studentCount)} نفر
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/dashboard/grade/${grade.code}`}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r ${gradientClass} text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all`}
                  >
                    <span>ورود به کلاس‌های {grade.name}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setAddClassGradeId(grade.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>افزودن کلاس به {grade.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Modals for this page */}
      <AddClassModal
        isOpen={!!addClassGradeId}
        onClose={() => setAddClassGradeId(null)}
        onClassAdded={loadData}
        defaultGradeId={addClassGradeId || undefined}
        grades={grades}
      />

      <AddStudentModal
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onStudentAdded={loadData}
      />
    </div>
  );
}
