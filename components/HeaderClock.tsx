"use client";

import React, { useEffect, useState } from "react";
import { Clock, Calendar, ShieldCheck } from "lucide-react";
import { getIranLiveTime, toPersianDigits } from "@/lib/jalali";

export default function HeaderClock() {
  const [mounted, setMounted] = useState(false);
  const [timeData, setTimeData] = useState({
    time: "۰۰:۰۰:۰۰",
    fullDate: "در حال بارگذاری...",
    jalaliDate: "",
  });

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setTimeData(getIranLiveTime());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-sm text-slate-500">
        <span>در حال هماهنگی با ساعت رسمی ایران...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/80 dark:bg-slate-800/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm text-xs sm:text-sm">
      {/* Date */}
      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
        <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>{timeData.fullDate}</span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-slate-700" />

      {/* Clock with live seconds */}
      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold tracking-wider">
        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse flex-shrink-0" />
        <span className="font-mono text-sm sm:text-base">{timeData.time}</span>
      </div>

      <div className="hidden md:flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span>ساعت رسمی ایران</span>
      </div>
    </div>
  );
}
