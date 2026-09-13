/**
 * src/features/resume-analyzer/utils/scoreUtils.js
 * Utility functions for score metrics, color mappings, grade badges, and progress rings.
 */

export function getScoreColor(score) {
  if (score >= 90) {
    return {
      text: "text-emerald-950 dark:text-emerald-400 font-extrabold",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      stroke: "#10B981",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      gradient: "from-emerald-500 to-teal-400",
      badge: "bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-extrabold border-emerald-500/25",
      status: "Excellent",
    };
  }
  if (score >= 75) {
    return {
      text: "text-indigo-950 dark:text-indigo-400 font-extrabold",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      stroke: "#6366F1",
      glow: "shadow-[0_0_15px_rgba(99,102,241,0.3)]",
      gradient: "from-indigo-500 to-purple-400",
      badge: "bg-indigo-500/10 text-indigo-950 dark:text-indigo-300 font-extrabold border-indigo-500/25",
      status: "Good",
    };
  }
  if (score >= 60) {
    return {
      text: "text-amber-950 dark:text-amber-400 font-extrabold",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      stroke: "#F59E0B",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      gradient: "from-amber-500 to-yellow-400",
      badge: "bg-amber-500/10 text-amber-950 dark:text-amber-300 font-extrabold border-amber-500/25",
      status: "Needs Polish",
    };
  }
  return {
    text: "text-rose-950 dark:text-rose-400 font-extrabold",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    stroke: "#F43F5E",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    gradient: "from-rose-500 to-red-400",
    badge: "bg-rose-500/10 text-rose-950 dark:text-rose-300 font-extrabold border-rose-500/25",
    status: "Critical Fixes",
  };
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
