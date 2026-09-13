/**
 * src/features/mock-interview/components/ProgressBar.jsx
 * Animated progress bar for live interview questions.
 */

import React from "react";
import { motion } from "framer-motion";

export default function ProgressBar({ current, total }) {
  const percentage = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div className="space-y-1.5 font-satoshi">
      <div className="flex items-center justify-between text-xs font-black text-slate-400">
        <span>Question Progress</span>
        <span className="text-indigo-400">{percentage}% Completed</span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
        />
      </div>
    </div>
  );
}
