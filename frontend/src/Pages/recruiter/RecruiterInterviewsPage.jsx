/**
 * src/Pages/recruiter/RecruiterInterviewsPage.jsx
 *
 * Full Interview Management Page for Recruiters.
 * Connected to real backend:  /api/recruiter/interviews/*
 *
 * Features:
 *  - Dashboard stats bar (total, upcoming, today, completed)
 *  - Tab filter: All / Upcoming / Today / Completed / Cancelled
 *  - Schedule Interview modal (pick application → set date/time/mode/link)
 *  - Interview card with status badge, meeting join button, feedback button
 *  - Update Status dropdown (IN_PROGRESS, COMPLETED, NO_SHOW, CANCELLED)
 *  - Feedback & Rating modal (1-5 stars + text)
 *  - Cancel confirmation
 *  - Real-time joinable logic (enabled 15 min before start)
 */

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  UserCheck,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Star,
  MessageSquare,
  ChevronDown,
  Loader2,
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import { format, isToday, isTomorrow, isAfter, parseISO } from "date-fns";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/ToastNotification";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import {
  fetchInterviews,
  fetchInterviewStats,
  scheduleInterviewThunk,
  updateInterviewStatusThunk,
  submitFeedbackThunk,
  cancelInterviewThunk,
} from "../../State/recruiterInterviewSlice";
import { fetchJobApplicationsThunk } from "../../State/applicationThunk";
import { getMyJobs } from "../../State/JobSlice";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "all",       label: "All" },
  { id: "upcoming",  label: "Upcoming" },
  { id: "today",     label: "Today" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const INTERVIEW_MODES = [
  { value: "VIDEO_CALL",       label: "Video Call" },
  { value: "PHONE",            label: "Phone" },
  { value: "IN_PERSON",        label: "In Person" },
  { value: "PAIR_PROGRAMMING", label: "Pair Programming" },
  { value: "WRITTEN_TEST",     label: "Written Test" },
];

const INTERVIEW_ROUNDS = [
  { value: "SCREENING",       label: "Screening" },
  { value: "TECHNICAL",       label: "Technical" },
  { value: "SYSTEM_DESIGN",   label: "System Design" },
  { value: "HR",              label: "HR" },
  { value: "FINAL",           label: "Final" },
  { value: "REFERENCE_CHECK", label: "Reference Check" },
];

const STATUS_COLORS = {
  SCHEDULED:    { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/25" },
  RESCHEDULED:  { bg: "bg-amber-500/15",  text: "text-amber-400",  border: "border-amber-500/25" },
  IN_PROGRESS:  { bg: "bg-cyan-500/15",   text: "text-cyan-400",   border: "border-cyan-500/25" },
  COMPLETED:    { bg: "bg-emerald-500/15",text: "text-emerald-400",border: "border-emerald-500/25"},
  CANCELLED:    { bg: "bg-rose-500/15",   text: "text-rose-400",   border: "border-rose-500/25" },
  NO_SHOW:      { bg: "bg-slate-500/15",  text: "text-slate-400",  border: "border-slate-500/25" },
};

const PLATFORM_PLATFORMS = [
  "Google Meet", "Zoom", "Microsoft Teams", "Webex", "Skype", "Phone Call", "On-site", "Other",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatInterviewDate(dateStr) {
  if (!dateStr) return "—";
  const d = parseISO(dateStr);
  if (isToday(d))    return `Today, ${format(d, "MMM d")}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "MMM d")}`;
  return format(d, "EEE, MMM d, yyyy");
}

function formatInterviewTime(startStr, endStr) {
  if (!startStr) return "—";
  const start = format(parseISO(startStr), "h:mm a");
  const end   = endStr ? format(parseISO(endStr), "h:mm a") : null;
  return end ? `${start} – ${end}` : start;
}

function getModeIcon(mode) {
  if (mode === "PHONE") return <Phone className="h-3.5 w-3.5" />;
  if (mode === "IN_PERSON") return <MapPin className="h-3.5 w-3.5" />;
  return <Video className="h-3.5 w-3.5" />;
}

// ── Stats Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 bg-surface ${color}`}>
      <Icon className="h-5 w-5 shrink-0 opacity-80" />
      <div>
        <p className="text-xl font-black font-satoshi leading-none text-heading">{value ?? "—"}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`transition ${n <= value ? "text-amber-400" : "text-muted/40"} hover:text-amber-400`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RecruiterInterviewsPage() {
  const dispatch = useAppDispatch();
  const toast    = useToast();

  const { interviews, stats, loading, actionLoading } = useAppSelector(
    (s) => s.recruiterInterview
  );
  const { myJobs = [] } = useAppSelector((s) => s.job);
  const { jobApplications = [] } = useAppSelector((s) => s.application);

  const [activeTab, setActiveTab]   = useState("all");
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null); // interview object
  const [showCancel,   setShowCancel]   = useState(null); // interview id

  // Schedule form state
  const [selectedJobId, setSelectedJobId]  = useState("");
  const [selectedAppId, setSelectedAppId]  = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    interviewerName: "",
    interviewRound: "SCREENING",
    interviewMode: "VIDEO_CALL",
    meetingPlatform: "Google Meet",
    meetingLink: "",
    scheduledAt: "",
    durationMinutes: 60,
    internalNotes: "",
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({ feedback: "", candidateRating: 0 });

  // Load data on mount and tab change
  useEffect(() => {
    dispatch(fetchInterviews(activeTab));
    dispatch(fetchInterviewStats());
  }, [dispatch, activeTab]);

  useEffect(() => {
    if (myJobs.length === 0) dispatch(getMyJobs());
  }, [dispatch]);

  // Load applications for selected job
  useEffect(() => {
    if (selectedJobId) {
      dispatch(fetchJobApplicationsThunk({ jobId: selectedJobId }));
    }
  }, [dispatch, selectedJobId]);

  // Available applications for selected job (filter for schedulable: not REJECTED/WITHDRAWN)
  const schedulableApps = useMemo(() => {
    return jobApplications.filter(
      (a) => a.jobId == selectedJobId || a.job?.id == selectedJobId
    ).filter(
      (a) => !["REJECTED", "WITHDRAWN"].includes(a.status)
    );
  }, [jobApplications, selectedJobId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      toast.error("Please select a candidate application.");
      return;
    }

    // ⚠️ Do NOT convert to UTC — backend uses LocalDateTime (no timezone).
    // datetime-local input gives "YYYY-MM-DDTHH:mm". Just pad seconds to get "YYYY-MM-DDTHH:mm:ss".
    const scheduledAt = scheduleForm.scheduledAt
      ? scheduleForm.scheduledAt.length === 16
        ? scheduleForm.scheduledAt + ":00"
        : scheduleForm.scheduledAt
      : null;

    const payload = {
      applicationId:   Number(selectedAppId),
      interviewerName: scheduleForm.interviewerName || undefined,
      interviewRound:  scheduleForm.interviewRound,
      interviewMode:   scheduleForm.interviewMode,
      meetingPlatform: scheduleForm.meetingPlatform,
      meetingLink:     scheduleForm.meetingLink || undefined,
      scheduledAt,
      durationMinutes: Number(scheduleForm.durationMinutes) || 60,
      internalNotes:   scheduleForm.internalNotes || undefined,
    };

    try {
      await dispatch(scheduleInterviewThunk(payload)).unwrap();
      toast.success("Interview scheduled successfully! 🎉");
      setShowSchedule(false);
      resetScheduleForm();
      dispatch(fetchInterviewStats());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to schedule interview.");
    }
  };

  const handleStatusChange = async (interview, newStatus) => {
    try {
      await dispatch(updateInterviewStatusThunk({ id: interview.id, status: newStatus })).unwrap();
      toast.success(`Interview marked as ${newStatus.replace("_", " ")}.`);
      dispatch(fetchInterviewStats());
    } catch (err) {
      toast.error(err || "Failed to update status.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.candidateRating) {
      toast.error("Please provide a rating (1-5 stars).");
      return;
    }
    try {
      await dispatch(submitFeedbackThunk({
        id: showFeedback.id,
        feedback: feedbackForm.feedback,
        candidateRating: feedbackForm.candidateRating,
      })).unwrap();
      toast.success("Feedback submitted! Interview marked as Completed.");
      setShowFeedback(null);
      setFeedbackForm({ feedback: "", candidateRating: 0 });
      dispatch(fetchInterviewStats());
    } catch (err) {
      toast.error(err || "Failed to submit feedback.");
    }
  };

  const handleCancel = async () => {
    try {
      await dispatch(cancelInterviewThunk(showCancel)).unwrap();
      toast.info("Interview cancelled.");
      setShowCancel(null);
      dispatch(fetchInterviewStats());
    } catch (err) {
      toast.error(err || "Failed to cancel interview.");
    }
  };

  const resetScheduleForm = () => {
    setSelectedJobId("");
    setSelectedAppId("");
    setScheduleForm({
      interviewerName: "",
      interviewRound: "SCREENING",
      interviewMode: "VIDEO_CALL",
      meetingPlatform: "Google Meet",
      meetingLink: "",
      scheduledAt: "",
      durationMinutes: 60,
      internalNotes: "",
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <RecruiterLayout
      title="Interview Management"
      subtitle="Schedule, track, and manage all candidate interviews in one place."
      breadcrumbs={[{ label: "Interviews" }]}
      action={
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 rounded-2xl gradient-bg-signature px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Interview</span>
        </button>
      }
    >
      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Total"      value={stats.totalScheduled} icon={Calendar}    color="border-border text-heading" />
          <StatCard label="Upcoming"   value={stats.upcoming}       icon={TrendingUp}  color="border-indigo-500/30 text-indigo-600 dark:text-indigo-400" />
          <StatCard label="Today"      value={stats.todaysCount}    icon={Clock}       color="border-cyan-500/30 text-cyan-500 dark:text-cyan-400" />
          <StatCard label="Completed"  value={stats.completed}      icon={CheckCircle2}color="border-emerald-500/30 text-emerald-500 dark:text-emerald-400" />
          <StatCard label="Cancelled"  value={stats.cancelled}      icon={XCircle}     color="border-rose-500/30 text-rose-500 dark:text-rose-400" />
          <StatCard label="No Shows"   value={stats.noShow}         icon={AlertCircle} color="border-border text-muted" />
        </div>
      )}

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-surface-elevated border border-border p-1 w-fit mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-primary text-white shadow"
                : "text-muted hover:text-heading"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => dispatch(fetchInterviews(activeTab))}
          disabled={loading}
          className="ml-1 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-surface-hover transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-border bg-surface p-5 space-y-4 animate-pulse h-56" />
          ))}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!loading && interviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface rounded-3xl border border-border p-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-heading font-satoshi">No interviews found</h3>
          <p className="text-sm text-muted max-w-xs">
            {activeTab === "all"
              ? "Schedule your first interview to get started."
              : `No ${activeTab} interviews to show.`}
          </p>
          <button
            onClick={() => setShowSchedule(true)}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl gradient-bg-signature px-5 py-2.5 text-xs font-bold text-white shadow hover:scale-105 transition"
          >
            <Plus className="h-4 w-4" /> Schedule Interview
          </button>
        </div>
      )}

      {/* ── Interview Cards Grid ──────────────────────────────────────────────── */}
      {!loading && interviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((item, idx) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.SCHEDULED;
            const canJoin = item.joinable && item.meetingLink;
            const isActive = ["SCHEDULED", "RESCHEDULED", "IN_PROGRESS"].includes(item.status);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-surface hover:border-primary/40 hover:bg-surface-hover transition-all p-5 shadow-sm hover:shadow-md"
              >
                {/* Candidate info */}
                <div>
                  <div className="flex items-start gap-3">
                    <Avatar name={item.candidateName || "?"} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-heading font-satoshi text-base truncate">
                        {item.candidateName || "Candidate"}
                      </h3>
                      <p className="text-xs text-muted truncate">{item.jobTitle || "Job Role"}</p>
                      {item.companyName && (
                        <p className="text-[11px] text-muted/70 truncate">{item.companyName}</p>
                      )}
                    </div>
                    {/* Status badge */}
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {item.statusLabel || item.status}
                    </span>
                  </div>

                  {/* Interview details */}
                  <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatInterviewDate(item.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-2 text-body">
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      {formatInterviewTime(item.scheduledAt, item.endsAt)}
                      {item.durationMinutes && (
                        <span className="text-muted">· {item.durationMinutes} min</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-body">
                      {getModeIcon(item.interviewMode)}
                      <span className="text-muted mr-1">{item.meetingPlatform || "Video Call"}</span>
                      <span className="text-body capitalize">
                        {item.interviewRound?.replace("_", " ") || "Screening"}
                      </span>
                    </div>
                    {item.interviewerName && (
                      <div className="flex items-center gap-2 text-muted">
                        <UserCheck className="h-3.5 w-3.5 opacity-70" />
                        {item.interviewerName}
                      </div>
                    )}
                  </div>

                  {/* Rating (if completed) */}
                  {item.status === "COMPLETED" && item.candidateRating > 0 && (
                    <div className="mt-3 flex items-center gap-1">
                      {[1,2,3,4,5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 fill-current ${n <= item.candidateRating ? "text-amber-400" : "text-muted/30"}`}
                        />
                      ))}
                      <span className="text-[11px] text-muted ml-1">Candidate Rating</span>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                  {/* Join meeting */}
                  {canJoin ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Join Now
                    </a>
                  ) : item.meetingLink && isActive ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Meeting Link
                    </a>
                  ) : null}

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Status change dropdown */}
                    {isActive && (
                      <div className="relative group/status">
                        <button className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] font-semibold text-body hover:bg-surface-hover transition">
                          Status <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute right-0 bottom-8 z-20 hidden group-hover/status:block bg-surface border border-border rounded-xl shadow-xl py-1 min-w-[160px]">
                          {["IN_PROGRESS", "COMPLETED", "NO_SHOW"].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(item, s)}
                              className="w-full text-left px-4 py-2 text-xs text-body hover:bg-surface-hover hover:text-heading transition"
                            >
                              {s.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback button (show for non-cancelled) */}
                    {item.status !== "CANCELLED" && item.status !== "SCHEDULED" && item.status !== "RESCHEDULED" && (
                      <button
                        onClick={() => { setShowFeedback(item); setFeedbackForm({ feedback: item.feedback || "", candidateRating: item.candidateRating || 0 }); }}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] font-semibold text-body hover:bg-surface-hover transition"
                      >
                        <Star className="h-3 w-3" /> Feedback
                      </button>
                    )}

                    {/* Cancel button */}
                    {isActive && (
                      <button
                        onClick={() => setShowCancel(item.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Schedule Interview Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showSchedule}
        onClose={() => { setShowSchedule(false); resetScheduleForm(); }}
        title="Schedule New Interview"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 font-satoshi max-h-[75vh] overflow-y-auto pr-1">

          {/* Step 1: Pick Job */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">
              Select Job Posting <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => { setSelectedJobId(e.target.value); setSelectedAppId(""); }}
              required
              style={{ colorScheme: "auto" }}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
            >
              <option value="" className="bg-surface text-heading">-- Select a job --</option>
              {myJobs.map((j) => (
                <option key={j.id} value={j.id} className="bg-surface text-heading">{j.jobTitle}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Pick Candidate */}
          {selectedJobId && (
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                Select Candidate <span className="text-rose-500">*</span>
              </label>
              {schedulableApps.length === 0 ? (
                <p className="text-xs text-muted italic py-2">No schedulable applications for this job.</p>
              ) : (
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  required
                  style={{ colorScheme: "auto" }}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
                >
                  <option value="" className="bg-surface text-heading">-- Select a candidate --</option>
                  {schedulableApps.map((a) => (
                    <option key={a.id} value={a.id} className="bg-surface text-heading">
                      {a.applicant?.name || a.candidateName || `Application #${a.id}`} — {a.status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Round */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Round</label>
              <select
                value={scheduleForm.interviewRound}
                onChange={(e) => setScheduleForm((p) => ({ ...p, interviewRound: e.target.value }))}
                style={{ colorScheme: "auto" }}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
              >
                {INTERVIEW_ROUNDS.map((r) => <option key={r.value} value={r.value} className="bg-surface text-heading">{r.label}</option>)}
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Format</label>
              <select
                value={scheduleForm.interviewMode}
                onChange={(e) => setScheduleForm((p) => ({ ...p, interviewMode: e.target.value }))}
                style={{ colorScheme: "auto" }}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
              >
                {INTERVIEW_MODES.map((m) => <option key={m.value} value={m.value} className="bg-surface text-heading">{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Meeting Platform</label>
            <select
              value={scheduleForm.meetingPlatform}
              onChange={(e) => setScheduleForm((p) => ({ ...p, meetingPlatform: e.target.value }))}
              style={{ colorScheme: "auto" }}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
            >
              {PLATFORM_PLATFORMS.map((p) => <option key={p} value={p} className="bg-surface text-heading">{p}</option>)}
            </select>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Meeting Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={scheduleForm.meetingLink}
              onChange={(e) => setScheduleForm((p) => ({ ...p, meetingLink: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary placeholder:text-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary"
                style={{ colorScheme: "auto" }}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Duration (min)</label>
              <select
                value={scheduleForm.durationMinutes}
                onChange={(e) => setScheduleForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                style={{ colorScheme: "auto" }}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary [&>option]:bg-surface [&>option]:text-heading"
              >
                {[15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d} className="bg-surface text-heading">{d} min</option>)}
              </select>
            </div>
          </div>

          {/* Interviewer Name */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Interviewer Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={scheduleForm.interviewerName}
              onChange={(e) => setScheduleForm((p) => ({ ...p, interviewerName: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary placeholder:text-muted"
            />
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Internal Notes (not visible to candidate)</label>
            <textarea
              rows={2}
              placeholder="Focus areas, prep notes, panel details…"
              value={scheduleForm.internalNotes}
              onChange={(e) => setScheduleForm((p) => ({ ...p, internalNotes: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary placeholder:text-muted resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full rounded-2xl gradient-bg-signature py-3 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling…</>
            ) : (
              <><Calendar className="h-4 w-4" /> Confirm & Schedule Interview</>
            )}
          </button>
        </form>
      </Modal>

      {/* ── Feedback Modal ───────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!showFeedback}
        onClose={() => setShowFeedback(null)}
        title="Interview Feedback"
      >
        {showFeedback && (
          <form onSubmit={handleFeedbackSubmit} className="space-y-5 font-satoshi">
            <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
              <p className="text-sm font-bold text-heading">{showFeedback.candidateName}</p>
              <p className="text-xs text-muted">{showFeedback.jobTitle} · {showFeedback.interviewRound?.replace("_", " ")}</p>
              <p className="text-xs text-muted">{formatInterviewDate(showFeedback.scheduledAt)}</p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-2">
                Candidate Rating <span className="text-rose-500">*</span>
              </label>
              <StarRating
                value={feedbackForm.candidateRating}
                onChange={(v) => setFeedbackForm((p) => ({ ...p, candidateRating: v }))}
              />
              <p className="text-[11px] text-muted mt-1">
                {feedbackForm.candidateRating === 0 && "Select a rating"}
                {feedbackForm.candidateRating === 1 && "Poor — Would not recommend"}
                {feedbackForm.candidateRating === 2 && "Below average"}
                {feedbackForm.candidateRating === 3 && "Average — Meets some requirements"}
                {feedbackForm.candidateRating === 4 && "Good — Strong candidate"}
                {feedbackForm.candidateRating === 5 && "Excellent — Highly recommend"}
              </p>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Evaluation Notes</label>
              <textarea
                rows={4}
                placeholder="Communication skills, technical depth, culture fit, recommendation…"
                value={feedbackForm.feedback}
                onChange={(e) => setFeedbackForm((p) => ({ ...p, feedback: e.target.value }))}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-heading outline-none focus:border-primary placeholder:text-muted resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFeedback(null)}
                className="flex-1 rounded-xl border border-border bg-surface-elevated py-2.5 text-xs font-bold text-body hover:bg-surface-hover transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 rounded-xl gradient-bg-signature py-2.5 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Submit & Complete
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Cancel Confirmation Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={!!showCancel}
        onClose={() => setShowCancel(null)}
        title="Cancel Interview"
      >
        <div className="space-y-4 font-satoshi">
          <p className="text-sm text-body">
            Are you sure you want to cancel this interview? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancel(null)}
              className="flex-1 rounded-xl border border-border bg-surface-elevated py-2.5 text-xs font-bold text-body hover:bg-surface-hover transition cursor-pointer"
            >
              Keep Interview
            </button>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Yes, Cancel Interview
            </button>
          </div>
        </div>
      </Modal>
    </RecruiterLayout>
  );
}
