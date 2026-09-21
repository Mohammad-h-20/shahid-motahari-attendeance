"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Search,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  School,
  ArrowRight,
} from "lucide-react";
import { toPersianDigits } from "@/lib/jalali";

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance?report=true")
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setData(items);
          setFilteredData(items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...data];

    if (selectedGrade !== "ALL") {
      result = result.filter((item) => item.gradeName?.includes(selectedGrade));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(q) ||
          item.className?.toLowerCase().includes(q) ||
          item.phone?.includes(q) ||
          item.nationalId?.includes(q)
      );
    }

    setFilteredData(result);
  }, [search, selectedGrade, data]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "ردیف",
      "نام و نام خانوادگی",
      "پایه",
      "کلاس",
      "شماره تماس",
      "تعداد حاضر",
      "تعداد غیبت",
      "تعداد تاخیر",
      "مجموع دقایق تاخیر",
    ];

    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.fullName,
      item.gradeName,
      item.className,
      item.phone,
      item.presentCount,
      item.absentCount,
      item.lateCount,
      item.totalDelayMinutes,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `گزارش_حضور_غیاب_مدرسه_شهید_مطهری.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top absentees alert
  const topAbsentees = [...data]
    .filter((s) => s.absentCount > 0)
    .sort((a, b) => b.absentCount - a.absentCount)
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
              پیشخوان
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              دفتر آمار و گزارش‌های انضباطی
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            <span>گزارش جامع سوابق حضور و غیاب مدرسه شهید مطهری</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            بررسی پرونده انضباطی دانش‌آموزان تمام پایه‌ها و کلاس‌ها در طول سال تحصیلی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>پیشخوان</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ گزارش</span>
          </button>
        </div>
      </div>

      {/* Warning Box for Top Absentees */}
      {topAbsentees.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                هشدارهای انضباطی سامانه
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                دانش‌آموزان با بیشترین غیبت غیرموجه نیازمند پیگیری تلفنی با اولیا هستند.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {topAbsentees.map((s, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 font-bold"
              >
                {s.fullName} ({s.className}) : {toPersianDigits(s.absentCount)} غیبت
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام، کلاس، کد ملی یا شماره همراه..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Grade filter tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> فیلتر پایه:
          </span>
          {["ALL", "هفتم", "هشتم", "نهم"].map((gradeTab) => (
            <button
              key={gradeTab}
              onClick={() => setSelectedGrade(gradeTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedGrade === gradeTab
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/40"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {gradeTab === "ALL" ? "تمام پایه‌ها" : `پایه ${gradeTab}`}
            </button>
          ))}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                <th className="py-3.5 px-4 font-bold text-center w-12">ردیف</th>
                <th className="py-3.5 px-4 font-bold">نام و نام خانوادگی</th>
                <th className="py-3.5 px-4 font-bold">پایه تحصیلی</th>
                <th className="py-3.5 px-4 font-bold">کلاس</th>
                <th className="py-3.5 px-4 font-bold">شماره تماس ولی</th>
                <th className="py-3.5 px-4 font-bold text-center">روزهای حضور</th>
                <th className="py-3.5 px-4 font-bold text-center">غیبت‌ها</th>
                <th className="py-3.5 px-4 font-bold text-center">موارد تاخیر</th>
                <th className="py-3.5 px-4 font-bold text-center">مجموع تاخیر (دقیقه)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredData.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {toPersianDigits(idx + 1)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {s.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.gradeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {s.className}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500" dir="ltr">
                      {s.phone}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {toPersianDigits(s.presentCount)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                      {toPersianDigits(s.absentCount)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                      {toPersianDigits(s.lateCount)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {toPersianDigits(s.totalDelayMinutes)} دقیقه
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
