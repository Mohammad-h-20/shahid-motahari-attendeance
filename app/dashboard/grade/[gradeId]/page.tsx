"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  School,
  GraduationCap,
  PlusCircle,
  Users,
  ArrowRight,
  ChevronLeft,
  UserPlus,
  BookOpen,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toPersianDigits } from "@/lib/jalali";
import AddClassModal from "@/components/AddClassModal";
import AddStudentModal from "@/components/AddStudentModal";

export default function GradePage() {
  const params = useParams();
  const router = useRouter();
  const gradeIdentifier = params.gradeId as string;

  const [grade, setGrade] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addStudentClassId, setAddStudentClassId] = useState<string | null>(null);

  const loadGradeData = async () => {
    setLoading(true);
    try {
      // First get all grades to find matching grade
      const gradesRes = await fetch("/api/grades");
      const gradesData = await gradesRes.json();

      if (Array.isArray(gradesData)) {
        const found = gradesData.find(
          (g) => g.code === gradeIdentifier || g.id === gradeIdentifier
        );
        if (found) {
          setGrade(found);
          // Fetch classes for this grade
          const classesRes = await fetch(`/api/classes?gradeId=${found.id}`);
          const classesData = await classesRes.json();
          if (Array.isArray(classesData)) {
            setClasses(classesData);
          }
        }
      }
    } catch (err) {
      console.error("Error loading grade data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("آیا از حذف این کلاس اطمینان دارید؟ تمامی دانش‌آموزان این کلاس نیز حذف خواهند شد.")) return;
    try {
      const res = await fetch(`/api/classes?id=${classId}`, { method: "DELETE" });
      if (res.ok) {
        setClasses((prev) => prev.filter((c) => c.id !== classId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gradeIdentifier) {
      loadGradeData();
    }
  }, [gradeIdentifier]);

  const totalStudents = classes.reduce(
    (acc, c) => acc + (c._count?.students || 0),
    0
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Top Breadcrumb and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <Link
              href="/dashboard"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              <span>پیشخوان</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {grade ? grade.name : "در حال بارگذاری..."}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
            <span>مدیریت کلاس‌های {grade ? grade.name : ""}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مجموعاً {toPersianDigits(classes.length)} کلاس و {toPersianDigits(totalStudents)} دانش‌آموز
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به پیشخوان</span>
          </Link>

          {/* Add Class Button as explicitly requested */}
          <button
            onClick={() => setAddClassOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>افزودن کلاس جدید</span>
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse"
            />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <School className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            هنوز کلاسی برای این پایه ثبت نشده است
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            با زدن دکمه «افزودن کلاس جدید» می‌توانید کلاس‌های جدید را به این پایه اضافه نمایید.
          </p>
          <button
            onClick={() => setAddClassOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>افزودن اولین کلاس</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const studentCount = cls._count?.students || 0;

            return (
              <div
                key={cls.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                      <School className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {cls.room && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          اتاق {toPersianDigits(cls.room)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="حذف کلاس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">
                    {cls.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    {cls.teacher && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">دبیر / ناظم:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cls.teacher}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        تعداد دانش‌آموزان:{" "}
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">
                          {toPersianDigits(studentCount)} نفر
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/dashboard/class/${cls.id}`}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>دفتر حضور و غیاب کلاس</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setAddStudentClassId(cls.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>افزودن دانش‌آموز به این کلاس</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>      {/* Add Class Modal pre-scoped to this grade */}
      {grade && (
        <AddClassModal
          isOpen={addClassOpen}
          onClose={() => setAddClassOpen(false)}
          onClassAdded={loadGradeData}
          defaultGradeId={grade.id}
          grades={[grade]}
        />
      )}

      {/* Add Student Modal */}
      {addStudentClassId && grade && (
        <AddStudentModal
          isOpen={!!addStudentClassId}
          onClose={() => setAddStudentClassId(null)}
          onStudentAdded={loadGradeData}
          defaultClassId={addStudentClassId}
          defaultGradeId={grade.id}
        />
      )}
    </>
  );
}
