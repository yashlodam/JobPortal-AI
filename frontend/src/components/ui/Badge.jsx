/**
 * src/components/ui/Badge.jsx & StatusChip.jsx
 * Enterprise badge and status indicator components.
 */
import React from "react";

export function Badge({ children, variant = "default", size = "sm", className = "", icon: Icon }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-white/80 dark:border-white/15",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-primary/15 dark:text-primary-light dark:border-primary/30",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
    danger: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

export function StatusChip({ status }) {
  const statusMap = {
    ACTIVE: { label: "Active", variant: "success", dot: "bg-emerald-400" },
    FEATURED: { label: "Featured", variant: "primary", dot: "bg-indigo-400" },
    DRAFT: { label: "Draft", variant: "warning", dot: "bg-amber-400" },
    CLOSED: { label: "Closed", variant: "danger", dot: "bg-rose-400" },
    // Spring Boot ApplicationStatus values
    APPLIED: { label: "Applied", variant: "default", dot: "bg-slate-400" },
    REVIEWING: { label: "Under Review", variant: "cyan", dot: "bg-cyan-400" },
    SHORTLISTED: { label: "Shortlisted", variant: "primary", dot: "bg-indigo-400" },
    INTERVIEWING: { label: "Interviewing", variant: "purple", dot: "bg-purple-400" },
    INTERVIEW: { label: "Interviewing", variant: "purple", dot: "bg-purple-400" },
    OFFERED: { label: "Offer Extended", variant: "warning", dot: "bg-amber-400" },
    OFFER: { label: "Offer Extended", variant: "warning", dot: "bg-amber-400" },
    ACCEPTED: { label: "Offer Accepted", variant: "success", dot: "bg-emerald-400" },
    HIRED: { label: "Hired", variant: "success", dot: "bg-emerald-400" },
    REJECTED: { label: "Not Selected", variant: "danger", dot: "bg-rose-400" },
    WITHDRAWN: { label: "Withdrawn", variant: "danger", dot: "bg-rose-400" },

    // Recruiter Verification & Approval Statuses
    PENDING_VERIFICATION: { label: "Pending Verification", variant: "warning", dot: "bg-amber-400" },
    PENDING: { label: "Pending Verification", variant: "warning", dot: "bg-amber-400" },
    UNDER_REVIEW: { label: "Pending Review", variant: "warning", dot: "bg-amber-400" },
    APPROVED: { label: "Verified Recruiter", variant: "success", dot: "bg-emerald-400" },
    VERIFIED: { label: "Verified Recruiter", variant: "success", dot: "bg-emerald-400" },
    VERIFICATION_REJECTED: { label: "Verification Rejected", variant: "danger", dot: "bg-rose-400" },
    SUSPENDED: { label: "Account Suspended", variant: "danger", dot: "bg-rose-400" },
  };

  const config = statusMap[status?.toUpperCase()] || {
    label: status || "Applied",
    variant: "default",
    dot: "bg-slate-400",
  };

  return (
    <Badge variant={config.variant} size="xs">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}
