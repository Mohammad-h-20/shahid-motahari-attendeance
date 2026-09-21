"use client";

import React, { useState } from "react";
import { X, Calendar as CalendarIcon, Check, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianDigits, getTodayJalaliString, shiftJalaliDate } from "@/lib/jalali";

interface JalaliPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند"
];

export default function JalaliPickerModal({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}: JalaliPickerModalProps) {
  if (!isOpen) return null;

  const [initialY, initialM, initialD] = currentDate.split("-").map(Number);
  const [selectedYear, setSelectedYear] = useState(initialY || 1405);
  const [selectedMonth, setSelectedMonth] = useState(initialM || 6);
  const [selectedDay, setSelectedDay] = useState(initialD || 17);

  // Number of days in chosen Jalali month
  const getDaysInMonth = (y: number, m: number) => {
    if (m <= 6) return 31;
    if (m <= 11) return 30;
    const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(y % 33);
    return isLeap ? 30 : 29;
  };

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);

  const handleConfirm = (y: number, m: number, d: number) => {
    const yStr = y.toString();
    const mStr = m.toString().padStart(2, "0");
    const dStr = d.toString().padStart(2, "0");
    onSelectDate(`${yStr}-${mStr}-${dStr}`);
    onClose();
  };

  // Quick shortcuts
  const todayStr = getTodayJalaliString();
  const oneMonthAgo = shiftJalaliDate(todayStr, -30);
  const twoMonthsAgo = shiftJalaliDate(todayStr, -60);
  const threeMonthsAgo = shiftJalaliDate(todayStr, -90);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative transition-all"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              انتخاب سریع تاریخ حضور و غیاب
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              دسترسی به تمام روزها، ماه‌ها و سال‌های گذشته بدون نیاز به ورق زدن دستی
            </p>
          </div>
        </div>

        {/* Quick Jump Shortcuts */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 mb-2">پرش سریع به:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => {
                onSelectDate(todayStr);
                onClose();
              }}
              className="py-2 px-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
            >
              امروز
            </button>
            <button
              onClick={() => {
                onSelectDate(oneMonthAgo);
                onClose();
              }}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
            >
              ۱ ماه پیش
            </button>
            <button
              onClick={() => {
                onSelectDate(twoMonthsAgo);
                onClose();
              }}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
            >
              ۲ ماه پیش
            </button>
            <button
              onClick={() => {
                onSelectDate(threeMonthsAgo);
                onClose();
              }}
              className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm transition-colors"
            >
              ۳ ماه پیش
            </button>
          </div>
        </div>

        {/* Year and Month Pickers */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              انتخاب سال شمسی:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {[1403, 1404, 1405, 1406, 1407].map((y) => (
                <option key={y} value={y}>
                  سال {toPersianDigits(y)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              انتخاب ماه:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name} (ماه {toPersianDigits(idx + 1)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Days Grid */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
            انتخاب روز ماه ({MONTH_NAMES[selectedMonth - 1]}):
          </label>
          <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => {
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40 scale-105"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600"
                  }`}
                >
                  {toPersianDigits(d)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            انتخاب شده:{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              {toPersianDigits(selectedDay)} {MONTH_NAMES[selectedMonth - 1]} {toPersianDigits(selectedYear)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => handleConfirm(selectedYear, selectedMonth, selectedDay)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>مشاهده و ثبت این تاریخ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
