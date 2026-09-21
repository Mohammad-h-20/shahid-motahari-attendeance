import React from "react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`w-full py-6 px-4 flex flex-col items-center justify-center gap-3 bg-slate-100/80 dark:bg-[#030712] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 ${className}`}
      dir="ltr"
    >
      {/* Pill Badge matching the user's uploaded design */}
      <div className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#0b132b] dark:bg-[#060c1c] border border-[#1d4ed8]/70 shadow-[0_0_20px_rgba(29,78,216,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300">
        {/* Glowing Blue Circle with Checkmark */}
        <span className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1d4ed8] text-white shadow-[0_0_12px_rgba(37,99,235,0.9)] flex-shrink-0">
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current stroke-current stroke-[1.5]"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        {/* Developer Name text */}
        <span className="text-xs sm:text-sm font-bold tracking-tight text-[#93c5fd] select-none">
          Developed by Mohammad Hossein Mohammadi
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400" dir="rtl">
        سامانه هوشمند حضور و غیاب دبیرستان شهید مطهری
      </p>
    </footer>
  );
}
