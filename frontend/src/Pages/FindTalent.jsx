import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  Filter,
  X,
  ChevronDown,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  ArrowRight,
  SlidersHorizontal,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchTalent } from "../api/talentApi";

const talentGradients = [
  "from-indigo-600 to-violet-600",
  "from-cyan-600 to-blue-600",
  "from-violet-600 to-pink-600",
  "from-amber-600 to-orange-600",
  "from-emerald-600 to-teal-600",
  "from-rose-600 to-purple-600",
];

import { getAssetUrl } from "../utils/assetUtils";

const getFullImageUrl = (rawPath) => {
  if (!rawPath) return null;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }
  const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
  if (cleanPath.startsWith("uploads/")) {
    return getAssetUrl(cleanPath);
  }
  return getAssetUrl(`uploads/${cleanPath}`);
};

const skillOptions = [
  "Java",
  "Spring Boot",
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Figma",
];

const experienceLevels = [
  { label: "Entry Level", value: "ENTRY_LEVEL" },
  { label: "Mid Level", value: "MID_LEVEL" },
  { label: "Senior Level", value: "SENIOR_LEVEL" },
  { label: "Lead Architect", value: "LEAD" },
];

const availabilityOptions = [
  { label: "Open To Work", value: "OPEN_TO_WORK" },
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Freelance", value: "FREELANCE" },
];

const locationOptions = [
  "All Locations",
  "Nashik",
  "Pune",
  "Mumbai",
  "Bangalore",
  "Delhi",
  "Hyderabad",
  "Remote",
];

function AvailabilityBadge({ type }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 font-satoshi">
      {type ? String(type).replace(/_/g, " ") : "OPEN TO WORK"}
    </span>
  );
}

function ExperienceBadge({ level }) {
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 font-satoshi">
      {level ? String(level).replace(/_/g, " ") : "MID LEVEL"}
    </span>
  );
}

function TalentCard({ talent, index }) {
  const navigate = useNavigate();
  const initials = (talent.name || "Candidate")
    .split(" ")
    .map((n) => n[0])
    .join("");

  const gradient = talentGradients[index % talentGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group rounded-[20px] border border-border bg-surface p-5 sm:p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] flex flex-col justify-between"
    >
      <div>
        {/* Top: Avatar + info */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-border bg-surface-elevated">
            {talent.profileImage ? (
              <img
                src={talent.profileImage}
                alt={talent.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
                }}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-base font-black text-white`}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-heading font-satoshi">
              {talent.name}
            </h3>
            <p className="truncate text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-satoshi">
              {talent.title}
            </p>
            {talent.company && (
              <p className="truncate text-[11px] text-muted font-satoshi mt-0.5">
                {talent.company}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {talent.skills.slice(0, 4).map((skill, i) => (
              <span
                key={typeof skill === "string" ? skill : i}
                className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 font-satoshi"
              >
                {typeof skill === "string" ? skill : skill.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-muted italic font-satoshi">No listed skills</p>
        )}

        {/* Badges: Experience Level & Status */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <ExperienceBadge level={talent.experience} />
          <AvailabilityBadge type={talent.availability} />
        </div>

        {/* Location */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted font-satoshi">
          <MapPin size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="truncate">{talent.location}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <button
        onClick={() => navigate(`/talent-profile/${talent.id}`, { state: { talent: talent.raw } })}
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-10 px-4 text-xs font-bold !text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-satoshi"
      >
        <span>View Profile</span>
        <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}

function FindTalent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [apiTalentList, setApiTalentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const toggleFilter = (arr, setArr, value) => {
    setArr((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSelectedLocation("All Locations");
  };

  /* ── Lock body scroll when mobile drawer is open ── */
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchTalentsFromBackend = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (searchQuery.trim()) params.keyword = searchQuery.trim();
        if (selectedSkills.length > 0) params.skill = selectedSkills.join(",");
        if (selectedExperience.length > 0) params.experienceLevel = selectedExperience.join(",");
        if (selectedAvailability.length > 0) params.availability = selectedAvailability.join(",");
        if (selectedLocation && selectedLocation !== "All Locations") params.location = selectedLocation;

        const res = await searchTalent(params);
        if (!isMounted) return;

        const content = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(content)) {
          const mapped = content.map((item, idx) => ({
            id: item.id,
            name: item.name || item.fullName || item.user?.name || "Candidate Profile",
            title: item.headline || item.professionalTitle || item.title || item.role || "Software Specialist",
            company: item.currentCompany || item.company,
            skills: Array.isArray(item.skills) ? item.skills : [],
            availability: item.availability ? item.availability.replace(/_/g, " ") : "OPEN TO WORK",
            location: item.location || (item.city ? `${item.city}, ${item.country || ''}` : "Remote"),
            experience: item.experienceLevel ? item.experienceLevel.replace(/_/g, " ") : "MID LEVEL",
            profileImage: getFullImageUrl(item.profileImage),
            raw: item,
          }));
          setApiTalentList(mapped);
        } else {
          setApiTalentList([]);
        }
      } catch (err) {
        if (isMounted) setApiTalentList([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTalentsFromBackend();
    return () => { isMounted = false; };
  }, [searchQuery, selectedSkills, selectedExperience, selectedAvailability, selectedLocation]);

  const activeFilterCount =
    selectedSkills.length +
    selectedExperience.length +
    selectedAvailability.length +
    (selectedLocation !== "All Locations" ? 1 : 0);

  /* --- Filter Controls Content --- */
  const FilterContent = () => (
    <div className="space-y-6 font-satoshi pb-4">
      {/* Skills Filter */}
      <div>
        <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-heading font-satoshi">
          Skills & Technologies
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
          {skillOptions.map((skill) => (
            <label
              key={skill}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-surface-hover"
            >
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => toggleFilter(selectedSkills, setSelectedSkills, skill)}
                className="h-4 w-4 rounded border-border bg-surface accent-indigo-600"
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-heading font-satoshi">
          Experience Level
        </h4>
        <div className="space-y-1.5">
          {experienceLevels.map((lvl) => (
            <label
              key={lvl.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-surface-hover"
            >
              <input
                type="checkbox"
                checked={selectedExperience.includes(lvl.value)}
                onChange={() => toggleFilter(selectedExperience, setSelectedExperience, lvl.value)}
                className="h-4 w-4 rounded border-border bg-surface accent-indigo-600"
              />
              <span>{lvl.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-heading font-satoshi">
          Work Availability
        </h4>
        <div className="space-y-1.5">
          {availabilityOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-xs font-semibold text-body transition-colors hover:bg-surface-hover"
            >
              <input
                type="checkbox"
                checked={selectedAvailability.includes(opt.value)}
                onChange={() => toggleFilter(selectedAvailability, setSelectedAvailability, opt.value)}
                className="h-4 w-4 rounded border-border bg-surface accent-indigo-600"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-heading font-satoshi">
          Target Location
        </h4>
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-surface-elevated h-10 px-3.5 text-xs font-bold text-heading outline-none focus:border-indigo-500/60"
            style={{ colorScheme: 'auto' }}
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc} className="bg-surface text-heading">
                {loc}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* Clear All Button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full rounded-xl border border-rose-500/30 h-10 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/10 cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Reset All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <section className="relative min-h-screen overflow-x-hidden font-satoshi bg-background text-body" aria-label="Find talent">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full" style={{ background: 'rgba(99,102,241,0.07)', filter: 'blur(180px)' }} />

      {/* HERO SECTION */}
      <div className="relative z-10 section-container section-padding pb-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-5 py-1.5"
          >
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Candidate Directory
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl font-black text-heading leading-tight sm:text-4xl md:text-5xl"
          >
            Discover verified <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">candidate talent</span>
          </motion.h1>

          <p className="mx-auto mt-3 max-w-2xl text-muted text-sm sm:text-base">
            Browse registered job seekers directly from your backend candidate directory. Inspect verified profiles, skills, and resumes.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="flex items-center rounded-2xl border border-border bg-surface p-1.5 shadow-xl">
              <Search size={18} className="ml-3 shrink-0 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, headline, or skill…"
                className="min-w-0 flex-1 h-10 bg-transparent px-3 text-xs font-semibold text-heading placeholder:text-muted outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-1 rounded-lg p-2 text-muted hover:text-heading"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-10 px-5 text-xs font-black !text-white shadow-lg cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT — Sidebar + Grid */}
      <div className="relative z-10 section-container pb-20 lg:pb-28">
        {/* Mobile Filter Toggle Button */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-heading shadow-md cursor-pointer"
          >
            <SlidersHorizontal size={16} className="text-indigo-500" />
            <span>Filter Candidates</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black !text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Slide-Over Drawer on Mobile */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="fixed inset-y-0 left-0 z-50 w-full sm:w-80 max-w-[85vw] overflow-y-auto border-r border-border bg-surface p-5 sm:p-6 shadow-2xl lg:hidden flex flex-col justify-between"
              >
                <div>
                  <div className="mb-5 sm:mb-6 flex items-center justify-between pb-3 border-b border-border">
                    <h3 className="text-sm sm:text-base font-black text-heading flex items-center gap-2">
                      <SlidersHorizontal size={18} className="text-indigo-500" />
                      Filter Candidates
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="rounded-lg p-2 text-muted hover:text-heading cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <FilterContent />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold !text-white shadow-lg cursor-pointer"
                >
                  Show Results ({apiTalentList.length})
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex gap-6 items-start">
          {/* Desktop Sidebar (Sticky with internal scroll) */}
          <aside className="hidden w-[270px] shrink-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-120px)] flex flex-col rounded-[20px] border border-border bg-surface p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between shrink-0 pb-3 border-b border-border">
                <h3 className="text-sm font-black text-heading flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-indigo-500" />
                  Filter Candidates
                </h3>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black !text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-indigo-500/30">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Candidate Grid Area */}
          <div className="min-w-0 flex-1">
            {/* Header Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold text-muted">
                Showing <span className="text-heading font-black">{apiTalentList.length}</span> registered candidates
              </p>

              {/* Active Filter Pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedSkills.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleFilter(selectedSkills, setSelectedSkills, s)}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30"
                    >
                      {s} <X size={12} />
                    </button>
                  ))}
                  {selectedExperience.map((e) => (
                    <button
                      key={e}
                      onClick={() => toggleFilter(selectedExperience, setSelectedExperience, e)}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-300 hover:bg-purple-500/30"
                    >
                      {e} <X size={12} />
                    </button>
                  ))}
                  {selectedAvailability.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleFilter(selectedAvailability, setSelectedAvailability, a)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/30"
                    >
                      {a} <X size={12} />
                    </button>
                  ))}
                  {selectedLocation !== "All Locations" && (
                    <button
                      onClick={() => setSelectedLocation("All Locations")}
                      className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/30"
                    >
                      {selectedLocation} <X size={12} />
                    </button>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-bold text-rose-500 hover:underline ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Grid State */}
            {isLoading ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 rounded-[20px] border border-border bg-surface p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-xs font-bold text-muted">Loading candidates from backend directory...</p>
              </div>
            ) : apiTalentList.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {apiTalentList.map((talent, index) => (
                  <TalentCard key={talent.id || index} talent={talent} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-surface py-16 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <Users size={26} className="text-indigo-500" />
                </div>
                <h3 className="text-base font-black text-heading">No Candidate Profiles Found</h3>
                <p className="mt-2 max-w-sm text-xs text-muted font-medium">
                  {searchQuery || activeFilterCount > 0
                    ? "No registered candidates matched your active search filters."
                    : "No candidates have published a talent profile in the database yet."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 rounded-xl border border-border bg-surface-elevated h-10 px-5 text-xs font-bold text-heading hover:bg-surface-hover cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FindTalent;
