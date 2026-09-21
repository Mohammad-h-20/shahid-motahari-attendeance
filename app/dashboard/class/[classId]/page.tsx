"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  School,
  ArrowRight,
  UserPlus,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  Printer,
  MessageSquare,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Loader2,
  Trash2,
  Phone,
  Edit3,
} from "lucide-react";
import {
  toPersianDigits,
  getTodayJalaliString,
  formatJalaliFull,
  shiftJalaliDate,
} from "@/lib/jalali";
import AddStudentModal from "@/components/AddStudentModal";
import SMSModal from "@/components/SMSModal";
import JalaliPickerModal from "@/components/JalaliPickerModal";
import EditStudentModal from "@/components/EditStudentModal";

interface StudentAttendance {
  studentId: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  studentNumber?: string;
  phone: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  delayMinutes: number;
  notes: string;
  isRecorded: boolean;
}

export default function ClassAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [currentDate, setCurrentDate] = useState(getTodayJalaliString());
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAttendance | null>(null);

  // Fetch attendance data for the chosen date
  const loadAttendance = async (dateToLoad: string) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/attendance?classId=${classId}&date=${dateToLoad}`);
      const data = await res.json();

      if (res.ok) {
        setClassInfo(data.classInfo);
        setStudents(data.students || []);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadAttendance(currentDate);
    }
  }, [classId, currentDate]);

  // Handle status toggle
  const handleStatusChange = (
    studentId: string,
    newStatus: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return {
            ...s,
            status: newStatus,
            // If switched to PRESENT, reset delay if 0
            delayMinutes: newStatus === "LATE" ? (s.delayMinutes || 10) : 0,
          };
        }
        return s;
      })
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Handle delay minutes change
  const handleDelayChange = (studentId: string, minutes: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return { ...s, delayMinutes: Math.max(0, minutes) };
        }
        return s;
      })
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Handle notes change
  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          return { ...s, notes };
        }
        return s;
      })
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Mark all as present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: "PRESENT",
        delayMinutes: 0,
      }))
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Save to server
  const handleSaveToServer = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          date: currentDate,
          records: students.map((s) => ({
            studentId: s.studentId,
            status: s.status,
            delayMinutes: s.delayMinutes,
            notes: s.notes,
          })),
        }),
      });

      if (res.ok) {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
    } finally {
      setSaving(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("آیا از حذف این دانش‌آموز از کلاس اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/students?id=${studentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Date shifting
  const handlePrevDay = () => {
    setCurrentDate((prev) => shiftJalaliDate(prev, -1));
  };
  const handleNextDay = () => {
    setCurrentDate((prev) => shiftJalaliDate(prev, 1));
  };
  const handleGoToday = () => {
    setCurrentDate(getTodayJalaliString());
  };

  // Print attendance sheet
  const handlePrint = () => {
    window.print();
  };

  // Summary counts
  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;
  const lateCount = students.filter((s) => s.status === "LATE").length;
  const excusedCount = students.filter((s) => s.status === "EXCUSED").length;

  const studentsWithIssues = students.filter(
    (s) => s.status === "ABSENT" || s.status === "LATE"
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
              پیشخوان
            </Link>
            <span>/</span>
            {classInfo?.grade && (
              <>
                <Link
                  href={`/dashboard/grade/${classInfo.grade.code}`}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {classInfo.grade.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {classInfo ? classInfo.name : "کلاس"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <School className="w-7 h-7 text-emerald-600" />
            <span>دفتر حضور و غیاب {classInfo?.name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            {classInfo?.teacher && <span>دبیر/ناظم: <strong>{classInfo.teacher}</strong></span>}
            {classInfo?.room && <span>• اتاق: <strong>{toPersianDigits(classInfo.room)}</strong></span>}
            <span>• تعداد کل: <strong>{toPersianDigits(students.length)} دانش‌آموز</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {classInfo?.grade && (
            <Link
              href={`/dashboard/grade/${classInfo.grade.code}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به {classInfo.grade.name}</span>
            </Link>
          )}

          <button
            onClick={() => setAddStudentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>افزودن دانش‌آموز به این کلاس</span>
          </button>

          <button
            onClick={() => setSmsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
            title="ارسال پیامک به اولیا"
          >
            <MessageSquare className="w-4 h-4" />
            <span>پیامک به اولیا ({toPersianDigits(studentsWithIssues.length)})</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ لیست</span>
          </button>
        </div>
      </div>

      {/* Persian Jalali Date Navigation Bar as requested */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-3 cursor-pointer group p-1.5 -m-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="کلیک کنید تا تقویم باز شود و هر تاریخی (مثلاً ۳ ماه قبل) را سریع انتخاب کنید"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>تاریخ جلسه حضور و غیاب</span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                انتخاب از تقویم (۳ ماه قبل...)
              </span>
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {formatJalaliFull(currentDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>تقویم کامل</span>
          </button>

          <button
            onClick={handlePrevDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>روز قبل</span>
          </button>

          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            امروز
          </button>

          <button
            onClick={handleNextDay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>روز بعد</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Attendance Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>حاضر:</span>
          </span>
          <span className="text-sm font-black">{toPersianDigits(presentCount)} نفر</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>غایب:</span>
          </span>
          <span className="text-sm font-black">{toPersianDigits(absentCount)} نفر</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>تاخیر:</span>
          </span>
          <span className="text-sm font-black">{toPersianDigits(lateCount)} نفر</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>موجه / مرخصی:</span>
          </span>
          <span className="text-sm font-black">{toPersianDigits(excusedCount)} نفر</span>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Top Actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            فهرست دانش‌آموزان و ثبت وضعیت حضور در سرور
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>علامت‌گذاری همه به عنوان حاضر</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs">در حال بارگذاری لیست حضور و غیاب از سرور...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              هنوز هیچ دانش‌آموزی در این کلاس ثبت نشده است
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              با کلیک بر روی دکمه «افزودن دانش‌آموز» مشخصات دانش‌آموزان این کلاس را وارد کنید.
            </p>
            <button
              onClick={() => setAddStudentOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>افزودن اولین دانش‌آموز</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                  <th className="py-3.5 px-4 font-bold w-12 text-center">ردیف</th>
                  <th className="py-3.5 px-4 font-bold">نام و نام خانوادگی</th>
                  <th className="py-3.5 px-4 font-bold">شماره تماس ولی</th>
                  <th className="py-3.5 px-4 font-bold text-center">وضعیت حضور</th>
                  <th className="py-3.5 px-4 font-bold text-center">مدت تاخیر (دقیقه)</th>
                  <th className="py-3.5 px-4 font-bold">توضیحات و علت</th>
                  <th className="py-3.5 px-4 font-bold text-center w-24">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student, idx) => {
                  const isPresent = student.status === "PRESENT";
                  const isAbsent = student.status === "ABSENT";
                  const isLate = student.status === "LATE";
                  const isExcused = student.status === "EXCUSED";

                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                        isAbsent ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {toPersianDigits(idx + 1)}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </div>
                        {student.nationalId && (
                          <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                            کد ملی: {student.nationalId}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300" dir="ltr">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.phone}</span>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, "PRESENT")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              isPresent
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/50 scale-105"
                                : "text-slate-500 hover:text-emerald-700"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>حاضر</span>
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, "ABSENT")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              isAbsent
                                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/50 scale-105"
                                : "text-slate-500 hover:text-rose-700"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>غایب</span>
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, "LATE")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              isLate
                                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/50 scale-105"
                                : "text-slate-500 hover:text-amber-700"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>تاخیر</span>
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, "EXCUSED")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              isExcused
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/50 scale-105"
                                : "text-slate-500 hover:text-blue-700"
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>موجه</span>
                          </button>
                        </div>
                      </td>

                      {/* Delay Minutes */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step={5}
                            disabled={!isLate}
                            value={student.delayMinutes || 0}
                            onChange={(e) =>
                              handleDelayChange(
                                student.studentId,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className={`w-16 px-2 py-1.5 text-center font-mono rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                              isLate
                                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-bold focus:ring-amber-500"
                                : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            }`}
                          />
                          <span className="text-[11px] text-slate-400">دقیقه</span>
                        </div>
                      </td>

                      {/* Notes / Reason */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder={
                            isAbsent
                              ? "علت غیبت (مثال: بیماری)"
                              : isLate
                              ? "علت تاخیر (مثال: سرویس)"
                              : "یادداشت انضباطی..."
                          }
                          value={student.notes || ""}
                          onChange={(e) =>
                            handleNotesChange(student.studentId, e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Actions: Edit and Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="ویرایش مشخصات دانش‌آموز"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.studentId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="حذف دانش‌آموز از کلاس"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Bottom Save Bar */}
      {students.length > 0 && (
        <div className="fixed bottom-14 sm:bottom-12 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 p-3 sm:p-4 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-slate-900/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-400 dark:text-emerald-600 font-bold">
                  <Check className="w-4 h-4" />
                  <span>اطلاعات حضور و غیاب با موفقیت در دیتابیس سرور ذخیره شد.</span>
                </div>
              ) : hasChanges ? (
                <div className="flex items-center gap-1.5 text-amber-300 dark:text-amber-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>تغییراتی در وضعیت حضور اعمال شده است که نیاز به ذخیره دارد.</span>
                </div>
              ) : (
                <span className="text-slate-300 dark:text-slate-600 font-medium">
                  وضعیت همگام با سرور است.
                </span>
              )}
            </div>

            <button
              onClick={handleSaveToServer}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره روی سرور...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ثبت و ذخیره تغییرات</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {classInfo && (
        <AddStudentModal
          isOpen={addStudentOpen}
          onClose={() => setAddStudentOpen(false)}
          onStudentAdded={() => loadAttendance(currentDate)}
          defaultClassId={classId}
          defaultGradeId={classInfo.gradeId}
        />
      )}

      {/* SMS Modal */}
      {classInfo && (
        <SMSModal
          isOpen={smsOpen}
          onClose={() => setSmsOpen(false)}
          classNameTitle={classInfo.name}
          date={currentDate}
          studentsWithIssues={studentsWithIssues}
        />
      )}

      {/* Jalali Calendar Jump Picker Modal */}
      <JalaliPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currentDate={currentDate}
        onSelectDate={(newDate) => {
          setCurrentDate(newDate);
        }}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onStudentUpdated={() => loadAttendance(currentDate)}
        student={editingStudent}
      />
    </div>
  );
}
