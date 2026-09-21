"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Loader2, Edit3 } from "lucide-react";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
  student: {
    studentId: string;
    firstName: string;
    lastName: string;
    phone: string;
    nationalId?: string;
    studentNumber?: string;
  } | null;
}

export default function EditStudentModal({
  isOpen,
  onClose,
  onStudentUpdated,
  student,
}: EditStudentModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName || "");
      setLastName(student.lastName || "");
      setPhone(student.phone || "");
      setNationalId(student.nationalId || "");
      setStudentNumber(student.studentNumber || "");
      setError("");
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("لطفاً نام و نام خانوادگی را وارد نمایید.");
      return;
    }
    if (!phone.trim()) {
      setError("شماره موبایل الزامی است.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: student.studentId,
          firstName,
          lastName,
          phone,
          nationalId,
          studentNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "خطا در ویرایش اطلاعات");
      }

      onStudentUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              ویرایش اطلاعات دانش‌آموز
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              اصلاح نام، نام خانوادگی، شماره تماس یا کد ملی
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                نام <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                نام خانوادگی <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              شماره تلفن همراه (پیامک به ولی) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-left font-mono"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                کد ملی
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-left font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                شماره دانش‌آموزی
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-left font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>ذخیره تغییرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
