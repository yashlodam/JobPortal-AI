/**
 * src/features/mock-interview/components/StrengthCard.jsx
 * Display candidate strengths verified by AI.
 */

import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function StrengthCard({ strengths = [] }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-surface border border-emerald-500/20 backdrop-blur-2xl shadow-xl space-y-4 font-satoshi">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-base font-black text-heading flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" /> Confirmed Key Strengths ({strengths.length})
        </h3>
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          High Performance
        </span>
      </div>

      <ul className="space-y-3">
        {strengths.map((item, idx) => (
          <li key={idx} className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3 text-xs sm:text-sm font-extrabold text-heading">
            <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
