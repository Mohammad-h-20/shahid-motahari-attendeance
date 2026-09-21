"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
  defaultClassId?: string;
  defaultGradeId?: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onStudentAdded,
  defaultClassId,
  defaultGradeId,
}: AddStudentModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState(defaultGradeId || "");
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || "");
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch grades and classes
      fetch("/api/grades")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setGrades(data);
            if (!selectedGradeId && data.length > 0) {
              setSelectedGradeId(defaultGradeId || data[0].id);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, defaultGradeId]);

  useEffect(() => {
    if (isOpen) {
      const url = selectedGradeId
        ? `/api/classes?gradeId=${selectedGradeId}`
        : "/api/classes";
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setClasses(data);
            if (!selectedClassId && data.length > 0) {
              setSelectedClassId(defaultClassId || data[0].id);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, selectedGradeId, defaultClassId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("لطفاً نام و نام خانوادگی را وارد نمایید.");
      return;
    }
    const finalClassId = selectedClassId || defaultClassId;
    if (!finalClassId) {
      setError("لطفاً کلاس را مشخص نمایید.");
      return;
    }
    if (!phone.trim()) {
      setError("شماره موبایل جهت اطلاع‌رسانی الزامی است.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          nationalId,
          studentNumber,
          classId: finalClassId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطا در ثبت دانش‌آموز");
      }

      setFirstName("");
      setLastName("");
      setPhone("");
      setNationalId("");
      setStudentNumber("");
      onStudentAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || "خطایی در ثبت اطلاعات رخ داد.");
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
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              افزودن دانش‌آموز جدید
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ثبت مشخصات و اختصاص به کلاس در مدرسه شهید مطهری
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
                placeholder="مثال: علی"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                نام خانوادگی <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: محمدی"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                پایه تحصیلی <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedGradeId}
                onChange={(e) => setSelectedGradeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                کلاس <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              شماره تلفن همراه (جهت پیامک غیبت/تاخیر به ولی) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="مثال: 09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                کد ملی دانش‌آموز (اختیاری)
              </label>
              <input
                type="text"
                placeholder="مثال: 0012345678"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                شماره پرونده / دانش‌آموزی
              </label>
              <input
                type="text"
                placeholder="مثال: 140301"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال افزودن...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ثبت دانش‌آموز</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
