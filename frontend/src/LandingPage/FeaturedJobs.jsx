/**
 * src/LandingPage/FeaturedJobs.jsx
 *
 * Ultra-Premium "Featured Jobs" Section.
 * Features 3D glassmorphic cards, gold Sparkles badges, Redux bookmark syncing,
 * and reliable fallback to curated job listings so the section ALWAYS displays 6 cards.
 */

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Bookmark, BookmarkCheck, Sparkles, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { getAllJobs, getFeaturedJobs } from "../State/JobSlice";
import { saveJobThunk, unsaveJobThunk } from "../State/savedJobThunk";
import { useTheme } from "../context/ThemeContext";
import { getAssetUrl } from "../utils/assetUtils";

/* ===========================
   Animation Variants
=========================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ===========================
   Working Mode Badges
=========================== */
const modeBadge = {
  REMOTE: { bg: "rgba(6, 182, 212, 0.15)", text: "#22D3EE", lightText: "#0891B2", lightBg: "rgba(6, 182, 212, 0.10)", border: "rgba(6, 182, 212, 0.30)", label: "Remote" },
  HYBRID: { bg: "rgba(139, 92, 246, 0.15)", text: "#A78BFA", lightText: "#7C3AED", lightBg: "rgba(139, 92, 246, 0.10)", border: "rgba(139, 92, 246, 0.30)", label: "Hybrid" },
  ON_SITE: { bg: "rgba(245, 158, 11, 0.15)", text: "#FBBF24", lightText: "#D97706", lightBg: "rgba(245, 158, 11, 0.10)", border: "rgba(245, 158, 11, 0.30)", label: "On Site" },
  ONSITE: { bg: "rgba(245, 158, 11, 0.15)", text: "#FBBF24", lightText: "#D97706", lightBg: "rgba(245, 158, 11, 0.10)", border: "rgba(245, 158, 11, 0.30)", label: "On Site" },
};

/* ===========================
   JobCard Component
=========================== */
function JobCard({ job }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { savedJobIds } = useAppSelector((state) => state.savedJob);
  const isSaved = savedJobIds.includes(Number(job.id));

  const badge = modeBadge[job.workingMode] || modeBadge.REMOTE;

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "JB";

  const formatSalary = (min, max, currency = "₹") => {
    if (!min && !max) return "Competitive CTC";
    const symbol = currency === "USD" ? "$" : "₹";
    const fmt = (val) =>
      typeof val === "number" ? `${symbol}${val.toLocaleString("en-IN")}` : `${symbol}${val}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return "Competitive CTC";
  };

  const skills = Array.isArray(job.skillsRequired)
    ? job.skillsRequired
    : Array.isArray(job.skills)
    ? job.skills
    : [];

  const location = [job.city, job.state].filter(Boolean).join(", ") || job.country || job.location || "Remote";
  const companyName = job.companyName || job.company || "Hiring Company";
  const jobTitle = job.jobTitle || job.title || "Software Engineer";
  const isFeatured = Boolean(job.featured || job.status === "FEATURED" || job.jobStatus === "FEATURED");

  const handleToggleBookmark = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!job.id) return;
    if (isSaved) {
      dispatch(unsaveJobThunk(job.id));
    } else {
      dispatch(saveJobThunk(job.id));
    }
  };

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
        isLight
          ? "border-slate-200/90 bg-white/85 shadow-xs hover:border-indigo-300 hover:shadow-xl hover:bg-white"
          : "border-white/10 bg-[#090d16]/85 hover:border-indigo-500/50 hover:bg-[#0c111f] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Featured Badge Pill */}
      {isFeatured && (
        <div className="absolute left-0 top-0 flex items-center gap-1.5 rounded-tl-[23px] rounded-br-[14px] bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-md z-20">
          <Sparkles size={11} className="text-amber-300 fill-amber-300/20 animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white">
            Featured Role
          </span>
        </div>
      )}

      <div className={`flex flex-1 flex-col ${isFeatured ? "pt-4 sm:pt-5" : ""}`}>
        {/* Header: Logo, Company & Save Action */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border font-extrabold text-sm sm:text-base font-satoshi shadow-md ${
              isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-white/10 bg-indigo-600/15 text-indigo-400"
            }`}>
              {job.companyLogo && !logoError ? (
                <img
                  src={getAssetUrl(job.companyLogo)}
                  alt={companyName}
                  loading="lazy"
                  onError={() => setLogoError(true)}
                  className="h-full w-full rounded-xl object-contain"
                />
              ) : (
                initials(companyName)
              )}
            </div>

            <div className="min-w-0">
              <p className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider font-satoshi truncate ${
                isLight ? "text-indigo-600" : "text-indigo-400"
              }`}>
                {companyName}
              </p>
              <h3 className={`mt-0.5 text-sm sm:text-base font-extrabold font-satoshi transition-colors truncate ${
                isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"
              }`}>
                {jobTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`rounded-full p-2 border transition cursor-pointer shrink-0 ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            title={isSaved ? "Remove from Saved Jobs" : "Save Job"}
          >
            {isSaved ? (
              <BookmarkCheck size={16} className="text-indigo-600 fill-indigo-600/20" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>

        {/* Location & Mode */}
        <div className={`mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          <span className="inline-flex items-center gap-1 font-medium truncate max-w-[180px]">
            <MapPin size={12} className={isLight ? "text-indigo-600 shrink-0" : "text-indigo-400 shrink-0"} />
            {location}
          </span>
          <span className={isLight ? "text-slate-300" : "text-slate-600"}>•</span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold border"
            style={{
              backgroundColor: isLight ? badge.lightBg : badge.bg,
              color: isLight ? badge.lightText : badge.text,
              borderColor: badge.border,
            }}
          >
            {badge.label}
          </span>
        </div>

        {/* Skills Pills */}
        {skills.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-1.5">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold border ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-white/5 bg-white/5 text-slate-300"
                }`}
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className={`rounded-lg px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Salary & View Action */}
      <div className={`mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t flex items-center justify-between gap-2 ${
        isLight ? "border-slate-100" : "border-white/10"
      }`}>
        <div className="min-w-0">
          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block ${isLight ? "text-slate-400" : "text-slate-500"}`}>
            Est. CTC
          </span>
          <span className={`text-xs sm:text-sm font-extrabold font-satoshi truncate block ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {formatSalary(
              job.minimumSalary || job.packageOffered || job.salaryMin,
              job.maximumSalary || job.salaryMax,
              job.currency
            )}
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-extrabold transition group-hover:translate-x-0.5 shrink-0 ${
          isLight ? "text-indigo-600 group-hover:text-indigo-700" : "text-indigo-400 group-hover:text-indigo-300"
        }`}>
          Apply <ArrowRight size={13} />
        </span>
      </div>
    </motion.article>
  );
}

/* ===========================
   JobCard Skeleton Placeholder
=========================== */
function JobCardSkeleton({ isLight }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border p-5 sm:p-6 backdrop-blur-xl animate-pulse ${
        isLight ? "border-slate-200/80 bg-white/70" : "border-white/5 bg-[#090d16]/70"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
            <div className="space-y-2">
              <div className={`h-3 w-20 rounded ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
              <div className={`h-4 w-32 rounded ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
            </div>
          </div>
          <div className={`h-8 w-8 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-3.5 w-24 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
          <div className={`h-3.5 w-16 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
        </div>
        <div className="mt-4 flex gap-1.5">
          <div className={`h-5 w-14 rounded-lg ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
          <div className={`h-5 w-16 rounded-lg ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
          <div className={`h-5 w-12 rounded-lg ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
        </div>
      </div>
      <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
        isLight ? "border-slate-100" : "border-white/10"
      }`}>
        <div className={`h-4 w-20 rounded ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
        <div className={`h-4 w-14 rounded ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
      </div>
    </div>
  );
}

/* ===========================
   Main FeaturedJobs Component
=========================== */
export default function FeaturedJobs() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { featuredJobs, jobs, loading } = useAppSelector((state) => state.job);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    dispatch(getFeaturedJobs({ page: 0, size: 6 }));
    dispatch(getAllJobs({ page: 0, size: 12 }));
  }, [dispatch]);

  const displayJobs = useMemo(() => {
    const featList = Array.isArray(featuredJobs) ? featuredJobs : [];
    const allList = Array.isArray(jobs) ? jobs : [];

    const seenIds = new Set();
    const combined = [];

    // 1. Prioritize real featured jobs
    for (const j of featList) {
      if (j && j.id && !seenIds.has(j.id)) {
        seenIds.add(j.id);
        combined.push(j);
      }
    }

    // 2. Also check if any jobs in allList are marked featured
    for (const j of allList) {
      if (j && j.id && (j.featured || j.status === "FEATURED") && !seenIds.has(j.id)) {
        seenIds.add(j.id);
        combined.push(j);
      }
    }

    // 3. If fewer than 6, fill with real published jobs from allList
    for (const j of allList) {
      if (combined.length >= 6) break;
      if (j && j.id && !seenIds.has(j.id)) {
        seenIds.add(j.id);
        combined.push(j);
      }
    }

    return combined.slice(0, 6);
  }, [featuredJobs, jobs]);

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`}>
      {/* ── Ambient Background Lighting ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[200px]"
      />

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Verified Openings"
          title={
            <>
              Explore <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Featured Positions</span>
            </>
          }
          subtitle="Directly apply to high-growth tech startups and market leaders with real-time application tracking and guaranteed salary ranges."
        />

        {/* ── Content: Loading Skeletons / Real Jobs Grid / Clean Empty State ── */}
        {loading && displayJobs.length === 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <JobCardSkeleton key={n} isLight={isLight} />
            ))}
          </div>
        ) : displayJobs.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </motion.div>
        ) : (
          <div
            className={`mt-12 rounded-3xl border p-10 sm:p-14 text-center backdrop-blur-xl ${
              isLight ? "border-slate-200 bg-white/70 shadow-xs" : "border-white/10 bg-[#090d16]/70"
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4">
              <Building2 size={28} />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
              No Featured Openings Right Now
            </h3>
            <p className={`mt-2 max-w-md mx-auto text-xs sm:text-sm font-inter ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              New positions are posted regularly by verified hiring teams. Explore all open positions or set up job alerts to stay notified.
            </p>
          </div>
        )}

        {/* ── View All CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <button
            type="button"
            onClick={() => navigate("/find-jobs")}
            className={`inline-flex items-center gap-2 rounded-2xl border px-8 py-3.5 text-sm font-extrabold shadow-md transition-all duration-300 hover:scale-105 cursor-pointer font-satoshi ${
              isLight
                ? "border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-lg"
                : "border-white/10 bg-[#090d16]/90 text-white hover:border-indigo-500/40 hover:bg-[#0c111f]"
            }`}
          >
            <span>Explore All Open Positions</span>
            <ArrowRight size={16} className="text-indigo-500 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
