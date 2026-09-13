/**
 * src/features/resume-analyzer/components/MetricCard.jsx
 * Reusable Metric Analytics display card.
 */

import React from "react";

export default function MetricCard({
  title,
  value,
  subtitle = "",
  trend = "",
  icon: Icon = null,
  colorClass = "text-primary",
}) {
  return (
    <div className="p-5 rounded-3xl bg-surface border border-border backdrop-blur-xl shadow-sm space-y-2 font-satoshi">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-muted uppercase tracking-wider">{title}</span>
        {Icon && <Icon size={18} className={colorClass} />}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-3xl font-black ${colorClass} tracking-tight`}>{value}</h3>
        {trend && (
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-muted font-medium">{subtitle}</p>}
    </div>
  );
}
