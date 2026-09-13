/**
 * src/features/mock-interview/components/LoadingSkeleton.jsx
 * Dark-themed shimmer loading skeleton for AI Interview generation & evaluation.
 */

import React from "react";
import { Cpu, Sparkles } from "lucide-react";

export default function LoadingSkeleton({ text = "AI Neural Engine is Generating Questions..." }) {
  return (
    <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-8 font-satoshi">
      <div className="relative inline-block">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-surface border border-primary/40 text-primary mx-auto shadow-sm">
          <Cpu size={48} className="animate-spin text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-heading flex items-center justify-center gap-2">
          <Sparkles className="text-amber-500 animate-pulse" size={20} />
          <span>{text}</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted font-medium max-w-md mx-auto">
          Scanning target job role requirements, difficulty benchmarks, and technical question sets...
        </p>
      </div>

      {/* Shimmer skeleton lines */}
      <div className="p-6 rounded-3xl bg-surface border border-border space-y-4 shadow-sm backdrop-blur-2xl">
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse mx-auto" />
        <div className="h-4 w-full bg-slate-200/60 dark:bg-white/5 rounded-xl animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-200/60 dark:bg-white/5 rounded-xl animate-pulse mx-auto" />
        <div className="h-20 w-full bg-slate-200/60 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
