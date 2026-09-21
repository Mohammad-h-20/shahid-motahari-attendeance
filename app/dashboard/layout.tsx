"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderClock from "@/components/HeaderClock";
import ThemeToggle from "@/components/ThemeToggle";
import AddClassModal from "@/components/AddClassModal";
import AddStudentModal from "@/components/AddStudentModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClassAdded = () => {
    setRefreshKey((prev) => prev + 1);
    // Dispatch custom event to notify current page if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("class_or_student_added"));
    }
  };

  const handleStudentAdded = () => {
    setRefreshKey((prev) => prev + 1);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("class_or_student_added"));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] bg-slate-50 dark:bg-slate-950">
      {/* Right Sidebar */}
      <Sidebar
        onOpenAddClass={() => setAddClassOpen(true)}
        onOpenAddStudent={() => setAddStudentOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-18 py-3 px-4 sm:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-xs font-bold text-slate-500 dark:text-slate-400">
              دبیرستان دوره اول شهید مطهری
            </span>
          </div>

          <div className="flex items-center gap-3">
            <HeaderClock />
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto" key={refreshKey}>
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AddClassModal
        isOpen={addClassOpen}
        onClose={() => setAddClassOpen(false)}
        onClassAdded={handleClassAdded}
      />

      <AddStudentModal
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onStudentAdded={handleStudentAdded}
      />
    </div>
  );
}
