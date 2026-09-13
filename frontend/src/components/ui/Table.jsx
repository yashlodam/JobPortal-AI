/**
 * src/components/ui/Table.jsx & Pagination.jsx
 */
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b0f19]/80 backdrop-blur-xl touch-scroll-x no-scrollbar">
      <table className={`w-full min-w-[540px] text-left text-xs text-slate-700 dark:text-slate-300 ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">{children}</thead>;
}

export function TableRow({ children, className = "", onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.04] ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return <th className={`px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200 ${className}`}>{children}</th>;
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-white/5">{children}</tbody>;
}

export function TableCell({ children, className = "" }) {
  return <td className={`px-4 py-3.5 text-slate-800 dark:text-slate-200 ${className}`}>{children}</td>;
}

export function Pagination({ currentPage = 0, totalPages = 1, onPageChange, totalElements }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
      {totalElements !== undefined && (
        <span className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
          Total <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span> items
        </span>
      )}

      <div className="flex items-center gap-2 order-1 sm:order-2 ml-auto sm:ml-0">
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 sm:mr-2">
          Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage + 1}</span> of <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
        </span>

        <button
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
