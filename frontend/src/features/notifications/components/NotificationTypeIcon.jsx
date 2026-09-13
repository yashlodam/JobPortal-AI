/**
 * src/features/notifications/components/NotificationTypeIcon.jsx
 *
 * Renders the icon, badge styling, and human-readable label for a given NotificationType.
 */

import React from "react";
import {
  Star,
  Briefcase,
  Target,
  Clock,
  RefreshCw,
  Send,
  Inbox,
  Award,
  XCircle,
  Undo2,
  Repeat,
  Calendar,
  BellRing,
  CheckCircle2,
  PartyPopper,
  Handshake,
  Ban,
  Building2,
  BadgeCheck,
  UserCheck,
  AlertCircle,
  Bot,
  Sparkles,
  MessageSquare,
  Megaphone,
  User,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export const NOTIFICATION_CONFIG = {
  // Verification Types
  VERIFICATION_SUBMITTED: { icon: ShieldCheck, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Verification Under Review", emoji: "⏳" },
  RECRUITER_APPROVED: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Recruiter Approved", emoji: "🎉" },
  RECRUITER_REJECTED: { icon: XCircle, color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "Verification Rejected", emoji: "⚠️" },
  RECRUITER_SUSPENDED: { icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10 border-rose-500/20", label: "Account Suspended", emoji: "🚫" },

  // Jobs
  FEATURED_JOB: { icon: Star, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Featured Job", emoji: "⭐" },
  NEW_JOB: { icon: Briefcase, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "New Job", emoji: "💼" },
  JOB_MATCH: { icon: Target, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: "Job Match", emoji: "🎯" },
  JOB_EXPIRED: { icon: Clock, color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "Job Expired", emoji: "⏰" },
  JOB_REOPENED: { icon: RefreshCw, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Job Reopened", emoji: "🔄" },

  // Applications
  APPLICATION_SUBMITTED: { icon: Send, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Applied", emoji: "📤" },
  APPLICATION_RECEIVED: { icon: Inbox, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", label: "Application Received", emoji: "📥" },
  APPLICATION_SHORTLISTED: { icon: Award, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Shortlisted", emoji: "🏆" },
  APPLICATION_REJECTED: { icon: XCircle, color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "Not Selected", emoji: "❌" },
  APPLICATION_WITHDRAWN: { icon: Undo2, color: "text-slate-400 bg-slate-400/10 border-slate-400/20", label: "Withdrawn", emoji: "↩️" },
  APPLICATION_STATUS_UPDATED: { icon: Repeat, color: "text-sky-400 bg-sky-400/10 border-sky-400/20", label: "Status Updated", emoji: "🔁" },

  // Interviews
  INTERVIEW_SCHEDULED: { icon: Calendar, color: "text-teal-400 bg-teal-400/10 border-teal-400/20", label: "Interview", emoji: "📅" },
  INTERVIEW_REMINDER: { icon: BellRing, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Reminder", emoji: "⏰" },
  INTERVIEW_COMPLETED: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Completed", emoji: "✅" },

  // Offers
  OFFER_RECEIVED: { icon: PartyPopper, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Offer Received!", emoji: "🎉" },
  OFFER_ACCEPTED: { icon: Handshake, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Accepted", emoji: "🤝" },
  OFFER_REJECTED: { icon: Ban, color: "text-rose-500 bg-rose-500/10 border-rose-500/20", label: "Rejected", emoji: "🚫" },

  // Company
  COMPANY_UPDATE: { icon: Building2, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Company", emoji: "🏢" },
  COMPANY_VERIFIED: { icon: BadgeCheck, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", label: "Verified", emoji: "✔️" },

  // Profile / AI
  PROFILE_COMPLETED: { icon: UserCheck, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Profile", emoji: "⭐" },
  PROFILE_INCOMPLETE: { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Profile Action", emoji: "⚠️" },
  RESUME_ANALYZED: { icon: Bot, color: "text-violet-400 bg-violet-400/10 border-violet-400/20", label: "AI Analysis", emoji: "🤖" },
  AI_JOB_RECOMMENDATION: { icon: Sparkles, color: "text-violet-400 bg-violet-400/10 border-violet-400/20", label: "For You", emoji: "✨" },

  // Messaging
  MESSAGE_RECEIVED: { icon: MessageSquare, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Message", emoji: "💬" },

  // System
  SYSTEM: { icon: Megaphone, color: "text-slate-400 bg-slate-400/10 border-slate-400/20", label: "System", emoji: "📢" },
  ACCOUNT: { icon: User, color: "text-sky-400 bg-sky-400/10 border-sky-400/20", label: "Account", emoji: "👤" },
  SECURITY: { icon: ShieldAlert, color: "text-rose-500 bg-rose-500/10 border-rose-500/20", label: "Security", emoji: "🔐" },
};

export default function NotificationTypeIcon({ type, className = "h-4 w-4", image, icon }) {
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;
  const IconComponent = config.icon;

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20"
      />
    );
  }

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.color} shadow-sm transition-transform group-hover:scale-105`}
    >
      <IconComponent className={className} />
    </div>
  );
}
