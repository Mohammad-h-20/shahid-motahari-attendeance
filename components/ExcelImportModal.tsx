"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("لطفاً یک فایل اکسل انتخاب کنید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to array of arrays
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("فایل اکسل خالی است یا فقط هدر دارد.");
      }

      // Map data according to requested format:
      // ستون اول: پایه | ستون دوم: کلاس | ستون سوم: نام | ستون چهارم: نام خانوادگی | ستون پنجم: شماره تلفن | ستون ششم: کد ملی
      const parsedStudents = [];
      
      // Skip row 0 (headers)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0 || !row[2]) continue; // Skip empty rows or rows without first name

        let phoneStr = row[4] ? String(row[4]).trim() : "";
        if (phoneStr && !phoneStr.startsWith("0")) {
          phoneStr = "0" + phoneStr; // Auto correct phones like 912... -> 0912...
        }

        parsedStudents.push({
          gradeName: row[0] ? String(row[0]).trim() : "",
          className: row[1] ? String(row[1]).trim() : "",
          firstName: row[2] ? String(row[2]).trim() : "",
          lastName: row[3] ? String(row[3]).trim() : "",
          phone: phoneStr,
          nationalId: row[5] ? String(row[5]).trim() : ""
        });
      }

      if (parsedStudents.length === 0) {
        throw new Error("هیچ اطلاعات معتبری در فایل یافت نشد.");
      }

      // Send to API
      const res = await fetch("/api/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: parsedStudents }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "خطا در پردازش اطلاعات");

      setResult(resData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "فایل نامعتبر است یا خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Generate template
    const ws = XLSX.utils.aoa_to_sheet([
      ["پایه", "کلاس", "نام", "نام خانوادگی", "شماره تلفن", "کد ملی"],
      ["پایه هفتم", "کلاس ۷۰۱", "علی", "محمدی", "09123456789", "0012345678"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "دانش‌آموزان");
    XLSX.writeFile(wb, "template-students.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative" dir="rtl">
        <button onClick={onClose} className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">بارگذاری گروهی از اکسل</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">افزودن سریع دانش‌آموزان از فایل .xlsx</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-emerald-700 font-bold text-lg">پردازش کامل شد</h4>
            <p className="text-sm text-slate-600">{result.message}</p>
            {result.details?.failedCount > 0 && (
              <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg text-right max-h-32 overflow-y-auto mt-2">
                <strong>لیست خطاهای پردازش:</strong>
                <ul className="list-disc pr-4 mt-1 space-y-1">
                  {result.details.errors.map((e: any, i: number) => (
                    <li key={i}>ردیف {e.row} ({e.name}): {e.error}</li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={onClose} className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
              بستن پنجره
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-center">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  فایل اکسل خود را انتخاب کنید (با فرمت xlsx)
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors"
                >
                  انتخاب فایل
                </button>
                {file && (
                  <p className="mt-3 text-xs font-bold text-emerald-600">
                    فایل انتخاب شد: {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">راهنمای ساختار فایل اکسل:</h5>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed mb-3">
                لطفاً ستون‌های اکسل دقیقاً به ترتیب زیر باشند (ردیف اول به عنوان هدر نادیده گرفته می‌شود):
                <br/>
                ۱. پایه (مثلاً پایه هفتم) | ۲. کلاس (مثلاً کلاس ۷۰۱) | ۳. نام | ۴. نام خانوادگی | ۵. شماره تلفن | ۶. کد ملی
              </p>
              <button onClick={handleDownloadTemplate} className="text-xs font-bold text-blue-600 hover:text-blue-800 underline">
                دانلود فایل نمونه (قالب آماده اکسل)
              </button>
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{loading ? "در حال پردازش..." : "شروع بارگذاری"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
