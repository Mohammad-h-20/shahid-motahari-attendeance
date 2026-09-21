"use client";

import React, { useEffect, useState } from "react";
import { formatJalaliFull } from "@/lib/jalali";
import { ShieldAlert, ShieldCheck, Monitor, History, Smartphone, Globe, Shield } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            تاریخچه نشست‌ها و لاگین
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مشاهده دستگاه‌ها و آی‌پی‌هایی که به سامانه ورود کرده‌اند (۱۰۰ ورود اخیر)
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">در حال بارگذاری...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">هیچ سابقه‌ای ثبت نشده است.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-bold">وضعیت</th>
                  <th className="px-6 py-4 font-bold">دستگاه / سیستم‌عامل</th>
                  <th className="px-6 py-4 font-bold">مرورگر</th>
                  <th className="px-6 py-4 font-bold">آی‌پی (IP)</th>
                  <th className="px-6 py-4 font-bold">نام کاربری وارد شده</th>
                  <th className="px-6 py-4 font-bold">تاریخ و زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const dateObj = new Date(log.createdAt);
                  const jalaliDate = formatJalaliFull(log.createdAt);
                  const time = dateObj.toLocaleTimeString("fa-IR");
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        {isSuccess ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            موفق
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            ناموفق
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2 text-xs">
                          {log.os === "Android" || log.os === "iOS" ? (
                            <Smartphone className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-slate-400" />
                          )}
                          <span dir="ltr">{log.os || "نامشخص"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Globe className="w-4 h-4" />
                          <span dir="ltr">{log.browser || "نامشخص"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400" dir="ltr">
                        {log.ip}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {log.username || "نامشخص"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="font-bold">{jalaliDate}</div>
                        <div className="text-[10px] mt-0.5">{time}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
