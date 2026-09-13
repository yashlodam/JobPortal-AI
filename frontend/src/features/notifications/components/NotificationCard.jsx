/**
 * src/features/notifications/components/NotificationCard.jsx
 *
 * Rich notification item card supporting priority borders, unread states,
 * deep-linking, hover actions, and bulk selection.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Archive,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import NotificationTypeIcon from "./NotificationTypeIcon";
import { useNotificationActions } from "../hooks/useNotificationActions";

dayjs.extend(relativeTime);

/**
 * Formats ISO date to relative timestamp ("2m ago", "Yesterday", "Aug 1")
 */
function formatTimestamp(dateStr) {
  if (!dateStr) return "";
  const date = dayjs(dateStr);
  const now = dayjs();

  if (now.diff(date, "hour") < 24) {
    return date.fromNow();
  }
  if (now.diff(date, "day") < 7) {
    return date.format("ddd, h:mm A");
  }
  return date.format("MMM D, YYYY");
}

import { useAppSelector } from "../../../State/Store";

export function resolveNotificationLink(notification, isRecruiter = false, isAdmin = false) {
  const { type, actionUrl, referenceId } = notification || {};

  // 1. If explicit actionUrl provided, sanitize / normalize known legacy routes
  if (actionUrl) {
    if (actionUrl.startsWith("http://") || actionUrl.startsWith("https://")) {
      return actionUrl;
    }

    const url = actionUrl.trim();

    // Fix legacy recruiter application links: /recruiter/jobs/:id/applications -> /recruiter/applications
    if (url.includes("/recruiter/jobs/") && url.includes("/applications")) {
      return "/recruiter/applications";
    }

    // Fix legacy candidate application links: /applications or /applications/:id -> /my-jobs/applied
    if (url.startsWith("/applications")) {
      return isRecruiter ? "/recruiter/applications" : "/my-jobs/applied";
    }

    // Fix legacy jobs route: /jobs -> /find-jobs (keep /jobs/:id if valid id exists)
    if (url === "/jobs" || url === "/jobs/") {
      return isRecruiter ? "/recruiter/jobs" : "/find-jobs";
    }

    // Fix legacy verification status: /recruiter/verification/status -> /recruiter/verification
    if (url.startsWith("/recruiter/verification/status")) {
      return "/recruiter/verification";
    }

    // Fix legacy settings link: /settings/security -> /settings or /recruiter/settings
    if (url.startsWith("/settings/security")) {
      return isRecruiter ? "/recruiter/settings" : "/settings";
    }

    // Fix legacy support link: /support -> /about
    if (url === "/support" || url === "/support/") {
      return "/about";
    }

    // Fix messages routing based on user role
    if (url.startsWith("/messages")) {
      return isRecruiter ? "/recruiter/messages" : "/messages";
    }

    return url;
  }

  // 2. Derive target URL from NotificationType and referenceId
  switch (type) {
    // Applications
    case "APPLICATION_RECEIVED":
    case "APPLICATION_WITHDRAWN":
      return isRecruiter ? "/recruiter/applications" : "/my-jobs/applied";

    case "APPLICATION_SUBMITTED":
    case "APPLICATION_SHORTLISTED":
    case "APPLICATION_REJECTED":
    case "APPLICATION_STATUS_UPDATED":
      return isRecruiter ? "/recruiter/applications" : "/my-jobs/applied";

    // Interviews
    case "INTERVIEW_SCHEDULED":
    case "INTERVIEW_REMINDER":
    case "INTERVIEW_COMPLETED":
      return isRecruiter ? "/recruiter/interviews" : "/my-jobs/interviews";

    // Offers
    case "OFFER_RECEIVED":
    case "OFFER_ACCEPTED":
    case "OFFER_REJECTED":
      return isRecruiter ? "/recruiter/applications" : "/my-jobs/offers";

    // Jobs
    case "FEATURED_JOB":
    case "NEW_JOB":
    case "JOB_MATCH":
    case "JOB_REOPENED":
      if (referenceId) return `/jobs/${referenceId}`;
      return isRecruiter ? "/recruiter/jobs" : "/find-jobs";

    case "JOB_EXPIRED":
      return isRecruiter ? "/recruiter/jobs" : "/find-jobs";

    case "AI_JOB_RECOMMENDATION":
      return isRecruiter ? "/recruiter/jobs" : "/my-jobs/recommended";

    // Resume / Candidates
    case "RESUME_ANALYZED":
      return isRecruiter ? "/recruiter/candidates" : "/resume-analyzer";

    // Company
    case "COMPANY_UPDATE":
    case "COMPANY_VERIFIED":
      if (isRecruiter) return "/recruiter/company";
      return referenceId ? `/company/${referenceId}` : "/find-jobs";

    // Messages
    case "MESSAGE_RECEIVED":
      return isRecruiter ? "/recruiter/messages" : "/messages";

    // Recruiter Verification
    case "VERIFICATION_SUBMITTED":
    case "RECRUITER_REJECTED":
    case "RECRUITER_SUSPENDED":
      return isAdmin ? "/admin/recruiters" : "/recruiter/verification";

    case "RECRUITER_APPROVED":
      return isAdmin ? "/admin/recruiters" : "/recruiter/dashboard";

    // Profile & Account
    case "PROFILE_COMPLETED":
    case "PROFILE_INCOMPLETE":
      return isRecruiter ? "/recruiter/settings" : "/profile";

    case "ACCOUNT":
      if (isAdmin) return "/admin/users";
      return isRecruiter ? "/recruiter/settings" : "/profile";

    case "SECURITY":
      return isRecruiter ? "/recruiter/settings" : "/settings";

    case "SYSTEM":
    default:
      return "/notifications";
  }
}

export default function NotificationCard({
  notification,
  onCloseDropdown,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.profile);
  const { markAsRead, archiveNotification, deleteNotification } = useNotificationActions();

  const accountType = (user?.accountType || user?.role || "").toUpperCase();
  const isRecruiter = accountType === "EMPLOYER" || accountType === "RECRUITER";
  const isAdmin = accountType === "ADMIN";

  const {
    id,
    type,
    priority,
    title,
    message,
    actionUrl,
    image,
    read,
    archived,
    createdAt,
  } = notification;

  // Compute bulletproof destination URL
  const targetUrl = resolveNotificationLink(notification, isRecruiter, isAdmin);

  // Priority border accent
  const priorityBorderClass = {
    CRITICAL: "border-l-4 border-l-rose-500",
    HIGH: "border-l-4 border-l-amber-500",
    MEDIUM: "border-l-4 border-l-indigo-500/50",
    LOW: "border-l-4 border-l-transparent",
  }[priority] || "border-l-4 border-l-transparent";

  // Card click handler
  const handleClick = (e) => {
    // Don't trigger navigation if clicking action buttons or checkbox
    if (e.target.closest("button") || e.target.closest("input")) return;

    if (!read) {
      markAsRead(id);
    }

    if (targetUrl) {
      if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      } else {
        navigate(targetUrl);
      }
    }

    if (onCloseDropdown) {
      onCloseDropdown();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      onClick={handleClick}
      className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${priorityBorderClass} ${
        !read
          ? "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/15"
          : "bg-surface border-border hover:bg-surface-elevated"
      }`}
    >
      {/* Checkbox for bulk actions */}
      {selectable && (
        <div className="flex h-9 items-center justify-center pr-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.(id)}
            className="h-4 w-4 rounded border-border bg-surface text-indigo-600 focus:ring-indigo-500/40 cursor-pointer"
          />
        </div>
      )}

      {/* Type Icon / Avatar */}
      <NotificationTypeIcon type={type} image={image} />

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              className={`text-sm font-bold truncate font-satoshi ${
                !read ? "text-heading" : "text-body"
              }`}
            >
              {title}
            </h4>

            {/* Critical Priority Badge */}
            {priority === "CRITICAL" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <ShieldAlert className="h-3 w-3" /> Critical
              </span>
            )}
          </div>

          <span className="shrink-0 text-[11px] font-medium text-muted">
            {formatTimestamp(createdAt)}
          </span>
        </div>

        {/* Message preview */}
        <p className="text-xs text-body line-clamp-2 leading-relaxed font-medium">
          {message}
        </p>

        {/* Action Chip / Deep Link */}
        {targetUrl && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline transition-colors">
            <span>
              {type?.includes("APPLICATION") ? "View applications" :
               type?.includes("INTERVIEW") ? "View interview schedule" :
               type?.includes("OFFER") ? "View offer" :
               type?.includes("JOB") ? "View job" :
               type?.includes("MESSAGE") ? "Open messages" :
               type?.includes("RESUME") ? "View analysis" :
               type?.includes("VERIFICATION") ? "Check status" : "View details"}
            </span>
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Right side status / hover controls */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
        {/* Unread indicator dot */}
        {!read && (
          <span
            aria-label="Unread notification"
            className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_#6366f1]"
          />
        )}

        {/* Per-item Hover Actions */}
        <div className="absolute right-3 bottom-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border p-1 rounded-xl shadow-lg">
          {!read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(id);
              }}
              title="Mark as read"
              aria-label="Mark as read"
              className="p-1.5 text-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}

          {!archived && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveNotification(id);
              }}
              title="Archive notification"
              aria-label="Archive notification"
              className="p-1.5 text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(id);
            }}
            title="Delete notification"
            aria-label="Delete notification"
            className="p-1.5 text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
