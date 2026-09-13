/**
 * src/features/mock-interview/components/WeaknessCard.jsx
 * Display candidate growth areas / weaknesses flagged by AI evaluation.
 */

import React from "react";
import { AlertCircle, Zap } from "lucide-react";

export default function WeaknessCard({ weaknesses = [] }) {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-surface border border-amber-500/20 backdrop-blur-2xl shadow-xl space-y-4 font-satoshi">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-base font-black text-heading flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500 dark:text-amber-400" /> Key Growth Areas ({weaknesses.length})
        </h3>
        <span className="text-[10px] font-black text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          Action Items
        </span>
      </div>

      <ul className="space-y-3">
        {weaknesses.map((item, idx) => (
          <li key={idx} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3 text-xs sm:text-sm font-extrabold text-heading">
            <Zap size={16} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
