/**
 * src/Pages/MyJobsPage.jsx
 *
 * User Candidate Workspace for My Jobs:
 * - Applied Jobs (live sync with applicationSlice / fetchMyApplicationsThunk)
 * - Saved Jobs (bookmarked jobs)
 * - Interviews (scheduled interview sessions)
 * - Offers (job offer letters & compensation)
 * - Professional Confirmation Modal for Application Withdrawals
 */

import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Bookmark,
  Calendar,
  Award,
  Search,
  Filter,
  Eye,
  Trash2,
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  Building2,
  FileText,
  XCircle,
  CheckCircle2,
  Star,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  Video,
  Phone,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { getCandidateInterviewsApi } from "../api/recruiterInterviewApi";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { fetchMyApplicationsThunk, withdrawApplicationThunk, updateApplicationStatusThunk } from "../State/applicationThunk";
import { fetchMySavedJobsThunk, unsaveJobThunk } from "../State/savedJobThunk";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { StatusChip } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal } from "../components/ui/Modal";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/ToastNotification";
import RecommendedJobsSection from "../components/recommendation/RecommendedJobsSection";

const parseDateRobust = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [year, month, day, hour = 0, minute = 0] = dateVal;
    const d = new Date(year, month - 1, day, hour, minute);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateVal === "object") {
    if (dateVal.year) {
      const d = new Date(
        dateVal.year,
        (dateVal.monthValue || 1) - 1,
        dateVal.dayOfMonth || 1,
        dateVal.hour || 0,
        dateVal.minute || 0
      );
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (dateVal) => {
  if (!dateVal) return "Recently";
  try {
    const d = parseDateRobust(dateVal);
    if (!d) return typeof dateVal === "string" ? dateVal : "Recently";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return typeof dateVal === "string" ? dateVal : "Recently";
  }
};

export default function MyJobsPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { myApplications } = useAppSelector((state) => state.application);
  const { savedJobs: liveSavedJobs } = useAppSelector((state) => state.savedJob);
  const { recommendations } = useAppSelector((state) => state.recommendations);

  // Determine active tab from URL path
  const getTabFromPath = (path) => {
    if (path.includes("/recommended")) return "recommended";
    if (path.includes("/saved")) return "saved";
    if (path.includes("/interviews")) return "interviews";
    if (path.includes("/offers")) return "offers";
    return "applied";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmAcceptOffer, setConfirmAcceptOffer] = useState(null);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);

  // ── Interview State ────────────────────────────────────────────────────────
  const [interviewList, setInterviewList] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewsError, setInterviewsError] = useState(null);

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const loadInterviews = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setInterviewsLoading(true);
    setInterviewsError(null);
    try {
      const { data } = await getCandidateInterviewsApi();
      setInterviewList(Array.isArray(data) ? data : []);
    } catch (err) {
      setInterviewsError(err?.userMessage ?? err?.response?.data?.message ?? "Failed to load interviews.");
      setInterviewList([]);
    } finally {
      if (showLoadingSpinner) setInterviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchMyApplicationsThunk());
    dispatch(fetchMySavedJobsThunk());
    loadInterviews(false);
  }, [dispatch, loadInterviews]);

  useEffect(() => {
    if (activeTab === "interviews") {
      loadInterviews(true);
    }
  }, [activeTab, loadInterviews]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/my-jobs/${tabId}`);
  };

  const toast = useToast();

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    const appId = withdrawTarget.id || withdrawTarget.applicationId;
    const title = withdrawTarget.jobTitle || withdrawTarget.job?.title || "Position";
    
    setWithdrawing(true);
    try {
      await dispatch(withdrawApplicationThunk(appId)).unwrap();
      toast.success(`Application for "${title}" withdrawn successfully.`);
      setWithdrawTarget(null);
    } catch (err) {
      toast.error(err || "Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await dispatch(unsaveJobThunk(jobId)).unwrap();
      toast.info("Job removed from saved bookmarks.");
    } catch (err) {
      toast.error(err || "Failed to unsave job.");
    }
  };

  const savedJobs = liveSavedJobs || [];

  // Offers — real data: applications with status OFFERED or ACCEPTED
  const offerList = (myApplications || []).filter((app) => {
    if (!app) return false;
    const s = typeof app.status === "string" ? app.status.toUpperCase() : (app.status?.name || "");
    return s === "OFFERED" || s === "ACCEPTED" || s === "OFFER";
  });

  const filteredApplications = (myApplications || []).filter((app) => {
    if (!app) return false;
    const title = typeof app.jobTitle === "string" ? app.jobTitle : app.job?.title || "";
    const company = typeof app.companyName === "string" ? app.companyName : (typeof app.company === "string" ? app.company : "");
    const status = typeof app.status === "string" ? app.status : (app.status?.name || "");
    const query = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query)
    );
  });

  const TABS_CONFIG = [
    { id: "applied", label: "Applied Jobs", count: myApplications?.length || 0 },
    { id: "recommended", label: "Recommended ✨", count: recommendations?.length || 0 },
    { id: "saved", label: "Saved Jobs", count: savedJobs?.length || 0 },
    { id: "interviews", label: "Interviews", count: interviewList?.length || 0 },
    { id: "offers", label: "Offers Received", count: offerList?.length || 0 },
  ];

  // ── Interview helpers ──────────────────────────────────────────────────────
  const formatInterviewDate = (dateVal) => {
    const d = parseDateRobust(dateVal);
    if (!d) return typeof dateVal === "string" ? dateVal : "—";
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      const iDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (iDay.getTime() === today.getTime()) return `Today, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      if (iDay.getTime() === tomorrow.getTime()) return `Tomorrow, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch {
      return typeof dateVal === "string" ? dateVal : "—";
    }
  };

  const formatInterviewTime = (start, end) => {
    const dStart = parseDateRobust(start);
    const dEnd = parseDateRobust(end);
    if (!dStart) return typeof start === "string" ? start : "—";
    const fmt = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return dEnd ? `${fmt(dStart)} – ${fmt(dEnd)}` : fmt(dStart);
  };

  const INTERVIEW_STATUS_STYLES = {
    SCHEDULED:   { bg: "bg-indigo-500/15", text: "text-indigo-400",  border: "border-indigo-500/25",  label: "Scheduled" },
    RESCHEDULED: { bg: "bg-amber-500/15",  text: "text-amber-400",   border: "border-amber-500/25",   label: "Rescheduled" },
    IN_PROGRESS: { bg: "bg-cyan-500/15",   text: "text-cyan-400",    border: "border-cyan-500/25",    label: "In Progress" },
    COMPLETED:   { bg: "bg-emerald-500/15",text: "text-emerald-400", border: "border-emerald-500/25", label: "Completed" },
    CANCELLED:   { bg: "bg-rose-500/15",   text: "text-rose-400",    border: "border-rose-500/25",    label: "Cancelled" },
    NO_SHOW:     { bg: "bg-slate-500/15",  text: "text-slate-400",   border: "border-slate-500/25",   label: "No Show" },
  };

  const ROUND_LABELS = {
    SCREENING: "Screening", TECHNICAL: "Technical", HR: "HR",
    SYSTEM_DESIGN: "System Design", FINAL: "Final Round", REFERENCE_CHECK: "Reference Check",
  };

  const getModeIcon = (mode) => {
    if (mode === "PHONE") return <Phone className="h-3.5 w-3.5" />;
    if (mode === "IN_PERSON") return <MapPin className="h-3.5 w-3.5" />;
    return <Video className="h-3.5 w-3.5" />;
  };

  return (
    <div className="min-h-screen bg-background text-body font-inter py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-2">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Career Pipeline Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-heading font-satoshi tracking-tight">
              My Job Applications
            </h1>
            <p className="mt-1 text-sm text-muted">
              Track status, scheduled interviews, and active job opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/find-jobs"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Browse New Jobs</span>
            </Link>
          </div>
        </div>

        {/* Global Pipeline Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <Card className="p-3 sm:p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted">Total Applied</span>
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold text-heading font-satoshi">{myApplications.length}</p>
          </Card>

          <Card className="p-3 sm:p-4 bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted">Saved Jobs</span>
              <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold text-heading font-satoshi">{savedJobs.length}</p>
          </Card>

          <Card className="p-3 sm:p-4 bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted">Interviews</span>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-500 dark:text-teal-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold text-heading font-satoshi">{interviewList.length}</p>
          </Card>

          <Card className="p-3 sm:p-4 bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-muted">Offers</span>
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-extrabold text-heading font-satoshi">{offerList.length}</p>
          </Card>
        </div>

        {/* Tab Selection & Search Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-4">
          <Tabs
            tabs={TABS_CONFIG}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, status…"
              className="w-full rounded-2xl border border-border bg-surface-hover pl-10 pr-4 py-2 text-xs text-heading placeholder:text-muted focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* TAB 1: APPLIED JOBS */}
        {activeTab === "applied" && (
          <div>
            {filteredApplications.length === 0 ? (
              <EmptyState
                title="No Applications Found"
                description={
                  searchQuery
                    ? "No applied jobs match your search query."
                    : "You haven't applied for any jobs yet. Start exploring open positions!"
                }
                action={
                  <Link
                    to="/find-jobs"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition"
                  >
                    <Search className="h-4 w-4" /> Explore Open Roles
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.map((app) => (
                  <Card key={app.id || app.applicationId} className="p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all group bg-surface border-border">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-black text-lg">
                            {(app.jobTitle || app.companyName || "J").charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-heading font-satoshi text-base">{app.jobTitle || "Job Position"}</h3>
                            <p className="text-xs text-muted">{app.companyName || "Company"}</p>
                          </div>
                        </div>
                        <StatusChip status={app.status || "APPLIED"} />
                      </div>

                      <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs text-muted">
                        <div className="flex items-center justify-between">
                          <span>Applied Date:</span>
                          <span className="font-medium text-heading">{formatDate(app.appliedAt || app.appliedDate || app.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Application ID:</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-300">#{app.id || app.applicationId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>

                      <button
                        onClick={() => setWithdrawTarget(app)}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Withdraw
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: RECOMMENDED JOBS */}
        {activeTab === "recommended" && (
          <RecommendedJobsSection showHeading={false} />
        )}

        {/* Tab 2: SAVED JOBS */}
        {activeTab === "saved" && (
          <div>
            {savedJobs.length === 0 ? (
              <EmptyState
                title="No Saved Jobs"
                description="You haven't bookmarked any jobs yet. Save jobs to apply later."
                action={
                  <Link
                    to="/find-jobs"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition"
                  >
                    <Search className="h-4 w-4" /> Explore Open Jobs
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobs.map((item) => {
                  const job = item.job || item;
                  const jobId = job.id || item.jobId || item.id;
                  const title = job.jobTitle || job.title || "Position";
                  const company = job.companyName || job.company || "Company";
                  const location = [job.city, job.state].filter(Boolean).join(", ") || job.location || "Remote";
                  const salary = job.minimumSalary ? `₹${job.minimumSalary.toLocaleString()} - ₹${job.maximumSalary.toLocaleString()}` : job.salary || "";

                  return (
                    <Card key={jobId} className="p-5 flex flex-col justify-between bg-surface border-border">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-heading font-satoshi text-lg">{title}</h3>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{company}</p>
                          </div>
                          <button
                            onClick={() => handleUnsaveJob(jobId)}
                            className="flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Unsave
                          </button>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs text-muted">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted" /> {location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-muted" /> {job.jobType || "Full Time"} {salary && `· ${salary}`}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                        <Link
                          to={`/jobs/${jobId}`}
                          className="text-xs font-semibold text-muted hover:text-heading transition"
                        >
                          View Job Details →
                        </Link>

                        <Link
                          to="/apply-jobs"
                          state={{ job }}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: INTERVIEWS — Real-time from /api/candidate/interviews */}
        {activeTab === "interviews" && (
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                {interviewsLoading ? "Loading interviews…" : `${interviewList.length} interview${interviewList.length !== 1 ? "s" : ""} scheduled`}
              </p>
              <button
                onClick={loadInterviews}
                disabled={interviewsLoading}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-hover px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface transition"
              >
                <RefreshCw className={`h-3 w-3 ${interviewsLoading ? "animate-spin text-indigo-500" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Loading skeleton */}
            {interviewsLoading && (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-2xl border border-border bg-surface p-6 animate-pulse h-36" />
                ))}
              </div>
            )}

            {/* Error state */}
            {!interviewsLoading && interviewsError && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-rose-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-heading">Failed to load interviews</p>
                  <p className="text-xs text-muted mt-1">{interviewsError}</p>
                  <button onClick={loadInterviews} className="mt-2 text-xs font-bold text-indigo-500 hover:underline">Try again →</button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!interviewsLoading && !interviewsError && interviewList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-teal-500" />
                </div>
                <h3 className="text-lg font-bold text-heading font-satoshi">No interviews scheduled yet</h3>
                <p className="text-sm text-muted max-w-xs">
                  Once a recruiter schedules an interview for your application, it will appear here with all details and a meeting link.
                </p>
                <Link to="/find-jobs" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow">
                  <Search className="h-4 w-4" /> Browse Jobs
                </Link>
              </div>
            )}

            {/* Interview cards */}
            {!interviewsLoading && !interviewsError && interviewList.map((iv, idx) => {
              const sc = INTERVIEW_STATUS_STYLES[iv.status] || INTERVIEW_STATUS_STYLES.SCHEDULED;
              const isActive = ["SCHEDULED", "RESCHEDULED", "IN_PROGRESS"].includes(iv.status);
              const upcomingActive = isActive && new Date(iv.scheduledAt) > new Date();

              return (
                <motion.div
                  key={iv.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-2xl border bg-surface p-5 sm:p-6 transition-all ${
                    upcomingActive ? "border-teal-500/40 shadow-md shadow-teal-500/10" : "border-border"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: info */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Top badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Round badge */}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/25 px-3 py-0.5 text-[11px] font-bold text-teal-600 dark:text-teal-300">
                          <Calendar className="h-3 w-3" />
                          {ROUND_LABELS[iv.interviewRound] || "Interview"}
                        </span>
                        {/* Status badge */}
                        <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold ${sc.bg} ${sc.text} ${sc.border}`}>
                          {iv.statusLabel || sc.label}
                        </span>
                        {/* Joinable badge */}
                        {iv.joinable && iv.meetingLink && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-0.5 text-[11px] font-bold text-emerald-500 dark:text-emerald-400 animate-pulse">
                            ● Live Now
                          </span>
                        )}
                      </div>

                      {/* Job title + company */}
                      <div>
                        <h3 className="text-lg font-extrabold text-heading font-satoshi truncate">
                          {iv.jobTitle || "Position"}
                        </h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          {iv.companyName || iv.recruiterName || "Company"}
                        </p>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-body">
                          <Calendar className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                          <span className="font-semibold">{formatInterviewDate(iv.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted">
                          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span>{formatInterviewTime(iv.scheduledAt, iv.endsAt)}
                            {iv.durationMinutes && <span className="text-muted ml-1">· {iv.durationMinutes} min</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted">
                          <span className="text-muted">{getModeIcon(iv.interviewMode)}</span>
                          <span>{iv.meetingPlatform || "Video Call"}</span>
                        </div>
                        {iv.interviewerName && (
                          <div className="flex items-center gap-2 text-muted">
                            <UserCheck className="h-3.5 w-3.5 text-muted shrink-0" />
                            <span>{iv.interviewerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Completed feedback */}
                      {iv.status === "COMPLETED" && iv.feedback && (
                        <div className="mt-2 rounded-xl border border-border bg-surface-hover p-3">
                          <p className="text-[11px] font-bold text-muted mb-1">Interview Feedback</p>
                          <p className="text-xs text-body leading-relaxed">{iv.feedback}</p>
                          {iv.candidateRating > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} className={`h-3.5 w-3.5 fill-current ${
                                  n <= iv.candidateRating ? "text-amber-400" : "text-border"
                                }`} />
                              ))}
                              <span className="text-[11px] text-muted ml-1">{iv.candidateRating}/5</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: CTA */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      {/* Join meeting button */}
                      {iv.meetingLink && isActive ? (
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition ${
                            iv.joinable
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20"
                              : "bg-gradient-to-r from-teal-700 to-teal-600"
                          }`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {iv.joinable ? "Join Now" : "Meeting Link"}
                        </a>
                      ) : iv.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      ) : iv.status === "CANCELLED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" /> Cancelled
                        </span>
                      ) : null}

                      {/* Application link */}
                      {iv.applicationId && (
                        <Link
                          to={`/my-jobs/applied`}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                        >
                          View Application →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab 4: OFFERS — Real data from myApplications (OFFERED / ACCEPTED) */}
        {activeTab === "offers" && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                {offerList.length === 0
                  ? "No offers yet"
                  : `${offerList.length} offer${offerList.length !== 1 ? "s" : ""} received`}
              </p>
              {offerList.length > 0 && (
                <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-0.5">
                  🎉 Congratulations!
                </span>
              )}
            </div>

            {/* Empty state */}
            {offerList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-heading font-satoshi">No offers yet</h3>
                <p className="text-sm text-muted max-w-xs">
                  Offers from recruiters will appear here once your application moves to the Offered stage. Keep applying!
                </p>
                <Link
                  to="/find-jobs"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition shadow"
                >
                  <Search className="h-4 w-4" /> Browse More Jobs
                </Link>
              </div>
            )}

            {/* Offer cards */}
            {offerList.map((offer, idx) => {
              const offerStatus = typeof offer.status === "string" ? offer.status.toUpperCase() : (offer.status?.name || "");
              const isAccepted = offerStatus === "ACCEPTED";

              const jobTitleText = typeof offer.jobTitle === "string" && offer.jobTitle.trim()
                ? offer.jobTitle
                : typeof offer.job?.jobTitle === "string"
                ? offer.job.jobTitle
                : typeof offer.job?.title === "string"
                ? offer.job.title
                : "Job Position";

              const companyNameText = typeof offer.companyName === "string" && offer.companyName.trim()
                ? offer.companyName
                : typeof offer.company === "string"
                ? offer.company
                : typeof offer.job?.companyName === "string"
                ? offer.job.companyName
                : typeof offer.job?.company?.companyName === "string"
                ? offer.job.company.companyName
                : "Company";

              const locationText = typeof offer.jobLocation === "string" && offer.jobLocation.trim()
                ? offer.jobLocation
                : [offer.job?.city, offer.job?.state, offer.job?.country].filter(Boolean).join(", ") || (typeof offer.job?.location === "string" ? offer.job.location : null);

              const workModeText = typeof offer.workMode === "string" && offer.workMode.trim()
                ? offer.workMode.replace(/_/g, " ")
                : typeof offer.job?.workMode === "string"
                ? offer.job.workMode.replace(/_/g, " ")
                : typeof offer.job?.workingMode === "string"
                ? offer.job.workingMode.replace(/_/g, " ")
                : null;

              const salaryText = (() => {
                const min = offer.minimumSalary || offer.job?.minimumSalary;
                const max = offer.maximumSalary || offer.job?.maximumSalary;
                if (!min && !max) {
                  if (typeof offer.salary === "string") return offer.salary;
                  if (typeof offer.job?.salary === "string") return offer.job.salary;
                  return null;
                }
                const numMin = Number(min);
                const numMax = Number(max);
                if (isNaN(numMin) && isNaN(numMax)) return null;
                const fmt = (n) => n >= 100000
                  ? `₹${(n / 100000).toFixed(1)}L`
                  : n >= 1000
                  ? `₹${(n / 1000).toFixed(0)}K`
                  : `₹${n}`;
                if (!isNaN(numMin) && !isNaN(numMax) && numMin > 0 && numMax > 0) return `${fmt(numMin)} – ${fmt(numMax)} / yr`;
                if (!isNaN(numMin) && numMin > 0) return `from ${fmt(numMin)} / yr`;
                if (!isNaN(numMax) && numMax > 0) return `up to ${fmt(numMax)} / yr`;
                return null;
              })();

              return (
                <motion.div
                  key={offer.id || offer.applicationId || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                    isAccepted
                      ? "border-emerald-500/40 bg-surface shadow-md shadow-emerald-500/10"
                      : "border-amber-500/40 bg-surface shadow-md shadow-amber-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left info */}
                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Status badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold ${
                          isAccepted
                            ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 border-amber-500/25 text-amber-600 dark:text-amber-400"
                        }`}>
                          <Award className="h-3 w-3" />
                          {isAccepted ? "Offer Accepted ✓" : "Offer Extended"}
                        </span>
                        {workModeText && (
                          <span className="inline-flex items-center rounded-full border border-border bg-surface-hover px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                            {workModeText}
                          </span>
                        )}
                      </div>

                      {/* Role + company */}
                      <div>
                        <h3 className="text-lg font-extrabold text-heading font-satoshi truncate">
                          {jobTitleText}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {companyNameText}
                          </p>
                          {locationText && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <MapPin className="h-3 w-3 text-muted" />
                              {locationText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Salary + timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        {salaryText && (
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-black font-satoshi ${
                              isAccepted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            }`}>{salaryText}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted">
                          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span>Applied {formatDate(offer.appliedAt || offer.appliedDate || offer.createdAt)}</span>
                        </div>
                        {(offer.updatedAt || offer.offerDate) && (
                          <div className="flex items-center gap-2 text-muted">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>Offer received {formatDate(offer.updatedAt || offer.offerDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right CTA */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      {isAccepted ? (
                        <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Offer Accepted
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmAcceptOffer(offer)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 hover:shadow-emerald-500/30 transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept Offer
                        </button>
                      )}
                      <Link
                        to="/my-jobs/applied"
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                      >
                        View Application →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          WITHDRAW CONFIRMATION ALERT MODAL (Ultra-Premium & Production Ready)
         ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(withdrawTarget)}
        onClose={() => !withdrawing && setWithdrawTarget(null)}
        title=""
        size="md"
      >
        {withdrawTarget && (
          <div className="p-6 text-center space-y-5">
            {/* Warning Icon Badge */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 shadow-xl shadow-rose-500/20">
              <AlertTriangle size={28} />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-black text-heading font-satoshi">
                Withdraw Job Application?
              </h3>
              <p className="text-xs sm:text-sm text-body leading-relaxed max-w-sm mx-auto">
                Are you sure you want to withdraw your application for{" "}
                <span className="font-bold text-heading">
                  {withdrawTarget.jobTitle || withdrawTarget.job?.title || "this position"}
                </span>{" "}
                at{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-300">
                  {typeof withdrawTarget.companyName === 'string'
                    ? withdrawTarget.companyName
                    : typeof withdrawTarget.company === 'string'
                    ? withdrawTarget.company
                    : (typeof withdrawTarget.job?.company === 'string'
                    ? withdrawTarget.job.company
                    : (withdrawTarget.job?.company?.companyName || withdrawTarget.job?.companyName || "the company"))}
                </span>?
              </p>
            </div>

            {/* Alert Callout Note */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-left text-xs text-rose-600 dark:text-rose-200 leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>
                <strong>Please Note:</strong> This action cannot be undone. The hiring recruiter will be notified of your withdrawal, and you will need to submit a new application if you change your mind.
              </span>
            </div>

            {/* Application Metadata Preview */}
            <div className="rounded-2xl border border-border bg-surface-hover p-3.5 text-xs text-muted text-left space-y-2">
              <div className="flex justify-between">
                <span>Application ID:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">
                  #{withdrawTarget.id || withdrawTarget.applicationId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Applied On:</span>
                <span className="text-heading font-semibold">
                  {formatDate(withdrawTarget.appliedAt || withdrawTarget.appliedDate || withdrawTarget.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={withdrawing}
                onClick={() => setWithdrawTarget(null)}
                className="h-11 rounded-xl border border-border bg-surface-hover text-xs font-bold text-body hover:bg-surface transition cursor-pointer disabled:opacity-50"
              >
                Keep Application
              </button>

              <button
                type="button"
                disabled={withdrawing}
                onClick={handleConfirmWithdraw}
                className="h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {withdrawing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Withdrawing…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Withdraw</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ACCEPT OFFER CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(confirmAcceptOffer)}
        onClose={() => !isAcceptingOffer && setConfirmAcceptOffer(null)}
        title="Accept Job Offer"
      >
        {confirmAcceptOffer && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-heading">
                  Confirm Offer Acceptance
                </p>
                <p className="text-muted leading-relaxed">
                  You are accepting the offer for{" "}
                  <span className="font-semibold text-heading">
                    {confirmAcceptOffer.jobTitle || confirmAcceptOffer.job?.title || "this position"}
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold text-heading">
                    {confirmAcceptOffer.companyName || confirmAcceptOffer.job?.companyName || "the company"}
                  </span>.
                  The hiring team will be updated directly.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptOffer(null)}
                disabled={isAcceptingOffer}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-body hover:bg-surface-hover transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const appId = confirmAcceptOffer.id || confirmAcceptOffer.applicationId;
                  if (!appId) return;
                  setIsAcceptingOffer(true);
                  try {
                    await dispatch(updateApplicationStatusThunk({ applicationId: appId, status: "ACCEPTED" })).unwrap();
                    await dispatch(fetchMyApplicationsThunk());
                    toast.success("Offer accepted! Congratulations on your new role.");
                    setConfirmAcceptOffer(null);
                  } catch (err) {
                    toast.error(err?.message || "Failed to update offer status. Please try again or reach out to the recruiter.");
                  } finally {
                    setIsAcceptingOffer(false);
                  }
                }}
                disabled={isAcceptingOffer}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer disabled:opacity-50"
              >
                {isAcceptingOffer && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm & Accept
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          APPLICATION DETAILS MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title="Application Details & Timeline"
        size="lg"
      >
        {selectedApp && (
          <div className="p-6 space-y-6">
            {/* Header with Title & Company */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-heading font-satoshi">
                  {selectedApp.jobTitle || "Job Position"}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{selectedApp.companyName || "Company Name"}</span>
                </p>
              </div>
              <StatusChip status={selectedApp.status || "APPLIED"} />
            </div>

            {/* Dynamic Application Pipeline */}
            {(() => {
              const currentStatus = (selectedApp.status || "APPLIED").toUpperCase();
              const isRejected = currentStatus === "REJECTED";
              const isWithdrawn = currentStatus === "WITHDRAWN";

              const STAGES = [
                {
                  id: "APPLIED",
                  label: "Application Submitted",
                  desc: "Your profile and resume were submitted successfully.",
                  icon: FileText,
                },
                {
                  id: "REVIEWING",
                  label: "Recruiter Review",
                  desc: "The hiring manager is reviewing your qualifications.",
                  icon: Eye,
                },
                {
                  id: "SHORTLISTED",
                  label: "Shortlisted",
                  desc: "Selected for the interview candidate pool.",
                  icon: Star,
                },
                {
                  id: "INTERVIEWING",
                  label: "Interviewing",
                  desc: "Interviews scheduled with hiring team.",
                  icon: Clock,
                },
                {
                  id: currentStatus === "ACCEPTED" ? "ACCEPTED" : "OFFERED",
                  label: currentStatus === "ACCEPTED" ? "Offer Accepted 🎉" : "Offer Extended 🏆",
                  desc: currentStatus === "ACCEPTED" ? "Congratulations! Onboarding in progress." : "Official job offer sent to candidate.",
                  icon: Award,
                },
              ];

              const statusOrder = ["APPLIED", "REVIEWING", "SHORTLISTED", "INTERVIEWING", "OFFERED", "ACCEPTED"];
              const activeIndex = statusOrder.indexOf(currentStatus);

              if (isRejected || isWithdrawn) {
                return (
                  <div className={`p-4 rounded-2xl border ${isRejected ? "border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-300" : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"} space-y-1.5`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{isRejected ? "Application Status: Not Selected" : "Application Status: Withdrawn"}</span>
                    </div>
                    <p className="text-xs text-body leading-relaxed">
                      {isRejected
                        ? "Thank you for taking the time to apply. The hiring team decided to proceed with other candidates whose experience aligns more closely with this specific role."
                        : "You withdrew your application for this position. If you have questions, contact candidate support."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold text-heading font-satoshi uppercase tracking-wider">
                      Application Progress Pipeline
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Stage {Math.max(1, activeIndex + 1)} of {STAGES.length}
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = activeIndex > idx || currentStatus === "ACCEPTED";
                      const isCurrent = activeIndex === idx && currentStatus !== "ACCEPTED";
                      const IconComp = stage.icon;

                      return (
                        <div key={stage.id} className="flex items-start gap-3 relative">
                          {/* Connector Line */}
                          {idx < STAGES.length - 1 && (
                            <div
                              className={`absolute left-4 top-8 bottom-0 w-0.5 -mb-4 transition-colors ${
                                isCompleted ? "bg-emerald-500" : "bg-border"
                              }`}
                            />
                          )}

                          {/* Node Icon */}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all z-10 ${
                              isCompleted
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : isCurrent
                                ? "border-amber-400 bg-amber-500/20 text-amber-500 dark:text-amber-300 ring-4 ring-amber-500/10 shadow-md shadow-amber-500/20"
                                : "border-border bg-surface-hover text-muted"
                            }`}
                          >
                            <IconComp className="h-4 w-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between">
                              <h5
                                className={`text-xs font-bold ${
                                  isCompleted
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isCurrent
                                    ? "text-amber-600 dark:text-amber-300"
                                    : "text-muted"
                                }`}
                              >
                                {stage.label}
                              </h5>
                              {isCurrent && (
                                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-300 animate-pulse">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{stage.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Details Grid */}
            <div className="rounded-2xl border border-border bg-surface-hover p-4 space-y-3">
              <h5 className="font-bold text-heading text-xs font-satoshi uppercase tracking-wider">
                Application Metadata
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-surface border border-border">
                  <span className="text-muted">Application ID:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">#{selectedApp.id || selectedApp.applicationId || "101"}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-xl bg-surface border border-border">
                  <span className="text-muted">Applied On:</span>
                  <span className="text-heading font-semibold">
                    {formatDate(selectedApp.appliedAt || selectedApp.appliedDate || selectedApp.createdAt)}
                  </span>
                </div>
              </div>

              {/* Cover letter section */}
              {selectedApp.coverLetter && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-body block mb-1.5">Submitted Cover Letter:</span>
                  <div className="p-3.5 rounded-xl bg-surface border border-border text-body leading-relaxed max-h-36 overflow-y-auto font-mono text-[11px]">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-xl border border-border bg-surface-hover px-5 py-2 text-xs font-bold text-body hover:bg-surface transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
