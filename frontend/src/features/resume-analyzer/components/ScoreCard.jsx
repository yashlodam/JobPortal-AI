/**
 * src/features/resume-analyzer/components/ScoreCard.jsx
 * Reusable Score Card component displaying Progress Ring, Icon, Color indicator, Status badge, and animation.
 */

import React from "react";
import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { getScoreColor } from "../utils/scoreUtils";

export default function ScoreCard({
  title,
  score,
  icon: Icon,
  description = "",
  badgeText = "",
  onClick = null,
  isActive = false,
}) {
  const colorInfo = getScoreColor(score);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative p-5 sm:p-6 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden border backdrop-blur-2xl shadow-sm ${
        isActive
          ? `bg-surface-elevated border-primary shadow-[0_0_30px_rgba(99,102,241,0.25)]`
          : `bg-surface border-border hover:border-primary/40 hover:bg-surface-hover`
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className={`pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${colorInfo.bg}`} />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colorInfo.bg} ${colorInfo.border} ${colorInfo.text}`}>
                <Icon size={18} />
              </div>
            )}
            <h3 className="font-extrabold text-heading text-sm sm:text-base font-satoshi">{title}</h3>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${colorInfo.badge}`}>
              {badgeText || colorInfo.status}
            </span>
          </div>

          {description && (
            <p className="text-xs text-muted font-medium leading-relaxed line-clamp-2 pt-1">
              {description}
            </p>
          )}
        </div>

        {/* Circular Progress Gauge */}
        <div className="shrink-0">
          <ProgressRing score={score} size={88} strokeWidth={8} />
        </div>
      </div>
    </motion.div>
  );
}
