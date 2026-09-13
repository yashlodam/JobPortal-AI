/**
 * src/LandingPage/DreamJob.jsx
 *
 * Senior 15+ Year Production-Grade Hero Component.
 * Masterfully integrates:
 * - Perfectly centered & balanced glassmorphic telemetry command dock
 * - High-impact value proposition & command search center
 * - Preserved /jobs1.png illustration with 3D ambient glow pedestal & floating interactive micro-badges
 * - Silicon-Valley grade editorial typography with Satoshi hierarchy
 */

import React, { useState, useCallback, memo, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  MapPin,
  ArrowRight,
  Zap,
  CheckCircle2,
  Star,
  ShieldCheck,
  Building2,
  Briefcase,
  TrendingUp,
  Clock,
  MessageSquare,
  Bot,
  Flame,
  Globe,
  Compass,
  ArrowUpRight,
  Check,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { fetchSearchSuggestions } from "../State/JobSlice";
import { useTheme } from "../context/ThemeContext";

/* =========================================================================
   CONSTANTS & CONFIGURATION
   ========================================================================= */

const QUICK_FILTERS = [
  { id: "all", label: "All Tech Roles", icon: Compass },
  { id: "remote", label: "Remote First", icon: Globe, query: "Remote" },
  { id: "ai", label: "AI & Machine Learning", icon: Bot, query: "AI" },
  { id: "high_ctc", label: "₹25L+ High Package", icon: Flame, query: "Senior" },
];

const POPULAR_KEYWORDS = [
  { label: "React 19", query: "React" },
  { label: "Fullstack", query: "Fullstack" },
  { label: "Python & AI", query: "Python" },
  { label: "Java Spring Boot", query: "Java" },
  { label: "DevOps & Cloud", query: "DevOps" },
  { label: "Product UI/UX", query: "UI/UX" },
];

const POPULAR_LOCATIONS = [
  "Remote",
  "Bengaluru, India",
  "Hyderabad, India",
  "Pune, India",
  "Mumbai, India",
  "Delhi NCR, India",
];

const HERO_STATS = [
  {
    id: "jobs",
    label: "Active Roles",
    value: "Live Openings",
    subtext: "Verified tech opportunities",
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "precision",
    label: "AI Match Fit",
    value: "Semantic",
    subtext: "Skill & requirement alignment",
    icon: Zap,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "interview",
    label: "Interview Coach",
    value: "Interactive",
    subtext: "Voice & text technical drills",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "direct_pipeline",
    label: "Hiring Pipeline",
    value: "Direct",
    subtext: "Direct connection with recruiters",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-600",
  },
];

/* =========================================================================
   ANIMATION VARIANTS
   ========================================================================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const imageContainerVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
  },
};

/* =========================================================================
   MAIN HERO COMPONENT
   ========================================================================= */

const DreamJob = memo(() => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const dispatch = useAppDispatch();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const locationSuggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const locationDebounceRef = useRef(null);

  const { profile } = useAppSelector((state) => state.auth);
  const allJobs = useAppSelector((state) => state.job.allJobs);
  const suggestions = useAppSelector((state) => state.job.suggestions);
  const liveJobCount =
    Array.isArray(allJobs) && allJobs.length > 0
      ? `${allJobs.length.toLocaleString()} Open Roles`
      : "Open Roles";

  /* ── Filtered locations for location suggestion popover ── */
  const filteredLocations = useMemo(() => {
    const fromSuggestions = suggestions?.locations || [];
    if (!location.trim()) return POPULAR_LOCATIONS;
    const q = location.toLowerCase().trim();
    const combined = Array.from(new Set([...fromSuggestions, ...POPULAR_LOCATIONS]));
    return combined.filter((l) => l.toLowerCase().includes(q));
  }, [suggestions?.locations, location]);

  /* ── Close suggestions on click outside ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (locationSuggestionsRef.current && !locationSuggestionsRef.current.contains(e.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Debounced suggestions fetch for input typing ── */
  const handleJobTitleChange = (val) => {
    setJobTitle(val);
    if (val.trim().length >= 2) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(fetchSearchSuggestions(val.trim()));
      }, 300);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  /* ── Location input handler ── */
  const handleLocationChange = (val) => {
    setLocation(val);
    if (val.trim().length >= 1) {
      clearTimeout(locationDebounceRef.current);
      locationDebounceRef.current = setTimeout(() => {
        dispatch(fetchSearchSuggestions(val.trim()));
      }, 300);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  /* ── Suggestion selection ── */
  const handleSelectSuggestion = (type, value) => {
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
    clearTimeout(debounceRef.current);
    clearTimeout(locationDebounceRef.current);
    if (type === "title" || type === "skill" || type === "company") {
      setJobTitle(value);
      const params = new URLSearchParams();
      params.append("keyword", value);
      if (location.trim()) {
        params.append("city", location.trim());
        params.append("location", location.trim());
      }
      navigate(`/find-jobs?${params.toString()}`);
    } else if (type === "location") {
      setLocation(value);
      const params = new URLSearchParams();
      if (jobTitle.trim()) params.append("keyword", jobTitle.trim());
      params.append("city", value);
      params.append("location", value);
      navigate(`/find-jobs?${params.toString()}`);
    }
  };

  const handleSearch = useCallback(
    (e) => {
      e?.preventDefault();
      setShowSuggestions(false);
      setShowLocationSuggestions(false);
      const params = new URLSearchParams();
      if (jobTitle?.trim()) params.append("keyword", jobTitle.trim());
      if (location?.trim()) {
        params.append("city", location.trim());
        params.append("location", location.trim());
      }
      navigate(`/find-jobs${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [jobTitle, location, navigate]
  );

  const handleFilterClick = (filter) => {
    setActiveFilter(filter.id);
    if (filter.query) {
      navigate(`/find-jobs?keyword=${encodeURIComponent(filter.query)}`);
    } else {
      navigate("/find-jobs");
    }
  };

  return (
    <section className={`relative overflow-hidden pt-12 pb-16 sm:pt-18 sm:pb-20 lg:pt-20 lg:pb-24 font-inter transition-colors duration-300 bg-transparent ${isLight ? "text-slate-800" : "text-slate-200"}`}>
      
      {/* ── Multi-Layer Ambient Background Atmosphere ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full blur-[220px] ${isLight ? "bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent opacity-70" : "bg-gradient-to-b from-indigo-600/18 via-purple-600/12 to-transparent"}`} />
      </div>

      <div className="section-container relative z-10">
        
        {/* ── 2-COLUMN HERO TOP SECTION ── */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          
          {/* ══════════════════════════════════════════════════════════
              LEFT HERO COLUMN: VALUE PROPOSITION & COMMAND SEARCH
             ══════════════════════════════════════════════════════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left lg:col-span-7 space-y-6 sm:space-y-7"
          >
            {/* Top Innovation Badge */}
            <motion.div variants={fadeUp}>
              <div className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 shadow-sm backdrop-blur-2xl transition-all ${isLight ? "border-indigo-200/90 bg-white/95 text-indigo-950 shadow-indigo-500/5" : "border-indigo-500/35 bg-indigo-950/40 text-indigo-200 shadow-[0_0_25px_rgba(99,102,241,0.25)]"}`}>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[11px] font-black uppercase tracking-wider font-satoshi ${isLight ? "text-indigo-950" : "text-indigo-200"}`}>
                  AI-Powered Recruitment Platform
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-black text-white tracking-wider uppercase">
                  <Sparkles size={10} className="text-amber-300" />
                  Live
                </span>
              </div>
            </motion.div>

            {/* High-Impact Editorial Headline */}
            <motion.h1
              variants={fadeUp}
              className={`text-3xl sm:text-5xl lg:text-6xl xl:text-[66px] font-black leading-[1.12] sm:leading-[1.08] tracking-tight font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}
            >
              Your next role,{" "}
              <span
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
              >
                matched to you.
              </span>
            </motion.h1>

            {/* Explanatory Subtitle */}
            <motion.p
              variants={fadeUp}
              className={`max-w-xl text-xs sm:text-base leading-relaxed font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}
            >
              Explore verified engineering, product, and AI positions. Evaluate your match fit, optimize your resume for screening, and connect directly with hiring teams.
            </motion.p>

            {/* ── COMMAND SEARCH CENTER ── */}
            <motion.div variants={fadeUp} className="w-full max-w-3xl lg:max-w-4xl pt-1">
              
              {/* Quick Category Filter Pills — Smooth horizontal touch-scroll on mobile, wrap on desktop */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3.5 overflow-x-auto no-scrollbar py-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap justify-start lg:justify-start touch-scroll-x">
                {QUICK_FILTERS.map((f) => {
                  const Icon = f.icon;
                  const isSelected = activeFilter === f.id;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFilterClick(f)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                        isSelected
                          ? "!bg-indigo-600 !text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                          : isLight
                            ? "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-xs"
                            : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                      }`}
                      style={isSelected ? { backgroundColor: "#4F46E5", color: "#FFFFFF" } : {}}
                    >
                      <Icon size={13} style={isSelected ? { color: "#FFFFFF" } : {}} className={isSelected ? "!text-white" : isLight ? "text-indigo-600" : "text-indigo-400"} />
                      <span style={isSelected ? { color: "#FFFFFF" } : {}} className={isSelected ? "!text-white whitespace-nowrap" : "whitespace-nowrap"}>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Glassmorphic Search Bar Container */}
              <form
                onSubmit={handleSearch}
                className={`relative z-30 rounded-2xl sm:rounded-3xl border p-2 sm:p-2.5 backdrop-blur-2xl transition-all duration-300 ${
                  isLight
                    ? "border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-indigo-300 hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)]"
                    : "border-white/15 bg-[#080d1a]/95 shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:border-indigo-500/50 hover:shadow-[0_25px_60px_rgba(99,102,241,0.2)]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-1.5">
                  
                  {/* Job Title / Skill Input with Autocomplete */}
                  <div className="relative flex-1 min-w-0 z-30">
                    <div className={`flex h-12 w-full items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl px-3 sm:px-3.5 transition-colors ${
                      isLight
                        ? "bg-slate-50 md:bg-transparent border border-slate-200 md:border-none focus-within:bg-indigo-50/40"
                        : "bg-white/[0.03] md:bg-transparent border border-white/5 md:border-none focus-within:border-indigo-500/40"
                    }`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                        isLight ? "bg-indigo-100 text-indigo-600 border border-indigo-200" : "bg-indigo-500/15 border border-indigo-500/30 text-indigo-400"
                      }`}>
                        <Search size={16} />
                      </div>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => handleJobTitleChange(e.target.value)}
                        onFocus={() => {
                          if (jobTitle.trim().length >= 2) setShowSuggestions(true);
                        }}
                        placeholder="Job title, skill, or company…"
                        className={`w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium outline-none focus:outline-none ${
                          isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-400"
                        }`}
                      />
                      {jobTitle && (
                        <button
                          type="button"
                          onClick={() => handleJobTitleChange("")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

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
                            className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto rounded-2xl border border-border bg-white dark:bg-[#0f172a] shadow-2xl backdrop-blur-2xl p-2 text-xs divide-y divide-border/60 text-left"
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
                                    <span className="truncate">{title}</span>
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-opacity shrink-0" />
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
                                    <span className="truncate">{comp}</span>
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-cyan-500 transition-opacity shrink-0" />
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
                                    <span className="truncate">{loc}</span>
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity shrink-0" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  {/* Vertical Divider (Desktop) */}
                  <div className={`hidden md:block h-7 w-px shrink-0 mx-1 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />

                  {/* Location Input with Autocomplete */}
                  <div className="relative w-full md:w-56 lg:w-64 shrink-0 z-20">
                    <div className={`flex h-12 w-full items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl px-3 sm:px-3.5 transition-colors ${
                      isLight
                        ? "bg-slate-50 md:bg-transparent border border-slate-200 md:border-none focus-within:bg-purple-50/40"
                        : "bg-white/[0.03] md:bg-transparent border border-white/5 md:border-none focus-within:border-purple-500/40"
                    }`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                        isLight ? "bg-purple-100 text-purple-600 border border-purple-200" : "bg-purple-500/15 border border-purple-500/30 text-purple-400"
                      }`}>
                        <MapPin size={16} />
                      </div>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => setShowLocationSuggestions(true)}
                        placeholder="Location or 'Remote'…"
                        className={`w-full min-w-0 bg-transparent text-xs sm:text-sm font-medium outline-none focus:outline-none ${
                          isLight ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-400"
                        }`}
                      />
                      {location && (
                        <button
                          type="button"
                          onClick={() => handleLocationChange("")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Location Suggestions Popover */}
                    <AnimatePresence>
                      {showLocationSuggestions && filteredLocations.length > 0 && (
                        <motion.div
                          ref={locationSuggestionsRef}
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 md:w-64 mt-2 z-50 max-h-72 overflow-y-auto rounded-2xl border border-border bg-white dark:bg-[#0f172a] shadow-2xl backdrop-blur-2xl p-2 text-xs text-left"
                        >
                          <div className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
                            <MapPin size={12} className="text-rose-500" />
                            Suggested Locations
                          </div>
                          <div className="space-y-0.5 mt-1">
                            {filteredLocations.map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => handleSelectSuggestion("location", loc)}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-heading hover:bg-surface-elevated flex items-center justify-between group transition-colors cursor-pointer"
                              >
                                <span className="truncate">{loc}</span>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity shrink-0" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Search Action Button */}
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-6 lg:px-8 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 font-satoshi shadow-indigo-600/25 hover:shadow-indigo-600/40"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)",
                      color: "#FFFFFF",
                    }}
                  >
                    <Sparkles size={15} style={{ color: "#FFFFFF" }} className="!text-white fill-white/30 shrink-0" />
                    <span style={{ color: "#FFFFFF" }} className="!text-white font-extrabold tracking-tight">Search Jobs</span>
                  </button>
                </div>
              </form>

              {/* Popular Search Keywords */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider font-satoshi flex items-center gap-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  <TrendingUp size={12} className={isLight ? "text-indigo-600" : "text-indigo-400"} /> Popular:
                </span>
                {POPULAR_KEYWORDS.map((k) => (
                  <Link
                    key={k.label}
                    to={`/find-jobs?keyword=${encodeURIComponent(k.query)}`}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white/90 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 shadow-xs"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                    }`}
                  >
                    {k.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Social Proof Trust Strip */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2"
            >
              <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Employer-verified listings</span>
              </div>
              <div className={`hidden sm:block h-6 w-px ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
              <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                <Zap size={16} className="text-indigo-500 shrink-0" />
                <span>AI-matched to your skills</span>
              </div>
              <div className={`hidden sm:block h-6 w-px ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
              <div className={`flex items-center gap-2 text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                <MessageSquare size={16} className="text-cyan-500 shrink-0" />
                <span>Direct recruiter messaging</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT HERO COLUMN: PRESERVED /jobs1.png WITH 3D GLASS BADGES
             ══════════════════════════════════════════════════════════ */}
          <motion.div
            variants={imageContainerVariants}
            initial="hidden"
            animate="visible"
            className="relative lg:col-span-5 flex items-center justify-center mt-4 lg:mt-0"
          >
            {/* Ambient Radial Backlight Pedestal */}
            <div className={`pointer-events-none absolute h-[380px] w-[380px] rounded-full blur-[140px] ${isLight ? "bg-gradient-to-tr from-indigo-400/20 via-purple-400/15 to-cyan-400/10" : "bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-cyan-500/15"}`} />
            
            {/* Radial Pedestal Floor Glow */}
            <div className={`pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 h-[120px] w-[340px] rounded-full blur-[80px] ${isLight ? "bg-indigo-400/15" : "bg-indigo-500/20"}`} />

            <div className="relative w-full max-w-[460px] sm:max-w-[520px]">
              
              {/* ── 3D Floating Badge 1: AI Match Fit (Top Left) ── */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute left-2 sm:-left-6 top-2 sm:top-10 z-20 flex items-center gap-2 sm:gap-3 rounded-2xl border p-2 sm:p-3.5 backdrop-blur-2xl scale-[0.84] sm:scale-100 origin-top-left shadow-xl max-w-[180px] sm:max-w-none ${
                  isLight
                    ? "border-slate-200/90 bg-white/95 shadow-xl text-slate-800"
                    : "border-white/15 bg-[#090e1c]/95 shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-white"
                }`}
              >
                <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-500 shadow-md">
                  <Sparkles size={16} className="fill-amber-400/20 animate-pulse" />
                </div>
                <div className="space-y-0.5 text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className={`text-[11px] sm:text-xs font-extrabold font-satoshi truncate ${isLight ? "text-slate-900" : "text-white"}`}>AI Match Analysis</h4>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-semibold text-emerald-600 truncate">Semantic Fit</p>
                </div>
              </motion.div>

              {/* ── 3D Floating Badge 2: Fast Turnaround (Bottom Right) ── */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className={`absolute right-2 sm:-right-5 bottom-2 sm:bottom-10 z-20 flex items-center gap-2 sm:gap-3 rounded-2xl border p-2 sm:p-3.5 backdrop-blur-2xl scale-[0.84] sm:scale-100 origin-bottom-right shadow-xl max-w-[180px] sm:max-w-none ${
                  isLight
                    ? "border-slate-200/90 bg-white/95 shadow-xl text-slate-800"
                    : "border-white/15 bg-[#090e1c]/95 shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-white"
                }`}
              >
                <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-600 shadow-md">
                  <Clock size={16} />
                </div>
                <div className="space-y-0.5 text-left min-w-0">
                  <h4 className={`text-[11px] sm:text-xs font-extrabold font-satoshi truncate ${isLight ? "text-slate-900" : "text-white"}`}>Direct Pipeline</h4>
                  <p className={`text-[9px] sm:text-[11px] font-semibold truncate ${isLight ? "text-indigo-600" : "text-indigo-300"}`}>Verified Employers</p>
                </div>
              </motion.div>

              {/* ── PRESERVED MASTER HERO ILLUSTRATION ── */}
              <div className="relative z-10">
                <img
                  src="/jobs1.png"
                  alt="AI Job Platform Career Dashboard"
                  loading="eager"
                  className="w-full object-contain drop-shadow-[0_25px_65px_rgba(99,102,241,0.25)] transition-transform duration-500 hover:scale-[1.015]"
                />
              </div>

            </div>
          </motion.div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            PERFECTLY CENTERED GLASS TELEMETRY COMMAND DOCK
           ══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-12 sm:mt-18 w-full max-w-6xl mx-auto"
        >
          <div
            className={`rounded-3xl border p-4 sm:p-6 backdrop-blur-2xl shadow-xl transition-all duration-300 ${
              isLight
                ? "border-slate-200/90 bg-white/85 shadow-indigo-500/5 hover:border-indigo-300 hover:shadow-2xl"
                : "border-white/10 bg-[#080d1a]/85 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-indigo-500/40"
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:divide-x divide-slate-200/60 dark:divide-white/10">
              {HERO_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                const displayVal = stat.id === "jobs" ? liveJobCount : stat.value;

                return (
                  <Link
                    key={stat.id}
                    to="/find-jobs"
                    className={`group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 sm:gap-4 p-2 sm:p-2.5 rounded-2xl md:rounded-none transition-all duration-300 hover:-translate-y-1 cursor-pointer min-w-0 ${
                      idx !== 0 ? "md:pl-4 lg:pl-6" : ""
                    } ${
                      isLight ? "bg-slate-50/70 md:bg-transparent" : "bg-white/[0.02] md:bg-transparent"
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} !text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                    >
                      <Icon size={20} className="!text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-lg sm:text-2xl font-black font-satoshi tracking-tight truncate transition-colors ${
                          isLight
                            ? "text-slate-900 group-hover:text-indigo-600"
                            : "text-white group-hover:text-indigo-300"
                        }`}
                      >
                        {displayVal}
                      </div>
                      <div
                        className={`text-xs font-bold font-satoshi truncate ${
                          isLight ? "text-slate-700" : "text-slate-300"
                        }`}
                      >
                        {stat.label}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium hidden xs:block">
                        {stat.subtext}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
});

export default DreamJob;