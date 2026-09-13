/**
 * src/features/mock-interview/components/ScoreCard.jsx
 * Multi-metric evaluation gauge display rendering 100% dynamic scores from backend API.
 */

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function ScoreCard({ title, score, icon: Icon = Award, category = "Overall", description }) {
  const numericScore = score !== undefined && score !== null ? Math.round(Number(score)) : 0;

  const getGradient = (val) => {
    if (val >= 85) return "from-emerald-500 to-teal-400";
    if (val >= 70) return "from-indigo-500 to-purple-400";
    return "from-amber-500 to-rose-400";
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-4 font-satoshi flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">{category}</span>
            <h4 className="text-sm font-black text-heading">{title}</h4>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getGradient(numericScore)} text-white shadow-md`}>
          {numericScore}/100
        </div>
      </div>

      {/* Progress Line */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden border border-border/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(numericScore, 0), 100)}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full bg-gradient-to-r ${getGradient(numericScore)}`}
          />
        </div>
        {description && <p className="text-[11px] text-muted font-medium">{description}</p>}
      </div>
    </div>
  );
}
