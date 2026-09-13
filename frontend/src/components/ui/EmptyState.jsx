/**
 * src/components/ui/EmptyState.jsx
 * Clean, production empty state component with optional action CTA.
 */
import React from "react";
import { FolderSearch } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: Icon = FolderSearch,
  title = "No results found",
  description = "We couldn't find anything matching your current filters or criteria.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] font-inter ${className}`}
    >
      <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="h-7 w-7 stroke-[1.5]" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5 font-satoshi">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;