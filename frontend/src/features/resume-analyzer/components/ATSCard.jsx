/**
 * src/features/resume-analyzer/components/ATSCard.jsx
 * Reusable ATS Audit checklist item card with status indicators (pass/warning/fail).
 */

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export default function ATSCard({
  title,
  category,
  status = "pass",
  description,
}) {
  const isPass = status === "pass";
  const isWarning = status === "warning";

  let styles = {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-300",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    badge: "PASS",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  };

  if (isWarning) {
    styles = {
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-300",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      badge: "WARNING",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    };
  } else if (!isPass && !isWarning) {
    styles = {
      bg: "bg-rose-500/10 border-rose-500/30",
      text: "text-rose-300",
      icon: XCircle,
      iconColor: "text-rose-400",
      badge: "FAIL",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    };
  }

  const Icon = styles.icon;

  return (
    <div className={`p-5 rounded-3xl border ${styles.bg} backdrop-blur-xl space-y-3 font-satoshi`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={20} className={`${styles.iconColor} shrink-0`} />
          <h4 className="font-extrabold text-white text-sm sm:text-base">{title}</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles.badgeBg}`}>
          {styles.badge}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pl-8">
        {description}
      </p>

      {category && (
        <div className="pl-8 pt-1 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Category: <span className="text-slate-200">{category}</span>
          </span>
        </div>
      )}
    </div>
  );
}
