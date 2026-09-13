import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  CheckCircle2,
  Circle,
  Wifi,
  GraduationCap,
  Globe,
  Users,
  Building2,
  CalendarDays,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  X,
  Zap,
  Star,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { getJobById, getSimilarJobs } from "../State/JobSlice";
import { saveJobThunk, unsaveJobThunk, checkIsJobSavedThunk } from "../State/savedJobThunk";
import { useToast } from "../components/ui/ToastNotification";
import CandidateJobMatchWidget from "../components/recommendation/CandidateJobMatchWidget";
import { getAssetUrl } from "../utils/assetUtils";

/* ===========================
    Animation Variants
=========================== */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const cardHover = {
  y: -6,
  scale: 1.01,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

/* ===========================
    Helpers
=========================== */

/** Format a number into compact INR notation */
const formatINR = (n) => {
  if (n == null) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${Math.round(n / 1000)}K`;
  return `₹${n}`;
};

/** Compute "X ago" from an ISO date string */
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/** Compute days remaining until a date string like "2026-10-05" */
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  return days > 0 ? days : 0;
};

/** Normalise a value that may be a string OR an array into a string array */
const toList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const parts = String(val)
    .split(/\n+|(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [String(val).trim()];
};

/**
 * Normalise benefits:
 *  - array of { icon, label, desc } objects → returned as-is
 *  - plain string like "WFH, Medical Insurance." → split into simple items
 */
const parseBenefits = (benefits) => {
  if (!benefits) return [];
  if (Array.isArray(benefits)) return benefits;
  return String(benefits)
    .split(",")
    .map((b) => b.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((label) => ({ icon: CheckCircle2, label, desc: null }));
};

/** First two initials of a name */
const initials = (name) =>
  name
    ? name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?";

/** Convert SNAKE_CASE to Title Case */
const humanise = (str) =>
  str
    ? str.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

/* ===========================
    Share Modal Component
=========================== */

function ShareModal({ isOpen, onClose, jobTitle }) {
  const [copied, setCopied] = useState(false);
  const modalRef = React.useRef(null);
  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Job link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Focus trap: keep focus inside modal while open
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusableEls = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl  = focusableEls[focusableEls.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl?.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl?.focus(); }
      }
    };

    firstEl?.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Share ${jobTitle}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-border bg-surface-elevated p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-heading font-satoshi">Share This Job</h3>
              <button
                onClick={onClose}
                className="text-muted hover:text-heading transition-colors cursor-pointer"
                aria-label="Close share dialog"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-body mb-4">
              Share &ldquo;{jobTitle}&rdquo; with your network
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
              <span className="flex-1 truncate text-sm text-muted">
                {typeof window !== "undefined" ? window.location.href : ""}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-primary/25 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ===========================
    Section Divider Component
=========================== */

function SectionDivider() {
  return <div className="my-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />;
}

/* ===========================
    Similar Job Card
=========================== */

function SimilarJobCard({ job }) {
  const [logoError, setLogoError] = useState(false);

  const title      = job.jobTitle     ?? "";
  const company    = job.companyName  ?? "";
  const logo       = job.companyLogo  ?? null;
  const mode       = humanise(job.workingMode ?? "");
  const location   = [job.city, job.state].filter(Boolean).join(", ");
  const tags       = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];
  const salaryMin  = formatINR(job.minimumSalary);
  const salaryMax  = formatINR(job.maximumSalary);
  const salaryText =
    salaryMin && salaryMax
      ? `${salaryMin} – ${salaryMax}`
      : salaryMin ?? salaryMax ?? null;
  const type = humanise(job.jobType ?? "");

  return (
    <motion.div variants={listItem} whileHover={cardHover}>
      <Link
        to={`/jobs/${job.id}`}
        className="group block rounded-[20px] border border-border bg-surface p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-glow-primary"
      >
        {/* Top: logo + company */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated p-1.5">
            {logo && !logoError ? (
              <img
                src={getAssetUrl(logo)}
                alt={`${company} logo`}
                width={40}
                height={40}
                className="h-full w-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-primary">{initials(company)}</span>
            )}
          </div>
          <span className="text-sm text-muted">{company}</span>
          {job.featured && (
            <span className="ml-auto rounded-full bg-accent-warm/10 px-2.5 py-0.5 text-xs font-medium text-accent-warm">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-lg font-semibold text-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        {/* Location + Mode */}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-muted" />
              <span className="text-sm text-muted">{location}</span>
            </div>
          )}
          {mode && (
            <div className="flex items-center gap-1.5">
              <Wifi size={14} className="text-muted" />
              <span className="text-sm text-muted">{mode}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom: salary + apply */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex flex-col">
            {salaryText && (
              <span className="text-sm font-semibold text-heading">{salaryText}</span>
            )}
            {type && <span className="text-xs text-muted">{type}</span>}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full gradient-bg-signature px-5 py-2 text-sm font-semibold text-white">
            View Job
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ===========================
    Job Not Found
=========================== */

function JobNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen overflow-hidden bg-background font-inter text-body"
    >
      <div className="pointer-events-none fixed inset-0 mesh-gradient" />
      <div className="pointer-events-none fixed -top-20 right-0 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[160px]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="mb-6 rounded-full bg-danger/10 p-5">
          <Briefcase size={48} className="text-danger" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-heading font-satoshi">
          Job Not Found
        </h1>
        <p className="mt-4 max-w-md text-body text-base md:text-lg">
          The job listing you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          to="/find-jobs"
          className="mt-8 inline-flex items-center gap-2 rounded-full gradient-bg-signature px-8 py-3 text-sm font-semibold text-white hover:shadow-button transition-all"
        >
          <ArrowLeft size={16} />
          Browse All Jobs
        </Link>
      </div>
    </motion.div>
  );
}

/* ===========================
    Main JobDetail Component
=========================== */

function JobDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const dispatch = useAppDispatch();

  // All data comes from Redux
  const { selectedJob, similarJobs, loading } = useAppSelector((state) => state.job);
  const { isCurrentJobSaved } = useAppSelector((state) => state.savedJob);

  const saved = isCurrentJobSaved;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id) {
      const jobId = Number(id);
      dispatch(getJobById(jobId));
      dispatch(getSimilarJobs(jobId));
      dispatch(checkIsJobSavedThunk(jobId));
    }
  }, [id, dispatch]);

  const toast = useToast();

  const handleToggleSave = () => {
    if (!id) return;
    const jobId = Number(id);
    if (isCurrentJobSaved) {
      dispatch(unsaveJobThunk(jobId));
      toast.info("Job removed from saved bookmarks.");
    } else {
      dispatch(saveJobThunk(jobId));
      toast.success("Job bookmarked successfully!");
    }
  };

  // ── All hooks called. Conditional renders below are safe. ──

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center">
        <div className="pointer-events-none fixed inset-0 mesh-gradient" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted">Loading job details…</p>
        </div>
      </div>
    );
  }

  if (!selectedJob) return <JobNotFound />;

  // ── Derived / normalised values from the API response ──

  const jobTitle        = selectedJob.jobTitle        ?? "";
  const companyName     = selectedJob.companyName     ?? "";
  const companyLogo     = selectedJob.companyLogo     ?? null;
  const companyIndustry = selectedJob.companyIndustry ?? "";
  const companySize     = selectedJob.companySize     ?? null;
  const founded         = selectedJob.founded         ?? null;
  const website         = selectedJob.website         ?? null;

  const city    = selectedJob.city    ?? "";
  const state   = selectedJob.state   ?? "";
  const country = selectedJob.country ?? "";

  const workingMode     = selectedJob.workingMode     ?? "";
  const jobType         = selectedJob.jobType         ?? "";
  const experienceLevel = selectedJob.experienceLevel ?? "";
  const qualification   = selectedJob.qualification   ?? "";

  const salaryMin  = formatINR(selectedJob.minimumSalary);
  const salaryMax  = formatINR(selectedJob.maximumSalary);
  const salaryText =
    salaryMin && salaryMax
      ? `${salaryMin} – ${salaryMax}`
      : salaryMin ?? salaryMax ?? null;

  const totalApplicants = selectedJob.totalApplicants ?? 0;
  const postedAgo       = timeAgo(selectedJob.postedAt ?? selectedJob.createdAt);

  const deadlineDays =
    selectedJob.applicationDeadline != null
      ? typeof selectedJob.applicationDeadline === "number"
        ? selectedJob.applicationDeadline
        : daysUntil(selectedJob.applicationDeadline)
      : null;

  const descriptionList    = toList(selectedJob.description);
  const responsibilityList = toList(selectedJob.responsibilities);
  const requirementList    = toList(selectedJob.requirements);
  const niceToHaveList     = toList(selectedJob.preferredSkills);
  const benefitsList       = parseBenefits(selectedJob.benefits);
  const skillsRequired     = Array.isArray(selectedJob.skillsRequired)
    ? selectedJob.skillsRequired
    : [];

  const featured     = selectedJob.featured     ?? false;
  const urgentHiring = selectedJob.urgentHiring ?? false;
  const easyApply    = selectedJob.easyApply    ?? false;
  const vacancies    = selectedJob.vacancies    ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen overflow-hidden bg-background font-inter text-body"
    >
      {/* ===== Background Effects ===== */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 mesh-gradient" />
      <div aria-hidden="true" className="pointer-events-none fixed -top-20 right-0 h-[500px] w-[500px] rounded-full bg-primary/6 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet/4 blur-[200px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ===== Content ===== */}
      <div className="relative z-10">
        <div className="section-container pt-8 pb-32 sm:pt-10 lg:pb-20">

          {/* ===== Breadcrumb ===== */}
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-sm text-muted mb-8"
          >
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-muted/50" />
            <Link to="/find-jobs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Find Jobs</Link>
            <ChevronRight size={14} className="text-muted/50" />
            <span className="text-body truncate max-w-[200px] sm:max-w-none">{jobTitle}</span>
          </motion.nav>

          {/* ===== Job Header ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-[20px] border border-border bg-surface p-6 sm:p-8 mb-8"
          >
            {/* Company + Logo */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Logo — show image if available, otherwise initials */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-elevated p-2 shrink-0">
                  {companyLogo ? (
                    <img
                      src={getAssetUrl(companyLogo)}
                      alt={`${companyName} logo`}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">{initials(companyName)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted">{companyName}</span>
                    {featured && (
                      <span className="rounded-full bg-accent-warm/10 px-2.5 py-0.5 text-xs font-medium text-accent-warm">
                        Featured
                      </span>
                    )}
                    {urgentHiring && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
                        <Zap size={11} />
                        Urgent
                      </span>
                    )}
                    {easyApply && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                        <Star size={11} />
                        Easy Apply
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold text-heading font-satoshi leading-tight">
                    {jobTitle}
                  </h1>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-primary/30 transition-all cursor-pointer"
                  aria-label="Share job"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    saved
                      ? "border-indigo-300 dark:border-primary/30 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-indigo-300"
                      : "border-border bg-surface hover:bg-surface-elevated text-muted hover:text-heading hover:border-primary/20"
                  }`}
                >
                  {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => navigate("/apply-jobs", { state: { job: selectedJob } })}
                  className="inline-flex items-center gap-2 rounded-xl gradient-bg-signature h-11 px-8 text-sm font-semibold text-white shadow-button transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  Apply Now
                </button>
              </div>
            </div>

            {/* Tags Row */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {(city || state || country) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <MapPin size={13} className="text-indigo-600 dark:text-indigo-400" />
                  {[city, state, country].filter(Boolean).join(", ")}
                </span>
              )}
              {workingMode && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <Wifi size={13} className="text-accent" />
                  {humanise(workingMode)}
                </span>
              )}
              {jobType && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <Briefcase size={13} className="text-violet" />
                  {humanise(jobType)}
                </span>
              )}
              {experienceLevel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <GraduationCap size={13} className="text-indigo-600 dark:text-indigo-400" />
                  {humanise(experienceLevel)}
                </span>
              )}
              {postedAgo && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <Calendar size={13} className="text-accent-warm" />
                  Posted {postedAgo}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                <Users size={13} className="text-success" />
                {totalApplicants} {totalApplicants === 1 ? "applicant" : "applicants"}
              </span>
              {vacancies != null && vacancies > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <Building2 size={13} className="text-muted" />
                  {vacancies} {vacancies === 1 ? "vacancy" : "vacancies"}
                </span>
              )}
              {qualification && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs font-medium text-body">
                  <GraduationCap size={13} className="text-muted" />
                  {qualification}
                </span>
              )}
            </div>
          </motion.div>

          {/* ===== Two Column Layout ===== */}
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ===== Left Column: Main Content ===== */}
            <div className="flex-1 min-w-0">

              {/* — About This Role — */}
              {descriptionList.length > 0 && (
                <motion.section
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                    <span className="inline-flex h-8 w-1 rounded-full gradient-bg-signature" />
                    About This Role
                  </h2>
                  <div className="mt-5 space-y-4">
                    {descriptionList.map((paragraph, i) => (
                      <motion.p
                        key={i}
                        variants={fadeInUp}
                        custom={i}
                        className="text-body text-sm sm:text-base leading-7"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </motion.section>
              )}

              <SectionDivider />

              {/* — Key Responsibilities — */}
              {responsibilityList.length > 0 && (
                <motion.section
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                    <span className="inline-flex h-8 w-1 rounded-full gradient-bg-signature" />
                    Key Responsibilities
                  </h2>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="mt-5 space-y-3"
                  >
                    {responsibilityList.map((item, i) => (
                      <motion.li key={i} variants={listItem} className="flex items-start gap-3 group/item">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                        <span className="text-body text-sm sm:text-base leading-7 group-hover/item:text-heading transition-colors">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.section>
              )}

              <SectionDivider />

              {/* — Requirements — */}
              {requirementList.length > 0 && (
                <motion.section
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                    <span className="inline-flex h-8 w-1 rounded-full gradient-bg-signature" />
                    Requirements
                  </h2>
                  <motion.ul
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="mt-5 space-y-3"
                  >
                    {requirementList.map((item, i) => (
                      <motion.li key={i} variants={listItem} className="flex items-start gap-3 group/item">
                        <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-primary" />
                        <span className="text-body text-sm sm:text-base leading-7 group-hover/item:text-heading transition-colors">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.section>
              )}

              {/* — Preferred / Nice to Have — */}
              {niceToHaveList.length > 0 && (
                <>
                  <SectionDivider />
                  <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                      <span className="inline-flex h-8 w-1 rounded-full bg-accent/60" />
                      Nice to Have
                    </h2>
                    <motion.ul
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.1 }}
                      className="mt-5 space-y-3"
                    >
                      {niceToHaveList.map((item, i) => (
                        <motion.li key={i} variants={listItem} className="flex items-start gap-3 group/item">
                          <Circle size={14} className="mt-1 shrink-0 text-muted" />
                          <span className="text-muted text-sm sm:text-base leading-7 group-hover/item:text-body transition-colors">
                            {item}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.section>
                </>
              )}

              {/* — Benefits & Perks — */}
              {benefitsList.length > 0 && (
                <>
                  <SectionDivider />
                  <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                      <span className="inline-flex h-8 w-1 rounded-full gradient-bg-signature" />
                      Benefits &amp; Perks
                    </h2>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.1 }}
                      className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {benefitsList.map((benefit, i) => {
                        const Icon = benefit.icon ?? CheckCircle2;
                        return (
                          <motion.div
                            key={i}
                            variants={listItem}
                            className="group/perk flex items-start gap-4 rounded-xl border border-border bg-surface-elevated p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-glow-primary"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400 group-hover/perk:bg-indigo-100 dark:group-hover/perk:bg-primary/20 transition-colors">
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-heading">{benefit.label}</p>
                              {benefit.desc && (
                                <p className="mt-0.5 text-xs text-muted">{benefit.desc}</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.section>
                </>
              )}

              {/* — Required Skills — */}
              {skillsRequired.length > 0 && (
                <>
                  <SectionDivider />
                  <motion.section
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="rounded-[20px] border border-border bg-surface p-6 sm:p-8"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-heading font-satoshi flex items-center gap-3">
                      <span className="inline-flex h-8 w-1 rounded-full gradient-bg-signature" />
                      Required Skills
                    </h2>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.1 }}
                      className="mt-5 flex flex-wrap gap-3"
                    >
                      {skillsRequired.map((skill) => (
                        <motion.span
                          key={skill}
                          variants={listItem}
                          className="rounded-full border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-primary/25 hover:border-indigo-300 transition-all cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.section>
                </>
              )}
            </div>

            {/* ===== Right Column: Sidebar ===== */}
            <div className="w-full lg:w-[340px] shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">

                {/* — Match Fit Analysis Widget — */}
                <CandidateJobMatchWidget job={selectedJob} />

                {/* — Apply Card — */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="rounded-[20px] glass-strong gradient-border p-6"
                >
                  {/* Salary */}
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Annual Salary</p>
                    {salaryText ? (
                      <p className="text-2xl sm:text-3xl font-extrabold text-heading font-satoshi gradient-text">
                        {salaryText}
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-muted">Not disclosed</p>
                    )}
                    <p className="mt-1 text-xs text-muted">per year</p>
                  </div>

                  {/* Divider */}
                  <div className="my-5 h-px bg-border" />

                  {/* Apply Button */}
                  <button
                    onClick={() => navigate("/apply-jobs", { state: { job: selectedJob } })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl gradient-bg-signature h-11 sm:h-12 px-8 text-sm font-semibold text-white shadow-button transition-all cursor-pointer"
                  >
                    <Sparkles size={16} />
                    Apply Now
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleToggleSave}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all cursor-pointer ${
                      saved
                        ? "border-indigo-300 dark:border-primary/30 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-indigo-300"
                        : "border-border text-muted hover:border-primary/20 hover:text-heading"
                    }`}
                  >
                    {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {saved ? "Job Saved" : "Save Job"}
                  </button>

                  {/* Closing Deadline */}
                  {deadlineDays != null && (
                    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent-warm/5 border border-accent-warm/10 px-4 py-2.5">
                      <CalendarDays size={14} className="text-accent-warm" />
                      <span className="text-xs font-medium text-accent-warm">
                        {deadlineDays > 0
                          ? `Applications close in ${deadlineDays} day${deadlineDays === 1 ? "" : "s"}`
                          : "Application deadline passed"}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* — Quick Info Card — */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.28 }}
                  className="rounded-[20px] border border-border bg-surface p-5 sm:p-6"
                >
                  <h3 className="text-sm font-bold text-heading font-satoshi mb-4">Job Details</h3>
                  <div className="space-y-3">
                    {experienceLevel && (
                      <div className="flex items-center gap-3">
                        <GraduationCap size={15} className="text-muted shrink-0" />
                        <div>
                          <p className="text-xs text-muted">Experience Level</p>
                          <p className="text-sm font-medium text-body">{humanise(experienceLevel)}</p>
                        </div>
                      </div>
                    )}
                    {selectedJob.minimumExperience != null &&
                      selectedJob.maximumExperience != null && (
                        <div className="flex items-center gap-3">
                          <Clock size={15} className="text-muted shrink-0" />
                          <div>
                            <p className="text-xs text-muted">Experience Required</p>
                            <p className="text-sm font-medium text-body">
                              {selectedJob.minimumExperience} – {selectedJob.maximumExperience} years
                            </p>
                          </div>
                        </div>
                      )}
                    {qualification && (
                      <div className="flex items-center gap-3">
                        <GraduationCap size={15} className="text-muted shrink-0" />
                        <div>
                          <p className="text-xs text-muted">Qualification</p>
                          <p className="text-sm font-medium text-body">{qualification}</p>
                        </div>
                      </div>
                    )}
                    {selectedJob.numberOfInterviewRounds != null && (
                      <div className="flex items-center gap-3">
                        <Users size={15} className="text-muted shrink-0" />
                        <div>
                          <p className="text-xs text-muted">Interview Rounds</p>
                          <p className="text-sm font-medium text-body">
                            {selectedJob.numberOfInterviewRounds}{" "}
                            {selectedJob.numberOfInterviewRounds === 1 ? "round" : "rounds"}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedJob.status && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={15} className="text-success shrink-0" />
                        <div>
                          <p className="text-xs text-muted">Status</p>
                          <p className="text-sm font-medium text-success">
                            {humanise(selectedJob.status)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* — Company Info Card — */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="rounded-[20px] border border-border bg-surface p-5 sm:p-6"
                >
                  {/* Logo + Name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated p-2 shrink-0">
                      {companyLogo ? (
                        <img
                          src={getAssetUrl(companyLogo)}
                          alt={`${companyName} logo`}
                          width={32}
                          height={32}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">{initials(companyName)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-heading font-satoshi">{companyName}</h3>
                      {companyIndustry && (
                        <span className="text-xs text-muted">{companyIndustry}</span>
                      )}
                    </div>
                  </div>

                  {/* Company Details — shown only when present in API response */}
                  <div className="space-y-4">
                    {companySize && (
                      <div className="flex items-center gap-3">
                        <Building2 size={16} className="text-muted" />
                        <div>
                          <p className="text-xs text-muted">Company Size</p>
                          <p className="text-sm font-medium text-body">{companySize} employees</p>
                        </div>
                      </div>
                    )}
                    {founded && (
                      <div className="flex items-center gap-3">
                        <CalendarDays size={16} className="text-muted" />
                        <div>
                          <p className="text-xs text-muted">Founded</p>
                          <p className="text-sm font-medium text-body">{founded}</p>
                        </div>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-muted" />
                        <div>
                          <p className="text-xs text-muted">Website</p>
                          <a
                            href={website.startsWith("http") ? website : `https://${website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          >
                            {website}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedJob.recruiterName && (
                      <div className="flex items-center gap-3">
                        <Users size={16} className="text-muted" />
                        <div>
                          <p className="text-xs text-muted">Recruiter</p>
                          <p className="text-sm font-medium text-body">{selectedJob.recruiterName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-5 h-px bg-border" />

                  {/* View All Jobs */}
                  <Link
                    to={`/company/${selectedJob.companyId}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface hover:bg-surface-elevated py-2.5 text-sm font-semibold text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-primary/20 transition-all"
                  >
                    View all jobs from {companyName}
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ===== Similar Jobs Section — data from Redux (backend) ===== */}
          {Array.isArray(similarJobs) && similarJobs.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="mt-16 lg:mt-24"
            >
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 px-6 py-2">
                  <span className="h-px w-6 bg-indigo-300 dark:bg-primary/40" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    You Might Also Like
                  </span>
                  <span className="h-px w-6 bg-indigo-300 dark:bg-primary/40" />
                </div>
                <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-heading font-satoshi leading-tight">
                  Similar <span className="gradient-text">Jobs</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-body text-sm sm:text-base md:text-lg leading-8">
                  Explore more opportunities that match your profile and interests.
                </p>
              </motion.div>

              {/* Similar Job Cards */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {similarJobs.map((sJob) => (
                  <SimilarJobCard key={sJob.id} job={sJob} />
                ))}
              </motion.div>
            </motion.section>
          )}
        </div>
      </div>

      {/* ===== Mobile Sticky Apply Bar ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div
          className="border-t border-border bg-surface/95 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center gap-2.5 max-w-md mx-auto">
            <button
              onClick={handleToggleSave}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                saved
                  ? "border-indigo-300 dark:border-primary/30 bg-indigo-50 dark:bg-primary/10 text-indigo-700 dark:text-indigo-300"
                  : "border-border bg-surface hover:bg-surface-elevated text-muted"
              }`}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-elevated text-muted hover:text-heading transition-colors cursor-pointer"
              aria-label="Share job"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => navigate("/apply-jobs", { state: { job: selectedJob } })}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl gradient-bg-signature h-11 px-5 text-sm font-bold text-white shadow-button transition-all cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Apply Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Share Modal ===== */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        jobTitle={jobTitle}
      />
    </motion.div>
  );
}

export default JobDetail;
