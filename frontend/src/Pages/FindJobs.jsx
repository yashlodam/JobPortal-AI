import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ArrowRight,
  Bookmark,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  IndianRupee,
  Building2,
  BookmarkCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../State/Store";
import {
  getAllJobs,
  searchJobs,
  filterJobs,
  fetchSearchSuggestions,
  fetchSearchFacets,
} from "../State/JobSlice";
import { saveJobThunk, unsaveJobThunk } from "../State/savedJobThunk";
import { useToast } from "../components/ui/ToastNotification";
import { EmptyState } from "../components/ui/EmptyState";
import RecommendedJobsSection from "../components/recommendation/RecommendedJobsSection";
import { getAssetUrl } from "../utils/assetUtils";

/* ================================================================
   CONSTANTS
   ================================================================ */
const JOB_TYPES = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Freelance", value: "FREELANCE" },
];
const WORK_MODES = [
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "On Site", value: "ONSITE" },
];
const EXPERIENCE_LEVELS = [
  { label: "Entry", value: "ENTRY_LEVEL" },
  { label: "Mid", value: "MID_LEVEL" },
  { label: "Senior", value: "SENIOR_LEVEL" },
  { label: "Lead", value: "LEAD" },
];
const SALARY_RANGES = [
  { label: "₹0 – 5L", min: 0, max: 500000 },
  { label: "₹5L – 10L", min: 500000, max: 1000000 },
  { label: "₹10L – 20L", min: 1000000, max: 2000000 },
  { label: "₹20L+", min: 2000000, max: Infinity },
];
const DATE_POSTED_OPTIONS = [
  { label: "Anytime", value: null },
  { label: "Past 24h", value: 1 },
  { label: "Past Week", value: 7 },
  { label: "Past Month", value: 30 },
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Best Match" },
  { value: "createdAt,desc", label: "Newest" },
  { value: "minimumSalary,desc", label: "Salary: High to Low" },
  { value: "minimumSalary,asc", label: "Salary: Low to High" },
  { value: "jobTitle,asc", label: "Title: A-Z" },
];
const PAGE_SIZE = 10;

/* ================================================================
   HELPERS
   ================================================================ */

/** Format a salary number into compact INR notation without symbol so IndianRupee icon does not duplicate */
const formatSalary = (n) => {
  if (!n && n !== 0) return null;
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
};

/** Convert SNAKE_CASE enum to readable Title Case */
const humanise = (str) =>
  str
    ? str
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

/** Compute "posted X ago" from an ISO / LocalDateTime string */
const timeAgo = (postedAt) => {
  if (!postedAt) return "";
  const posted = new Date(postedAt);
  const diff = Date.now() - posted.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

/** First two initials of a company name */
const initials = (name) =>
  name
    ? name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
    : "?";

const modeColor = {
  REMOTE: "text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-500/30",
  HYBRID: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30",
  ON_SITE: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30",
  ONSITE: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30",
};

/* ================================================================
   FRAMER VARIANTS
   ================================================================ */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
};

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.25 } },
};

/* ================================================================
   COMPONENT: FilterSection
   ================================================================ */
function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-heading/80 font-satoshi">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ================================================================
   COMPONENT: CheckboxItem
   ================================================================ */
function CheckboxItem({ label, checked, onChange, count }) {
  const id = `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label
      htmlFor={id}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-elevated"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 ${checked
          ? "border-primary bg-primary shadow-button"
          : "border-border-hover bg-transparent group-hover:border-muted"
          }`}
        aria-hidden="true"
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-3 w-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </span>
      <span className="flex-1 text-sm text-body group-hover:text-heading transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted tabular-nums">{count}</span>
      )}
    </label>
  );
}

/* ================================================================
   COMPONENT: FilterSidebarContent
   ================================================================ */
function FilterSidebarContent({ filters, onToggleFilter, onSetSalary, onSetDatePosted, onClearAll, facets }) {
  const hasActive =
    filters.types.length > 0 ||
    filters.modes.length > 0 ||
    filters.experience.length > 0 ||
    filters.salary !== null ||
    filters.postedWithinDays !== null;

  return (
    <div className="space-y-1">
      {hasActive && (
        <button
          onClick={onClearAll}
          className="mb-4 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}

      {/* Date Posted */}
      <FilterSection title="Date Posted">
        <div className="grid grid-cols-2 gap-2">
          {DATE_POSTED_OPTIONS.map((d) => {
            const active = filters.postedWithinDays === d.value;
            return (
              <button
                key={d.label}
                onClick={() => onSetDatePosted(active ? null : d.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "border-indigo-200 dark:border-primary/40 bg-indigo-50 dark:bg-primary/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "border-border bg-surface-elevated/50 text-body hover:border-primary/20 hover:text-heading"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Job Type */}
      <FilterSection title="Job Type">
        {JOB_TYPES.map((t) => (
          <CheckboxItem
            key={t.value}
            label={t.label}
            checked={filters.types.includes(t.value)}
            onChange={() => onToggleFilter("types", t.value)}
            count={facets?.jobTypes?.[t.value]}
          />
        ))}
      </FilterSection>

      {/* Work Mode */}
      <FilterSection title="Work Mode">
        {WORK_MODES.map((m) => (
          <CheckboxItem
            key={m.value}
            label={m.label}
            checked={filters.modes.includes(m.value)}
            onChange={() => onToggleFilter("modes", m.value)}
            count={facets?.workingModes?.[m.value]}
          />
        ))}
      </FilterSection>

      {/* Experience Level */}
      <FilterSection title="Experience Level">
        {EXPERIENCE_LEVELS.map((e) => (
          <CheckboxItem
            key={e.value}
            label={e.label}
            checked={filters.experience.includes(e.value)}
            onChange={() => onToggleFilter("experience", e.value)}
            count={facets?.experienceLevels?.[e.value]}
          />
        ))}
      </FilterSection>

      {/* Salary Range */}
      <FilterSection title="Salary Range">
        <div className="grid grid-cols-2 gap-2">
          {SALARY_RANGES.map((r) => {
            const active =
              filters.salary?.min === r.min && filters.salary?.max === r.max;
            return (
              <button
                key={r.label}
                onClick={() => onSetSalary(active ? null : r)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${active
                  ? "border-indigo-200 dark:border-primary/40 bg-indigo-50 dark:bg-primary/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "border-border bg-surface-elevated/50 text-body hover:border-primary/20 hover:text-heading"
                  }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}

/* ================================================================
   COMPONENT: JobCard
   ================================================================ */
function JobCard({ job, view }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { savedJobIds } = useAppSelector((state) => state.savedJob);
  const userProfile = useAppSelector((state) => state.profile?.profile);
  const [logoError, setLogoError] = useState(false);

  const isSaved = savedJobIds.includes(Number(job.id));
  const isList = view === "list";

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!job.id) return;
    if (isSaved) {
      dispatch(unsaveJobThunk(Number(job.id)));
      toast.info("Job removed from saved bookmarks.");
    } else {
      dispatch(saveJobThunk(Number(job.id)));
      toast.success("Job bookmarked successfully!");
    }
  };

  const location = [job.city, job.state, job.country]
    .filter(Boolean)
    .join(", ");

  const salaryText = useMemo(() => {
    const min = formatSalary(job.minimumSalary);
    const max = formatSalary(job.maximumSalary);
    if (min && max) return `${min} – ${max}`;
    if (min) return min;
    if (max) return max;
    return null;
  }, [job.minimumSalary, job.maximumSalary]);

  const skills = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];
  const visibleSkills = skills.slice(0, isList ? 4 : 3);
  const extraSkills = skills.length - visibleSkills.length;

  // Match score calculation
  const matchPercentage = useMemo(() => {
    if (!userProfile?.skills || !Array.isArray(userProfile.skills) || skills.length === 0) return null;
    const userSkillNames = userProfile.skills.map((s) =>
      (typeof s === "object" ? s.name || s.skillName || "" : String(s)).toLowerCase().trim()
    );
    const matched = skills.filter((sk) =>
      userSkillNames.some((u) => u.includes(String(sk).toLowerCase().trim()) || String(sk).toLowerCase().includes(u))
    );
    if (matched.length === 0) return null;
    return Math.min(100, Math.round((matched.length / skills.length) * 100));
  }, [userProfile, skills]);

  const logoUrl = job.companyLogo ? getAssetUrl(job.companyLogo) : null;

  return (
    <motion.div variants={cardVariants} layout className="w-full">
      <Link
        to={`/jobs/${job.id}`}
        className={`group relative flex w-full rounded-[20px] border border-border bg-surface backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-glow-primary hover:bg-surface-elevated/60 ${
          isList
            ? "flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-6"
            : "flex-col p-4 sm:p-6"
        } ${job.featured ? "border-primary/25 shadow-[0_0_30px_rgba(99,102,241,0.08)]" : ""}`}
      >
        {/* Featured badge */}
        {job.featured && (
          <div className="absolute -top-px left-4 sm:left-6 flex items-center gap-1.5 rounded-b-md bg-gradient-to-r from-primary to-violet px-2.5 py-0.5 sm:px-3 sm:py-1 z-10 shadow-sm">
            <Sparkles size={11} className="text-white" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
              Featured
            </span>
          </div>
        )}

        {/* Company Logo */}
        <div
          className={`flex items-center justify-center rounded-2xl border border-border bg-surface-elevated shadow-xs ${
            isList ? "h-12 w-12 sm:h-14 sm:w-14 shrink-0" : "mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 mt-1"
          }`}
        >
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={job.companyName}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-sm sm:text-base font-black text-primary font-satoshi" aria-hidden="true">
              {initials(job.companyName)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2.5 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-satoshi text-base sm:text-lg font-bold text-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {job.jobTitle}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-body">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
                  <Building2 size={13} className="text-muted shrink-0" />
                  <span className="truncate">{job.companyName}</span>
                </span>
                {location && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 truncate">
                    <MapPin size={13} className="text-muted shrink-0" />
                    <span className="truncate">{location}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark */}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`shrink-0 rounded-xl p-2 transition-all duration-200 cursor-pointer ${
                isSaved
                  ? "bg-indigo-50 dark:bg-primary/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-primary/30"
                  : "text-muted hover:bg-surface-elevated hover:text-heading"
              }`}
              aria-label={isSaved ? "Unsave job" : "Save job"}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>

          {/* Meta row */}
          <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${isList ? "mt-2.5 sm:mt-3" : "mt-3 sm:mt-4"}`}>
            {/* AI Match Badge if available */}
            {matchPercentage && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-300 shadow-2xs">
                <Sparkles size={11} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                {matchPercentage}% Match
              </span>
            )}

            {/* Work Mode badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] sm:text-xs font-semibold ${
                modeColor[job.workingMode] ?? "text-body bg-surface-elevated border-border"
              }`}
            >
              {humanise(job.workingMode)}
            </span>

            {/* Job Type badge */}
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Briefcase size={11} />
              {humanise(job.jobType)}
            </span>

            {/* Experience Level */}
            {job.experienceLevel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] sm:text-xs font-medium text-body">
                <TrendingUp size={11} />
                {humanise(job.experienceLevel)}
              </span>
            )}

            {/* Vacancies */}
            {job.vacancies > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] sm:text-xs font-medium text-body">
                {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
              </span>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className={`flex flex-wrap gap-1 sm:gap-1.5 ${isList ? "mt-2.5 sm:mt-3" : "mt-2.5 sm:mt-3"}`}>
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                >
                  {skill}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-body">
                  +{extraSkills}
                </span>
              )}
            </div>
          )}

          {/* Bottom row */}
          <div
            className={`flex items-center justify-between ${
              isList
                ? "mt-3 pt-3 border-t border-border/60 sm:border-0 sm:pt-0"
                : "mt-4 sm:mt-5 border-t border-border pt-3.5 sm:pt-4"
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {salaryText && (
                <span className="inline-flex items-center gap-1 font-semibold text-heading">
                  <IndianRupee size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{salaryText}</span>
                  <span className="text-[10px] sm:text-xs font-normal text-muted">/yr</span>
                </span>
              )}
              {job.postedAt && (
                <span className="inline-flex items-center gap-1 text-muted text-[11px] sm:text-xs">
                  <Clock size={12} className="shrink-0" />
                  {timeAgo(job.postedAt)}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-100 sm:opacity-0 transition-all duration-300 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 sm:translate-x-2">
              Apply
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ================================================================
   SKELETON CARD
   ================================================================ */
function JobCardSkeleton({ view }) {
  const isList = view === "list";
  return (
    <div
      className={`animate-pulse rounded-[20px] border border-border bg-surface w-full ${
        isList ? "flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-6" : "flex flex-col p-4 sm:p-6"
      }`}
    >
      <div className={`shrink-0 rounded-xl bg-surface-elevated ${isList ? "h-12 w-12 sm:h-14 sm:w-14" : "mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14"}`} />
      <div className="flex-1 space-y-3 min-w-0">
        <div className="h-5 w-2/3 rounded-lg bg-surface-elevated" />
        <div className="h-4 w-1/2 rounded-lg bg-surface-elevated" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-surface-elevated" />
          <div className="h-6 w-20 rounded-full bg-surface-elevated" />
          <div className="h-6 w-14 rounded-full bg-surface-elevated" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded-full bg-surface-elevated" />
          <div className="h-5 w-16 rounded-full bg-surface-elevated" />
          <div className="h-5 w-10 rounded-full bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */
export default function FindJobs() {
  /* ── URL params from Home / Hero search ── */
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlMode = searchParams.get("mode") ?? "";
  const urlCity = searchParams.get("city") || searchParams.get("location") || "";
  const urlFeed = searchParams.get("feed") ?? "";

  /* ── Search input state ── */
  const [searchTitle, setSearchTitle] = useState(urlKeyword);
  const [searchLocation, setSearchLocation] = useState(urlCity);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  /* ── Filter state (sent to backend) ── */
  const [filters, setFilters] = useState({
    types: [],
    modes: urlMode ? [urlMode] : [],
    experience: [],
    salary: null,
    postedWithinDays: null,
  });

  /* ── UI-only state ── */
  const [feedMode, setFeedMode] = useState(urlFeed === "recommended" ? "recommended" : "all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(0); // 0-indexed (Spring Boot)
  const [mobileFilters, setMobileFilters] = useState(false);

  /* ── Sync URL feed param to feedMode ── */
  useEffect(() => {
    if (urlFeed === "recommended") {
      setFeedMode("recommended");
    } else if (urlFeed === "all") {
      setFeedMode("all");
    }
  }, [urlFeed]);

  const dispatch = useAppDispatch();

  /* ── Redux state ── */
  const { jobs, pagination, loading, suggestions, facets } = useAppSelector((s) => s.job);

  const totalPages = pagination.totalPages ?? 0;
  const totalElements = pagination.totalElements ?? 0;

  /* ── Debounce ref for search inputs ── */
  const debounceRef = useRef(null);

  /* ── Fetch search facets on mount ── */
  useEffect(() => {
    dispatch(fetchSearchFacets());
  }, [dispatch]);

  /* ── Close suggestions on click outside ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Central fetch function — called on any param change ── */
  const fetchJobs = useCallback(
    (overrides = {}) => {
      const params = {
        page,
        size: PAGE_SIZE,

        // Entity field name or omit if relevance
        sort: sortBy !== "relevance" ? (sortBy || "createdAt,desc") : undefined,
        sortBy: sortBy === "relevance" ? "relevance" : undefined,

        // Search
        keyword: searchTitle.trim() || undefined,
        city: searchLocation.trim() || undefined,
        category: urlCategory || undefined,

        // Filters
        jobType:
          filters.types.length > 0
            ? filters.types.join(",")
            : undefined,

        workingMode:
          filters.modes.length > 0
            ? filters.modes.join(",")
            : undefined,

        experienceLevel:
          filters.experience.length > 0
            ? filters.experience.join(",")
            : undefined,

        minimumSalary:
          filters.salary?.min ?? undefined,

        maximumSalary:
          filters.salary?.max !== Infinity
            ? filters.salary?.max
            : undefined,

        postedWithinDays:
          filters.postedWithinDays !== null && filters.postedWithinDays !== undefined
            ? filters.postedWithinDays
            : undefined,

        ...overrides,
      };

      // Remove undefined, null and empty string values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
      );

      dispatch(searchJobs(cleanParams));
    },
    [
      page,
      sortBy,
      searchTitle,
      searchLocation,
      filters,
      urlCategory,
      dispatch,
    ]
  );

  /* ── Fetch on mount and whenever search params / URL params change ── */
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, filters, urlKeyword, urlCategory, urlMode, urlCity]);

  /* ── Lock body scroll when mobile drawer is open ── */
  useEffect(() => {
    if (mobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilters]);

  /* ── Debounced fetch for search input typing ── */
  const handleSearchInputChange = useCallback(
    (field, value) => {
      if (field === "title") {
        setSearchTitle(value);
        if (value.trim().length >= 2) {
          dispatch(fetchSearchSuggestions(value.trim()));
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      }
      if (field === "location") setSearchLocation(value);
      setPage(0);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchJobs({ page: 0 });
      }, 500);
    },
    [dispatch, fetchJobs]
  );

  /* ── Suggestion Click Handler ── */
  const handleSelectSuggestion = (type, value) => {
    setShowSuggestions(false);
    setPage(0);
    clearTimeout(debounceRef.current);

    if (type === "title" || type === "skill" || type === "company") {
      setSearchTitle(value);
      fetchJobs({ page: 0, keyword: value });
    } else if (type === "location") {
      setSearchLocation(value);
      fetchJobs({ page: 0, city: value });
    }
  };

  /* ── Search form submit ── */
  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setPage(0);
    fetchJobs({ page: 0 });
  };

  /* ── Filter helpers ── */
  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
    setPage(0);
  }, []);

  const setSalary = useCallback((range) => {
    setFilters((prev) => ({ ...prev, salary: range }));
    setPage(0);
  }, []);

  const setDatePosted = useCallback((days) => {
    setFilters((prev) => ({ ...prev, postedWithinDays: days }));
    setPage(0);
  }, []);

  const clearAll = useCallback(() => {
    setFilters({ types: [], modes: [], experience: [], salary: null, postedWithinDays: null });
    setSearchTitle("");
    setSearchLocation("");
    setShowSuggestions(false);
    setPage(0);
  }, []);

  const removeActiveFilter = useCallback(
    (kind, value) => {
      if (kind === "salary") setSalary(null);
      else if (kind === "datePosted") setDatePosted(null);
      else if (kind === "search") setSearchTitle("");
      else if (kind === "location") setSearchLocation("");
      else toggleFilter(kind, value);
    },
    [setSalary, setDatePosted, toggleFilter]
  );

  /* ── Active filter pills ── */
  const activePills = useMemo(() => {
    const pills = [];
    if (searchTitle.trim())
      pills.push({ kind: "search", label: `"${searchTitle.trim()}"` });
    if (searchLocation.trim())
      pills.push({ kind: "location", label: searchLocation.trim() });
    if (filters.postedWithinDays) {
      const found = DATE_POSTED_OPTIONS.find((d) => d.value === filters.postedWithinDays);
      pills.push({ kind: "datePosted", label: found?.label ?? `Past ${filters.postedWithinDays}d` });
    }
    filters.types.forEach((v) => {
      const found = JOB_TYPES.find((t) => t.value === v);
      pills.push({ kind: "types", label: found?.label ?? v, value: v });
    });
    filters.modes.forEach((v) => {
      const found = WORK_MODES.find((m) => m.value === v);
      pills.push({ kind: "modes", label: found?.label ?? v, value: v });
    });
    filters.experience.forEach((v) => {
      const found = EXPERIENCE_LEVELS.find((e) => e.value === v);
      pills.push({ kind: "experience", label: found?.label ?? v, value: v });
    });
    if (filters.salary)
      pills.push({ kind: "salary", label: filters.salary.label });
    return pills;
  }, [searchTitle, searchLocation, filters]);

  /* ── Pagination page numbers ── */
  const getPageNumbers = () => {
    const currentPage = page + 1; // convert to 1-indexed for display
    const pages = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const currentPageDisplay = page + 1; // 1-indexed for UI

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* ========== DECORATIVE GLOWS ========== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.06] blur-[180px]" />
        <div className="absolute top-60 right-[10%] h-[400px] w-[400px] rounded-full bg-violet/[0.05] blur-[160px]" />
        <div className="absolute bottom-40 left-[10%] h-[350px] w-[350px] rounded-full bg-accent/[0.04] blur-[140px]" />
      </div>

      {/* ========== SEARCH STRIP ========== */}
      <section className="relative z-30 border-b border-border bg-surface/50 backdrop-blur-md">
        <div className="section-container py-6 sm:py-10">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 sm:mb-6 text-center"
          >
            <h1 className="font-satoshi text-2xl sm:text-4xl md:text-5xl font-extrabold text-heading leading-tight">
              Find Your <span className="gradient-text">Dream Job</span>
            </h1>
            <p className="mt-2 sm:mt-3 text-body text-xs sm:text-base md:text-lg">
              {totalElements > 0
                ? `Discover ${totalElements.toLocaleString()} opportunities from world-class companies`
                : "Search thousands of opportunities from world-class companies"}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-30 mx-auto flex max-w-4xl flex-col gap-2.5 sm:gap-3 sm:flex-row"
          >
            {/* Title input */}
            <div className="relative flex-1 z-30">
              <Search
                size={17}
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => handleSearchInputChange("title", e.target.value)}
                onFocus={() => {
                  if (searchTitle.trim().length >= 2) setShowSuggestions(true);
                }}
                placeholder="Job title, keyword, or company"
                aria-label="Search by job title, keyword, or company"
                className="w-full rounded-xl border border-border bg-surface-elevated py-3 sm:py-3.5 pl-10 sm:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm text-heading placeholder:text-muted outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-surface-elevated"
              />
              {searchTitle && (
                <button
                  type="button"
                  onClick={() => handleSearchInputChange("title", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}

              {/* Autocomplete Suggestions Popover */}
              <AnimatePresence>
                {showSuggestions &&
                  (suggestions?.jobTitles?.length > 0 ||
                    suggestions?.skills?.length > 0 ||
                    suggestions?.companies?.length > 0 ||
                    suggestions?.locations?.length > 0) && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto rounded-2xl border border-border bg-white dark:bg-[#0f172a] shadow-2xl backdrop-blur-2xl p-2 text-xs divide-y divide-border/60"
                    >
                      {/* Job Titles */}
                      {suggestions?.jobTitles?.length > 0 && (
                        <div className="py-1.5 first:pt-0">
                          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <Briefcase size={12} className="text-indigo-600 dark:text-indigo-400" />
                            Job Titles
                          </div>
                          {suggestions.jobTitles.map((title) => (
                            <button
                              key={title}
                              type="button"
                              onClick={() => handleSelectSuggestion("title", title)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-heading hover:bg-surface-elevated flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span>{title}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {suggestions?.skills?.length > 0 && (
                        <div className="py-1.5">
                          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <Sparkles size={12} className="text-amber-500" />
                            Skills & Technologies
                          </div>
                          <div className="flex flex-wrap gap-1 px-3 py-1.5">
                            {suggestions.skills.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleSelectSuggestion("skill", skill)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated text-heading hover:bg-indigo-50 dark:hover:bg-primary/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer text-[11px] font-medium"
                              >
                                <span>{skill}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Companies */}
                      {suggestions?.companies?.length > 0 && (
                        <div className="py-1.5">
                          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <Building2 size={12} className="text-cyan-500" />
                            Companies
                          </div>
                          {suggestions.companies.map((comp) => (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => handleSelectSuggestion("company", comp)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-heading hover:bg-surface-elevated flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span>{comp}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Locations */}
                      {suggestions?.locations?.length > 0 && (
                        <div className="py-1.5">
                          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <MapPin size={12} className="text-rose-500" />
                            Locations
                          </div>
                          {suggestions.locations.map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => handleSelectSuggestion("location", loc)}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-heading hover:bg-surface-elevated flex items-center justify-between group transition-colors cursor-pointer"
                            >
                              <span>{loc}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>

            {/* Location input */}
            <div className="relative sm:w-64">
              <MapPin
                size={17}
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => handleSearchInputChange("location", e.target.value)}
                placeholder="City, state, or remote"
                aria-label="Search by city, state, or remote"
                className="w-full rounded-xl border border-border bg-surface-elevated py-3 sm:py-3.5 pl-10 sm:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm text-heading placeholder:text-muted outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-surface-elevated"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => handleSearchInputChange("location", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search button */}
            <button
              type="submit"
              aria-label="Search jobs"
              className="gradient-bg-signature flex items-center justify-center gap-2 rounded-xl px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-button transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto shrink-0"
            >
              <Search size={15} />
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* ========== MAIN CONTENT ========== */}
      <div className="relative section-container py-6 sm:py-8 w-full mx-auto">
        {/* Active Filters Row */}
        <AnimatePresence>
          {activePills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="mr-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted">
                  Active:
                </span>
                {activePills.map((pill) => (
                  <motion.button
                    key={`${pill.kind}-${pill.label}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => removeActiveFilter(pill.kind, pill.value ?? pill.label)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all hover:bg-indigo-100 dark:hover:bg-primary/25 cursor-pointer"
                  >
                    {pill.label}
                    <X size={12} />
                  </motion.button>
                ))}
                <button
                  onClick={clearAll}
                  className="ml-1 sm:ml-2 text-[11px] sm:text-xs font-medium text-muted hover:text-heading transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discovery Feed Mode Toggle */}
        <div className="mb-5 sm:mb-6 border-b border-border pb-4">
          <div className="grid grid-cols-2 sm:inline-flex items-center rounded-2xl bg-surface border border-border p-1 w-full sm:w-auto gap-1">
            <button
              onClick={() => {
                setFeedMode("all");
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete("feed");
                  return next;
                }, { replace: true });
              }}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center truncate ${
                feedMode === "all"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted hover:text-heading"
              }`}
            >
              All Open Positions ({totalElements.toLocaleString()})
            </button>
            <button
              onClick={() => {
                setFeedMode("recommended");
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("feed", "recommended");
                  return next;
                }, { replace: true });
              }}
              className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer truncate ${
                feedMode === "recommended"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-muted hover:text-heading"
              }`}
            >
              <Sparkles size={13} className="text-amber-300 animate-pulse shrink-0" />
              <span>Recommended for You ✨</span>
            </button>
          </div>
        </div>

        {feedMode === "recommended" ? (
          <div className="py-2">
            <RecommendedJobsSection showHeading={false} />
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-3.5">
              <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFilters(true)}
                  aria-label="Open filters"
                  className="lg:hidden inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs sm:text-sm font-semibold text-body transition-all hover:border-primary/30 hover:text-heading shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activePills.length > 0 && (
                    <span className="ml-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs font-bold text-white">
                      {activePills.length}
                    </span>
                  )}
                </button>

                {/* Sort on Mobile */}
                <div className="relative sm:hidden flex-1 max-w-[170px]">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(0);
                    }}
                    aria-label="Sort jobs by"
                    className="w-full appearance-none rounded-xl border border-border bg-surface-elevated px-3 py-2 pr-7 text-xs text-heading outline-none transition-all focus:border-primary/40 cursor-pointer truncate"
                    style={{ colorScheme: "auto" }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={13}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-muted"
                  />
                </div>

                <p className="hidden sm:block text-xs sm:text-sm text-body">
                  {loading ? (
                    "Loading…"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-heading">
                        {jobs.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-heading">
                        {totalElements.toLocaleString()}
                      </span>{" "}
                      {totalElements === 1 ? "job" : "jobs"}
                    </>
                  )}
                </p>
              </div>

              {/* Subrow for mobile results count */}
              <div className="sm:hidden flex items-center justify-between text-xs text-body px-0.5">
                <span>
                  {loading ? (
                    "Loading…"
                  ) : (
                    <>
                      Showing <span className="font-semibold text-heading">{jobs.length}</span> of{" "}
                      <span className="font-semibold text-heading">{totalElements.toLocaleString()}</span> jobs
                    </>
                  )}
                </span>
              </div>

              <div className="hidden sm:flex items-center justify-end gap-3 w-full sm:w-auto">
                {/* Desktop Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(0);
                    }}
                    aria-label="Sort jobs by"
                    className="appearance-none rounded-xl border border-border bg-surface-elevated px-3.5 py-2 sm:px-4 sm:py-2.5 pr-8 sm:pr-9 text-xs sm:text-sm text-heading outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 hover:border-border-hover cursor-pointer"
                    style={{ colorScheme: "auto" }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-muted"
                  />
                </div>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border border-border bg-surface-elevated p-1">
                  <button
                    onClick={() => setView("grid")}
                    className={`rounded-xl p-2 transition-all duration-200 cursor-pointer ${view === "grid"
                      ? "bg-indigo-50 dark:bg-primary/20 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                      : "text-muted hover:text-heading"
                      }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`rounded-xl p-2 transition-all duration-200 cursor-pointer ${view === "list"
                      ? "bg-indigo-50 dark:bg-primary/20 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                      : "text-muted hover:text-heading"
                      }`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 w-full">
          {/* ===== LEFT: Desktop Filter Sidebar ===== */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[96px] rounded-[20px] border border-border bg-surface backdrop-blur-lg p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-satoshi text-base font-bold text-heading">
                  Filters
                </h3>
              </div>
              <FilterSidebarContent
                filters={filters}
                onToggleFilter={toggleFilter}
                onSetSalary={setSalary}
                onSetDatePosted={setDatePosted}
                onClearAll={clearAll}
                facets={facets}
              />
            </div>
          </aside>

          {/* ===== RIGHT: Job Cards ===== */}
          <div className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              {loading ? (
                <div
                  key="skeleton"
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 w-full"
                      : "flex flex-col gap-4 w-full"
                  }
                >
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <JobCardSkeleton key={i} view={view} />
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <motion.div
                  key={`${page}-${sortBy}-${view}-${filters.types.join(",")}-${filters.modes.join(",")}-${filters.experience.join(",")}-${filters.salary?.label ?? ""}-${searchTitle}-${searchLocation}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 w-full"
                      : "flex flex-col gap-4 w-full"
                  }
                >
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} view={view} />
                  ))}
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EmptyState
                    icon={Briefcase}
                    title="No Matching Jobs Found"
                    description="We couldn't find any opportunities matching your active filters. Try broadening your keywords, location, or reset filters below."
                    actionLabel="Reset Filters & Explore All Jobs"
                    onAction={clearAll}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== PAGINATION ===== */}
            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                {/* Mobile compact pagination */}
                <div className="flex sm:hidden items-center justify-between w-full max-w-xs mx-auto gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs font-semibold text-body transition-all hover:border-primary/30 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  <span className="text-xs font-bold text-heading px-2.5 py-1.5 rounded-xl bg-surface border border-border">
                    {currentPageDisplay} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs font-semibold text-body transition-all hover:border-primary/30 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Desktop full pagination */}
                <div className="hidden sm:flex items-center justify-center gap-1.5">
                  {/* Previous */}
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-body transition-all hover:border-primary/30 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-body cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-sm text-muted">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p - 1)} // convert 1-indexed display → 0-indexed
                          className={`h-9 w-9 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                            currentPageDisplay === p
                              ? "gradient-bg-signature text-white shadow-button"
                              : "border border-border bg-surface-elevated text-body hover:border-primary/30 hover:text-heading"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-body transition-all hover:border-primary/30 hover:text-heading disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-body cursor-pointer"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Page info */}
                <p className="mt-3 text-center text-xs text-muted">
                  Page {currentPageDisplay} of {totalPages} · {totalElements.toLocaleString()} total jobs
                </p>
              </motion.div>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/* ========== MOBILE FILTER OVERLAY ========== */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Panel */}
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 w-full sm:w-[360px] max-w-[85vw] flex flex-col justify-between border-r border-border bg-surface/98 shadow-2xl backdrop-blur-2xl p-5 sm:p-6 lg:hidden"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-satoshi text-base sm:text-lg font-bold text-heading">
                    Filters
                  </h3>
                </div>
                <button
                  onClick={() => setMobileFilters(false)}
                  aria-label="Close filters"
                  className="rounded-xl p-2 text-muted transition-colors hover:bg-surface-elevated hover:text-heading cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Filters Body */}
              <div className="flex-1 overflow-y-auto pr-1 my-1">
                <FilterSidebarContent
                  filters={filters}
                  onToggleFilter={toggleFilter}
                  onSetSalary={setSalary}
                  onSetDatePosted={setDatePosted}
                  onClearAll={clearAll}
                  facets={facets}
                />
              </div>

              {/* Sticky Bottom Actions */}
              <div className="pt-3 border-t border-border shrink-0 space-y-2">
                <button
                  onClick={() => setMobileFilters(false)}
                  className="gradient-bg-signature w-full rounded-xl py-3 text-sm font-bold text-white shadow-button transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] cursor-pointer"
                >
                  Show {totalElements.toLocaleString()} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
