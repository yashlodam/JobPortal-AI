/**
 * src/components/ui/LoadingSkeleton.jsx & EmptyState.jsx
 */
import React from "react";
import { Inbox } from "lucide-react";

export function LoadingSkeleton({ count = 3, type = "card" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02] p-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-3 w-2/3 rounded bg-slate-200/60 dark:bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = "No data available", message = "Nothing to display right now.", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 mb-4 shadow-inner">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white font-satoshi">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-white/50 max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
