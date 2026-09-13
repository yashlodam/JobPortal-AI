/**
 * src/features/resume-analyzer/components/ProgressRing.jsx
 * Reusable animated SVG circular progress ring component with glowing center score.
 */

import React from "react";
import { motion } from "framer-motion";
import { getScoreColor } from "../utils/scoreUtils";

export default function ProgressRing({
  score = 0,
  size = 110,
  strokeWidth = 9,
  showLabel = true,
  subtitle = "",
  className = "",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorInfo = getScoreColor(score);
  const gradientId = `ring-grad-${score}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorInfo.stroke} />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 dark:stroke-white/10"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black font-satoshi ${colorInfo.text} text-xl sm:text-2xl leading-none`}>
            {score}
          </span>
          {subtitle ? (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mt-0.5">
              {subtitle}
            </span>
          ) : (
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              / 100
            </span>
          )}
        </div>
      )}
    </div>
  );
}
