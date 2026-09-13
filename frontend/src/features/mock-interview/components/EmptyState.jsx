/**
 * src/features/mock-interview/components/EmptyState.jsx
 * Zero-state component for AI Mock Interview.
 */

import React from "react";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

export default function EmptyState({ title = "No Interview Sessions Yet", message = "Configure your setup and launch your first AI mock interview.", onAction }) {
  return (
    <div className="py-16 px-6 text-center space-y-6 max-w-md mx-auto font-satoshi">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 mx-auto shadow-xl">
        <Bot size={40} className="animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">{message}</p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
        >
          <Sparkles size={16} /> Start New Interview <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
