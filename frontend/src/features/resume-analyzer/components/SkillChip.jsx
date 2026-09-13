/**
 * src/features/resume-analyzer/components/SkillChip.jsx
 * Reusable animated chip badge for Detected, Missing, and Recommended skills.
 */

import React from "react";
import { motion } from "framer-motion";
import { Check, Plus, AlertCircle, Sparkles } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export default function SkillChip({
  name,
  category = "",
  matchScore = null,
  type = "detected", // "detected" | "missing" | "recommended"
  priority = "",
  reason = "",
  onAction = null,
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  let styles = {
    bg: isLight ? "bg-emerald-100/90" : "bg-emerald-500/15 hover:bg-emerald-500/25",
    border: isLight ? "border-emerald-300" : "border-emerald-500/30",
    textColor: isLight ? "#022c22" : "#a7f3d0",
    icon: Check,
    iconColor: isLight ? "text-emerald-800" : "text-emerald-400",
  };

  if (type === "missing") {
    styles = {
      bg: isLight ? "bg-rose-100/90" : "bg-rose-500/15 hover:bg-rose-500/25",
      border: isLight ? "border-rose-300" : "border-rose-500/30",
      textColor: isLight ? "#4c0519" : "#fecdd3",
      icon: AlertCircle,
      iconColor: isLight ? "text-rose-800" : "text-rose-400",
    };
  } else if (type === "recommended") {
    styles = {
      bg: isLight ? "bg-indigo-100/90" : "bg-indigo-500/15 hover:bg-indigo-500/25",
      border: isLight ? "border-indigo-300" : "border-primary/30",
      textColor: isLight ? "#1e1b4b" : "#e0e7ff",
      icon: Sparkles,
      iconColor: isLight ? "text-indigo-800" : "text-indigo-400",
    };
  }

  const Icon = styles.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 rounded-2xl border ${styles.bg} ${styles.border} px-3.5 py-2 text-xs font-black font-satoshi shadow-sm transition-all duration-200 cursor-pointer`}
      title={reason || `${category} - ${type}`}
      onClick={onAction}
    >
      <Icon size={14} className={styles.iconColor} />
      <span style={{ color: styles.textColor, fontWeight: 900 }}>{name}</span>

      {category && (
        <span className="text-[10px] text-muted font-bold px-1.5 py-0.5 rounded-md bg-surface-elevated border border-border">
          {category}
        </span>
      )}

      {matchScore !== null && (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold ml-0.5">
          {matchScore}%
        </span>
      )}

      {priority && (
        <span className="text-[9px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
          {priority}
        </span>
      )}

      {onAction && type === "missing" && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/30 text-rose-700 dark:text-rose-200 hover:bg-rose-500/50">
          <Plus size={10} />
        </span>
      )}
    </motion.div>
  );
}
