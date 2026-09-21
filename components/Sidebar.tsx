"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
  UserPlus,
  BarChart3,
  LogOut,
  ChevronRight,
  School,
  Menu,
  X,
  Users,
  User,
} from "lucide-react";

interface SidebarProps {
  onOpenAddClass?: () => void;
  onOpenAddStudent?: () => void;
}

export default function Sidebar({ onOpenAddClass, onOpenAddStudent }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
  };

  const navItems = [
    {
      title: "پیشخوان سامانه",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "پایه هفتم",
      href: "/dashboard/grade/grade-7",
      icon: GraduationCap,
      badge: "دوره اول",
      active: pathname.startsWith("/dashboard/grade/grade-7"),
    },
    {
      title: "پایه هشتم",
      href: "/dashboard/grade/grade-8",
      icon: GraduationCap,
      badge: "دوره اول",
      active: pathname.startsWith("/dashboard/grade/grade-8"),
    },
    {
      title: "پایه نهم",
      href: "/dashboard/grade/grade-9",
      icon: GraduationCap,
      badge: "دوره اول",
      active: pathname.startsWith("/dashboard/grade/grade-9"),
    },
    {
      title: "دفتر آمار و گزارش‌ها",
      href: "/dashboard/reports",
      icon: BarChart3,
      active: pathname === "/dashboard/reports",
    },
    {
      title: "پروفایل و تغییر رمز",
      href: "/dashboard/profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
    {
      title: "تاریخچه نشست‌ها",
      href: "/dashboard/history",
      icon: Users,
      active: pathname === "/dashboard/history",
    },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-3 right-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-40 flex flex-col justify-between p-4 shadow-lg lg:shadow-none transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        dir="rtl"
      >
        <div className="space-y-6">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                مدرسه شهید مطهری
              </h2>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
                سامانه هوشمند حضور و غیاب
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors group cursor-pointer"
            title="مشاهده پروفایل و تغییر کلمه عبور"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              مدیر
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">
                ناظم و مدیریت مدرسه
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>تغییر رمز و تنظیمات</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {onOpenAddClass && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAddClass();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>افزودن کلاس</span>
              </button>
            )}

            {onOpenAddStudent && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAddStudent();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/60 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>افزودن دانش‌آموز</span>
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-sm font-medium">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
              بخش‌های سامانه
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    item.active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.active ? "text-white" : "text-slate-400"}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && !item.active && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                  {item.active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout & Bottom actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از سامانه</span>
          </button>
        </div>
      </aside>
    </>
  );
}
