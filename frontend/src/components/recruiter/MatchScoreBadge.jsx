/**
 * src/components/recruiter/MatchScoreBadge.jsx
 *
 * Match Score Badge component matching AI Job Match Score specification:
 * - >= 80% (Strong Match): Green
 * - 60% – 79% (Moderate Match): Amber / Yellow
 * - < 60% (Low Match): Red / Slate
 * - Resolves calculating state and provides instant click-to-calculate if score is pending.
 */

import React from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function MatchScoreBadge({
  score,
  status = "COMPLETED",
  onClick,
  size = "md",
  showIcon = true,
  className = "",
}) {
  const hasNumericScore = score !== null && score !== undefined && !isNaN(Number(score)) && Number(score) > 0;

  // Only show "Calculating..." if status is explicitly pending AND there is no numeric score yet
  if (!hasNumericScore && (status === "PROCESSING" || status === "PENDING")) {
    return (
      <span
        onClick={onClick}
        title="AI is analyzing compatibility. Click to view or recalculate."
        className={`inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-300 transition ${
          onClick ? "cursor-pointer hover:bg-indigo-500/20 hover:scale-105 shadow-sm" : ""
        } ${className}`}
      >
        <Loader2 className="h-3 w-3 animate-spin text-indigo-400 shrink-0" />
        <span>Calculating...</span>
      </span>
    );
  }

  // If score is completely missing and not calculating, provide an actionable badge
  if (!hasNumericScore) {
    return (
      <span
        onClick={onClick}
        title="Click to calculate AI match score"
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-extrabold text-amber-300 transition ${
          onClick ? "cursor-pointer hover:bg-amber-500/20 hover:scale-105 shadow-sm" : ""
        } ${className}`}
      >
        <Sparkles className="h-3 w-3 text-amber-400 animate-pulse shrink-0" />
        <span>Calculate Match ✨</span>
      </span>
    );
  }

  const numericScore = Math.round(Number(score));

  let colorClasses = "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:border-rose-500/60";
  let label = "Low Match";

  if (numericScore >= 80) {
    colorClasses = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/60";
    label = "Strong Match";
  } else if (numericScore >= 60) {
    colorClasses = "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:border-amber-500/60";
    label = "Moderate Match";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm font-extrabold",
  };

  return (
    <span
      onClick={onClick}
      title={`${label} (${numericScore}%) — Click to view AI breakdown`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold tracking-wide transition shadow-sm ${colorClasses} ${
        sizeClasses[size] || sizeClasses.md
      } ${onClick ? "cursor-pointer hover:scale-105" : ""} ${className}`}
    >
      {showIcon && <Sparkles className="h-3 w-3 shrink-0 text-amber-400 fill-amber-400/20" />}
      <span>{numericScore}% Match</span>
    </span>
  );
}
