/**
 * src/features/resume-analyzer/components/SectionHeader.jsx
 * Standardized Section Header banner with icon, title, subtitle, and action buttons.
 */

import React from "react";

export default function SectionHeader({
  title,
  subtitle = "",
  icon: Icon = null,
  badge = "",
  rightContent = null,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 font-satoshi">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-md">
            <Icon size={22} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h2>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </div>
  );
}
