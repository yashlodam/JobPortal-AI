/**
 * src/features/mock-interview/components/SuggestionCard.jsx
 * Display targeted AI recommendations and learning actions.
 */

import React from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";

export default function SuggestionCard({ title, priority = "High", category = "System Architecture", description }) {
  return (
    <div className="p-5 rounded-3xl bg-surface border border-indigo-500/20 backdrop-blur-2xl shadow-xl space-y-3 font-satoshi flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            {category}
          </span>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
            priority === "High"
              ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
              : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
          }`}>
            {priority} Priority
          </span>
        </div>

        <h4 className="text-base font-black text-heading">{title}</h4>
        <p className="text-xs text-muted font-medium leading-relaxed">{description}</p>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button className="inline-flex items-center gap-1 text-xs font-black text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer">
          <span>Start Learning Path</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
