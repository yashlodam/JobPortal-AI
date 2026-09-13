/**
 * src/components/recommendation/RecommendedJobsSection.jsx
 *
 * Applicant-facing Personalized Job Recommendations feed.
 * Synced with updated backend API response shape:
 *  - matchedSkills         → matched required skills
 *  - missingSkills         → missing required skills
 *  - matchedPreferredSkills → preferred skills candidate has (bonus)
 *  - skillMatchScore       → 0-100
 *  - experienceMatchScore  → 0-100
 *  - locationMatchScore    → 0-100
 *  - freshnessScore        → 0-100 (new)
 *  - matchReason           → human-readable string
 *  - matchGrade            → EXCELLENT / GREAT / GOOD / FAIR / LOW
 */

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Briefcase,
  MapPin,
  Building2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  ArrowRight,
  RefreshCw,
  Zap,
  Plus,
  Check,
  Clock,
  Target,
  Award,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../State/Store";
import { fetchRecommendations, toggleSavedOptimistic } from "../../State/recommendationSlice";
import { saveJobThunk, unsaveJobThunk } from "../../State/savedJobThunk";
import { updateSkillsThunk } from "../../State/profileThunk";
import { useToast } from "../ui/ToastNotification";
import { getAssetUrl } from "../../utils/assetUtils";

const POPULAR_SKILLS = [
  "Java",
  "Spring Boot",
  "React",
  "Python",
  "Node.js",
  "AWS",
  "SQL",
  "Docker",
  "TypeScript",
  "Next.js",
  "Kubernetes",
  "DevOps",
];

// ── Grade helpers ──────────────────────────────────────────────────────────────

function getMatchColors(percentage) {
  if (percentage >= 85)
    return {
      bg: "bg-emerald-500/15",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/30",
      bar: "bg-emerald-500",
      badgeBg: "bg-emerald-500",
      badgeText: "text-white",
    };
  if (percentage >= 70)
    return {
      bg: "bg-indigo-50 dark:bg-primary/15",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-primary/30",
      bar: "bg-primary",
      badgeBg: "bg-primary",
      badgeText: "text-white",
    };
  if (percentage >= 55)
    return {
      bg: "bg-cyan-500/15",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/30",
      bar: "bg-cyan-500",
      badgeBg: "bg-cyan-500",
      badgeText: "text-white",
    };
  if (percentage >= 35)
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      bar: "bg-amber-500",
      badgeBg: "bg-amber-500",
      badgeText: "text-white",
    };
  return {
    bg: "bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    bar: "bg-rose-500",
    badgeBg: "bg-rose-500",
    badgeText: "text-white",
  };
}

function ScoreBar({ label, value, colorClass }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted font-semibold">{label}</span>
        <span className={`font-black ${colorClass || "text-heading"}`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RecommendedJobsSection({
  limit = 20,
  initialDisplayCount = 10,
  stepCount = 4,
  showHeading = true,
  showViewAllButton = true,
  viewAllLink = "/find-jobs?feed=recommended",
  className = "",
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { recommendations, loading } = useAppSelector((s) => s.recommendations);
  const { profile: authUser } = useAppSelector((s) => s.auth);
  const { profile: userProfile } = useAppSelector((s) => s.profile);

  const [minMatch, setMinMatch]       = useState(0);
  const [easyApplyOnly, setEasyApply] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [addingSkill, setAddingSkill] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(initialDisplayCount);

  const candidateSkills = (userProfile?.skills || authUser?.skills || []).map((s) =>
    typeof s === "string" ? s.trim() : (s.name || "").trim()
  );

  useEffect(() => {
    dispatch(fetchRecommendations({ limit, minMatch }));
  }, [dispatch, limit, minMatch]);

  // Reset display limit when filter or initialDisplayCount changes
  useEffect(() => {
    setDisplayLimit(initialDisplayCount);
  }, [initialDisplayCount, minMatch, easyApplyOnly]);

  const handleRefresh = () => {
    setDisplayLimit(initialDisplayCount);
    dispatch(fetchRecommendations({ limit, minMatch }));
  };

  const handleQuickAddSkill = async (skillName) => {
    if (candidateSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      toast.info(`"${skillName}" is already in your profile.`);
      return;
    }
    setAddingSkill(skillName);
    try {
      await dispatch(updateSkillsThunk({ skills: [...candidateSkills, skillName] })).unwrap();
      toast.success(`Added "${skillName}"! Recalculating…`);
      dispatch(fetchRecommendations({ limit, minMatch }));
    } catch {
      toast.error("Failed to add skill. Try from Profile page.");
    } finally {
      setAddingSkill(null);
    }
  };

  // Use the backend-returned `saved` field as the source of truth
  const handleToggleSave = async (e, job) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadySaved = job.saved;
    // Optimistic update — flip the saved badge instantly
    dispatch(toggleSavedOptimistic(job.id));
    try {
      if (alreadySaved) {
        await dispatch(unsaveJobThunk(job.id)).unwrap();
        toast.info(`Removed "${job.jobTitle}" from saved jobs`);
      } else {
        await dispatch(saveJobThunk(job.id)).unwrap();
        toast.success(`Saved "${job.jobTitle}" to bookmarks`);
      }
    } catch (err) {
      // Revert optimistic update on failure
      dispatch(toggleSavedOptimistic(job.id));
      toast.error(err || "Failed to update saved job");
    }
  };

  const easyApplyCount = useMemo(
    () => recommendations.filter((j) => Boolean(j.easyApply)).length,
    [recommendations]
  );

  // Apply front-end EasyApply filter on top of backend results
  const filteredRecs = easyApplyOnly
    ? recommendations.filter((j) => Boolean(j.easyApply))
    : recommendations;

  const visibleRecs  = filteredRecs.slice(0, displayLimit);
  const hasMore      = displayLimit < filteredRecs.length;

  return (
    <div className={`space-y-6 font-inter text-body ${className}`}>

      {/* ── Section Header ──────────────────────────────────────────────────── */}
      {showHeading && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-primary/10 border border-indigo-200 dark:border-primary/20 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Personalized Career Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-heading font-satoshi tracking-tight">
              Recommended Jobs for You
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Ranked by skill fit, experience, location, title affinity &amp; posting freshness.
              {filteredRecs.length > 0 && (
                <span className="ml-2 font-bold text-primary">{filteredRecs.length} match{filteredRecs.length !== 1 ? "es" : ""} found</span>
              )}
            </p>
          </div>

          {/* Filters, View All Link & Refresh */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Direct link to full recommended feed in Find Jobs */}
            {showViewAllButton && filteredRecs.length > 0 && (
              <Link
                to={viewAllLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-primary/30 bg-indigo-50/70 dark:bg-primary/10 hover:bg-indigo-100/70 transition-all cursor-pointer shadow-xs"
              >
                <span>Explore All ({filteredRecs.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            {/* EasyApply toggle */}
            <button
              onClick={() => setEasyApply((v) => !v)}
              title={easyApplyOnly ? "Show all jobs" : "Filter by Easy Apply"}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                easyApplyOnly
                  ? "gradient-bg-signature text-white border-transparent shadow-button scale-[1.02]"
                  : "border-border bg-surface text-muted hover:text-heading hover:bg-surface-hover"
              }`}
            >
              <Zap className={`h-3.5 w-3.5 ${easyApplyOnly ? "fill-white text-white" : ""}`} />
              <span>Easy Apply</span>
              {easyApplyCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    easyApplyOnly ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {easyApplyCount}
                </span>
              )}
            </button>

            {/* Min-match filter pills */}
            <div className="flex items-center rounded-2xl bg-surface border border-border p-1 text-xs">
              {[
                { label: "All", value: 0 },
                { label: "50%+ Fit", value: 50 },
                { label: "75%+ Top", value: 75 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMinMatch(opt.value)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    minMatch === opt.value
                      ? "gradient-bg-signature text-white shadow-button"
                      : "text-muted hover:text-heading hover:bg-surface-hover"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh recommendations"
              className="p-2.5 rounded-2xl bg-surface border border-border text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>
      )}



      {/* ── Quick-Skill Onboarding (new users with ≤ 2 skills) ──────────────── */}
      {candidateSkills.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-primary/25 bg-surface p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-heading font-satoshi">
                  ✨ Quick Start: Select your top skills to unlock instant matches
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Click any skill below to add it and immediately recalculate your match scores.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 self-start sm:self-auto shrink-0"
            >
              <span>Full Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = candidateSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              const isAdding = addingSkill === skill;
              return (
                <button
                  key={skill}
                  onClick={() => handleQuickAddSkill(skill)}
                  disabled={isSelected || isAdding}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 cursor-default font-bold"
                      : "border-border bg-surface-elevated text-heading hover:bg-primary/10 hover:border-primary/40 hover:text-primary shadow-xs cursor-pointer"
                  }`}
                >
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isAdding ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-muted" />
                  )}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && recommendations.length === 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${limit > 4 ? "xl:grid-cols-3" : "xl:grid-cols-2"} gap-5`}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-border bg-surface p-5 space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-surface-elevated" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded bg-surface-elevated" />
                    <div className="h-3 w-28 rounded bg-surface-elevated/60" />
                  </div>
                </div>
                <div className="h-8 w-16 rounded-full bg-surface-elevated" />
              </div>
              <div className="h-12 rounded-xl bg-surface-elevated/50" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-surface-elevated" />
                <div className="h-6 w-24 rounded-full bg-surface-elevated" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!loading && filteredRecs.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
            <Zap className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-extrabold text-heading font-satoshi">
            {easyApplyOnly
              ? "No Easy Apply Jobs Found"
              : minMatch > 0
              ? "No Jobs Matching Filter"
              : "Explore Active Opportunities"}
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed font-medium">
            {easyApplyOnly
              ? "None of your recommended jobs have Easy Apply enabled right now. Try disabling the filter."
              : minMatch > 0
              ? `No jobs reached the ${minMatch}% match threshold. Try resetting to "All Matches".`
              : "Select 3+ skills in the quick-start banner above to unlock instant job matching."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {easyApplyOnly && (
              <button
                onClick={() => setEasyApply(false)}
                className="gradient-bg-signature rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-button transition hover:scale-105 cursor-pointer"
              >
                Show All Jobs
              </button>
            )}
            {minMatch > 0 && !easyApplyOnly && (
              <button
                onClick={() => setMinMatch(0)}
                className="gradient-bg-signature rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-button transition hover:scale-105 cursor-pointer"
              >
                Reset to All Matches
              </button>
            )}
            {minMatch > 0 && easyApplyOnly && (
              <button
                onClick={() => {
                  setMinMatch(0);
                  setEasyApply(false);
                }}
                className="gradient-bg-signature rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-button transition hover:scale-105 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
            <Link
              to="/find-jobs"
              className="rounded-xl border border-border bg-surface-elevated px-5 py-2.5 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      )}

      {/* ── Recommendations Grid ──────────────────────────────────────────────── */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          limit > 4 ? "xl:grid-cols-3" : "xl:grid-cols-2"
        } gap-5 transition-opacity duration-200 ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}
      >
        {visibleRecs.map((job, idx) => {
          const colors = getMatchColors(job.matchPercentage);
          // Use the backend-provided `saved` field directly — no local list check needed
          const isSaved = job.saved;
          const logoUrl = job.companyLogo ? getAssetUrl(job.companyLogo) : null;

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-glow-primary transition-all p-5 shadow-sm"
            >
              <div className="space-y-3.5">
                {/* Company Logo + Title + Match Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={job.companyName}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-heading text-base hover:text-primary transition truncate block font-satoshi"
                      >
                        {job.jobTitle}
                      </Link>
                      <p className="text-xs text-muted truncate mt-0.5 font-medium">
                        {job.companyName || "Verified Company"}
                      </p>
                    </div>
                  </div>

                  {/* Match Badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-black text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{job.matchPercentage}% Fit</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted mt-1 uppercase tracking-wider">
                      {job.matchGrade}
                    </span>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-body">
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 border border-border text-muted">
                    <MapPin className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    {job.workingMode === "REMOTE"
                      ? "Remote"
                      : job.city
                      ? `${job.city}${job.state ? `, ${job.state}` : ""}`
                      : "Flexible"}
                  </span>

                  {job.workingMode && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 border border-border font-semibold text-body">
                      {job.workingMode}
                    </span>
                  )}

                  {job.minimumSalary && job.maximumSalary && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 border border-emerald-500/20 font-semibold">
                      ₹{(job.minimumSalary / 100000).toFixed(1)}–{(job.maximumSalary / 100000).toFixed(1)} LPA
                    </span>
                  )}

                  {job.urgentHiring && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-300 px-2 py-0.5 border border-rose-500/30 text-[10px] font-extrabold uppercase">
                      <Flame className="h-3 w-3 text-rose-500 fill-rose-500/20" /> Urgent
                    </span>
                  )}

                  {job.featured && !job.urgentHiring && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-300 px-2 py-0.5 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500/20" /> Featured
                    </span>
                  )}
                </div>

                {/* Why Recommended Banner */}
                {job.matchReason && (
                  <div className="rounded-xl bg-primary/[0.04] border border-primary/10 px-3 py-2 text-[11px] text-body flex items-center justify-between gap-2">
                    <span className="truncate">
                      💡 <strong className="text-heading font-bold">Why:</strong> {job.matchReason}
                    </span>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 shrink-0 underline ml-1 cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                )}

                {/* Matched Required Skills */}
                {job.matchedSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase text-muted tracking-wider mr-1">
                      Matched:
                    </span>
                    {job.matchedSkills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                        {skill}
                      </span>
                    ))}
                    {job.matchedSkills.length > 4 && (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-[10px] font-bold text-muted hover:text-heading transition cursor-pointer"
                      >
                        +{job.matchedSkills.length - 4} more
                      </button>
                    )}
                  </div>
                )}

                {/* Matched Preferred Skills (bonus) */}
                {job.matchedPreferredSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted tracking-wider mr-1">
                      Bonus:
                    </span>
                    {job.matchedPreferredSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-primary/10 border border-indigo-200 dark:border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300"
                      >
                        <Star className="h-2.5 w-2.5 text-primary" />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Missing Skills */}
                {job.missingSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-muted tracking-wider mr-1">
                      Missing:
                    </span>
                    {job.missingSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400"
                      >
                        <XCircle className="h-2.5 w-2.5 text-rose-500" />
                        {skill}
                      </span>
                    ))}
                    {job.missingSkills.length > 3 && (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-[10px] font-bold text-muted hover:text-heading transition cursor-pointer"
                      >
                        +{job.missingSkills.length - 3} more
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-3">
                <button
                  onClick={(e) => handleToggleSave(e, job)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    isSaved
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20"
                      : "border-border bg-surface-elevated text-body hover:bg-surface-hover hover:text-heading"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5 text-amber-500" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5 text-muted" />
                      <span>Save</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/jobs/${job.id}`}
                  className="gradient-bg-signature inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-button hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Action Bar Below Grid ─────────────────────────────────────────────── */}
      {!loading && filteredRecs.length > 0 && (
        <div className="pt-6 flex flex-col items-center justify-center gap-3">
          {hasMore ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setDisplayLimit((prev) => prev + stepCount)}
                className="inline-flex items-center gap-2 rounded-2xl gradient-bg-signature px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-button hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>View More Recommended Jobs</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black">
                  +{Math.min(stepCount, filteredRecs.length - displayLimit)}
                </span>
              </button>

              {showViewAllButton && (
                <Link
                  to={viewAllLink}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-5 py-3.5 text-xs sm:text-sm font-bold text-heading hover:bg-surface-hover hover:border-primary/40 transition-all shadow-xs"
                >
                  <span>Explore All {filteredRecs.length} in Find Jobs</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center text-xs text-muted">
              <span>You're viewing all {filteredRecs.length} personalized recommendations.</span>
              {showViewAllButton && (
                <Link
                  to={viewAllLink}
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Open Full Discovery Feed</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Match Breakdown Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-body"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-primary/10 border border-indigo-200 dark:border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Match Scoring Breakdown
                  </div>
                  <h3 className="text-lg font-bold text-heading font-satoshi leading-tight">
                    {selectedJob.jobTitle}
                  </h3>
                  <p className="text-xs text-muted mt-0.5 font-medium">{selectedJob.companyName}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Overall Score */}
              {(() => {
                const c = getMatchColors(selectedJob.matchPercentage);
                return (
                  <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 text-center space-y-1`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      Overall Match
                    </p>
                    <p className={`text-4xl font-black font-satoshi ${c.text}`}>
                      {selectedJob.matchPercentage}%
                    </p>
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${c.badgeBg} ${c.badgeText}`}
                    >
                      {selectedJob.matchGrade}
                    </span>
                  </div>
                );
              })()}

              {/* Score Breakdown Bars (4 dimensions) */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-heading uppercase tracking-wider font-satoshi">
                  Score Breakdown
                </p>
                <ScoreBar label="Skill Match (55% weight)" value={selectedJob.skillMatchScore ?? 0} />
                <ScoreBar label="Location Fit (25% weight)" value={selectedJob.locationMatchScore ?? 0} />
                <ScoreBar label="Experience Fit (15% weight)" value={selectedJob.experienceMatchScore ?? 0} />
                <ScoreBar label="Job Freshness (5% weight)" value={selectedJob.freshnessScore ?? 0} />
              </div>

              {/* Matched Required Skills */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-heading flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Matched Required Skills
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {selectedJob.matchedSkills?.length > 0 ? (
                    selectedJob.matchedSkills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted italic">No exact required skill matches</span>
                  )}
                </div>
              </div>

              {/* Matched Preferred Skills */}
              {selectedJob.matchedPreferredSkills?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-heading flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-primary" />
                    Preferred Skills You Have (Bonus)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.matchedPreferredSkills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-indigo-50 dark:bg-primary/15 border border-indigo-200 dark:border-primary/30 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Required Skills */}
              {selectedJob.missingSkills?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    Skills to Learn for This Role
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {selectedJob.missingSkills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Recommended */}
              {selectedJob.matchReason && (
                <div className="rounded-xl bg-surface-elevated border border-border px-4 py-3 text-xs text-body leading-relaxed">
                  💡 <strong className="text-heading">Why recommended:</strong> {selectedJob.matchReason}
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl border border-border bg-surface-elevated px-4 py-2 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                >
                  Close
                </button>
                <Link
                  to={`/jobs/${selectedJob.id}`}
                  onClick={() => setSelectedJob(null)}
                  className="gradient-bg-signature rounded-xl px-5 py-2 text-xs font-bold text-white shadow-button transition hover:scale-105"
                >
                  Apply to Job
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
