import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconMapPin,
  IconUsers,
  IconBriefcase,
  IconWorld,
  IconSparkles,
  IconChevronRight,
  IconDiamond,
  IconHeartHandshake,
  IconRocket,
  IconShieldCheck,
  IconCoffee,
  IconSchool,
  IconPlaneTilt,
  IconMedicalCross,
  IconCircleCheck,
  IconBookmark,
  IconShare,
  IconExternalLink,
  IconChartBar,
  IconBuilding,
  IconPhone,
  IconMail,
  IconCalendar,
  IconTarget,
  IconLoader2,
  IconClock,
  IconCurrencyRupee,
  IconSearch,
  IconInbox,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { getCompanyById, getCompanyJobs } from "../State/CompanySlice";
import { useToast } from "../components/ui/ToastNotification";
import { resolveImageUrl } from "../utils/assetUtils";

/* ═══════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const modeColor = {
  REMOTE: "text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
  HYBRID: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
  ON_SITE: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
  ONSITE: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
};

/* ─── Benefit icon map ─── */
const BENEFIT_ICONS = [
  IconMedicalCross,
  IconPlaneTilt,
  IconSchool,
  IconCoffee,
  IconHeartHandshake,
  IconShieldCheck,
  IconDiamond,
  IconChartBar,
  IconRocket,
  IconSparkles,
];

function parseBenefits(str) {
  if (!str) return [];
  return str
    .split(/[,.]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label, i) => ({ label, icon: BENEFIT_ICONS[i % BENEFIT_ICONS.length] }));
}

/* ─── Format salary ─── */
function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `${(n / 100000).toFixed(0)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return `${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

/* ─── Time ago ─── */
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/* ═══════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════ */

/* ── Tab Nav ── */
function TabNav({ active, onChange, jobCount }) {
  const tabs = [
    { key: "Overview", label: "Overview" },
    { key: "Open Roles", label: `Open Roles${jobCount > 0 ? ` (${jobCount})` : ""}` },
    { key: "Benefits", label: "Benefits" },
    { key: "Contact", label: "Contact" },
  ];
  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`relative px-5 py-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            active === key ? "text-heading" : "text-muted hover:text-body"
          }`}
        >
          {label}
          {active === key && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Job Card Row ── */
function JobRow({ job }) {
  const salary = formatSalary(job.minimumSalary, job.maximumSalary);
  const posted = timeAgo(job.createdAt || job.createdOn);
  const modeKey = (job.workingMode ?? "").toUpperCase().replace(/\s+/g, "_");
  const modeClass = modeColor[modeKey] ?? "text-muted bg-surface-elevated border-border";
  const modeLabel = job.workingMode
    ? job.workingMode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/jobs/${job.id}`}
        className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-glow-primary hover:bg-surface-elevated/60"
      >
        {/* Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
          <IconBriefcase size={20} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-satoshi text-base font-bold text-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {job.title ?? job.jobTitle}
            </h3>
            {job.jobType && (
              <span className="rounded-full bg-surface-elevated border border-border px-2.5 py-0.5 text-xs text-muted">
                {job.jobType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            )}
            {job.urgentHiring && (
              <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            {(job.city || job.state || job.country) && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <IconMapPin size={12} className="text-indigo-600 dark:text-indigo-400" />
                {[job.city, job.state, job.country].filter(Boolean).join(", ")}
              </span>
            )}
            {modeLabel && (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${modeClass}`}>
                {modeLabel}
              </span>
            )}
            {job.experienceLevel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 dark:border-primary/30 bg-indigo-50 dark:bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <IconBriefcase size={11} /> {job.experienceLevel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            )}
            {posted && (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <IconClock size={11} /> {posted}
              </span>
            )}
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((s) => (
                <span key={s} className="rounded-full border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Salary + CTA */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
          {salary ? (
            <span className="inline-flex items-center gap-0.5 text-sm font-bold text-heading">
              <IconCurrencyRupee size={14} className="text-emerald-600 dark:text-emerald-400" />
              {salary}
            </span>
          ) : (
            <span className="text-xs text-muted">Salary TBD</span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-xl gradient-bg-signature px-4 py-2 text-xs font-semibold text-white opacity-90 group-hover:opacity-100 transition-opacity">
            Apply <IconChevronRight size={13} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Empty state ── */
function EmptyJobs() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated mb-4">
        <IconInbox size={28} className="text-muted" />
      </div>
      <p className="text-base font-semibold text-heading mb-1">No open roles</p>
      <p className="text-sm text-muted max-w-xs">This company has no active job postings at the moment. Check back later!</p>
    </div>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-inter text-body flex items-center justify-center">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 mesh-gradient" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10">
          <IconLoader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm text-muted font-medium">Loading company profile…</p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function CompanyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("Overview");
  const [saved, setSaved] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const rolesRef = useRef(null);

  const { id } = useParams();

  const { selectedCompany: company, loading } = useAppSelector((state) => state.company);
  const { companyJobs, loading: jobsLoading } = useAppSelector((state) => state.company);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (id) {
      dispatch(getCompanyById(id));
      dispatch(getCompanyJobs({ companyId: id, size: 100 }));
    }
  }, [id]);

  if (loading && !company) return <LoadingSkeleton />;
  if (!company) return <LoadingSkeleton />;

  /* ── Derived values ── */
  const benefits = parseBenefits(company.benefits);
  const websiteDisplay = company.website
    ? company.website.replace(/^https?:\/\//, "")
    : null;

  const stats = [
    { label: "Company Size", value: company.companySize || "—", icon: IconUsers },
    { label: "Headquarters", value: company.headquarters ? company.headquarters.split(",")[0] : "—", icon: IconMapPin },
    { label: "Founded", value: company.foundedYear || "—", icon: IconRocket },
    { label: "Open Roles", value: companyJobs?.length > 0 ? String(companyJobs.length) : (company.totalJobs ?? "—"), icon: IconBriefcase },
  ];

  const details = [
    { label: "Industry", value: company.industry, icon: IconBuildingSkyscraper },
    { label: "Founded", value: company.foundedYear, icon: IconCalendar },
    { label: "Company Size", value: company.companySize, icon: IconUsers },
    { label: "Headquarters", value: company.headquarters, icon: IconMapPin },
  ].filter((d) => d.value);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-inter text-body">

      {/* ── Background Effects ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 mesh-gradient" />
      <div aria-hidden="true" className="pointer-events-none fixed -top-24 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[180px]" />
      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-violet/3 blur-[240px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.022]"
        style={{ backgroundImage: "radial-gradient(circle, #94A3B8 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      <div className="relative z-10">

        {/* ══════════════════════════════
            HERO BANNER
        ══════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-[#1a1f3a] via-[#0f172a] to-[#06080F] border-b border-border">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />

          <div className="relative section-container pt-8 pb-0">
            {/* Back + Actions */}
            <div className="flex items-center justify-between mb-6 sm:mb-10 gap-3">
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/15 transition-all cursor-pointer"
              >
                <IconArrowLeft size={16} className="text-white/60 group-hover:text-white transition-colors group-hover:-translate-x-0.5" />
                Back
              </motion.button>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={() => {
                    const next = !saved;
                    setSaved(next);
                    if (next) {
                      toast.success("Company bookmarked to your followed list!");
                    } else {
                      toast.info("Company removed from bookmarks.");
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer backdrop-blur ${
                    saved
                      ? "border-primary/40 bg-primary/25 text-white"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/15"
                  }`}
                >
                  <IconBookmark size={15} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Company profile link copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-all cursor-pointer backdrop-blur"
                >
                  <IconShare size={15} />
                  Share
                </button>
              </motion.div>
            </div>

            {/* Company Identity */}
            <div className="flex flex-col sm:flex-row items-start gap-6 pb-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-white p-4 shadow-2xl ring-4 ring-white/10 overflow-hidden">
                  {company.logoUrl || company.logo ? (
                    <img
                      src={resolveImageUrl(company.logoUrl || company.logo)}
                      alt={company.companyName}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary font-satoshi select-none">
                      {company.companyName?.charAt(0) ?? "C"}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-success shadow-lg">
                  <IconCircleCheck size={16} className="text-white" />
                </span>
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-satoshi">{company.companyName}</h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-warm/15 border border-accent-warm/30 px-3 py-1 text-xs font-bold text-accent-warm">
                      <IconSparkles size={12} /> Verified
                    </span>
                  </div>

                  {company.description && (
                    <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50">
                    {company.industry && (
                      <span className="inline-flex items-center gap-1.5">
                        <IconBuildingSkyscraper size={14} /> {company.industry}
                      </span>
                    )}
                    {company.headquarters && (
                      <span className="inline-flex items-center gap-1.5">
                        <IconMapPin size={14} /> {company.headquarters}
                      </span>
                    )}
                    {company.companySize && (
                      <span className="inline-flex items-center gap-1.5">
                        <IconUsers size={14} /> {company.companySize}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <IconWorld size={14} /> {websiteDisplay}
                        <IconExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-px bg-white/5 sm:bg-white/10 p-2 sm:p-0 rounded-2xl sm:rounded-none overflow-hidden my-4 sm:my-0 sm:border-t sm:border-white/10"
            >
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center justify-center py-3.5 sm:py-5 gap-1 px-2 rounded-xl sm:rounded-none bg-white/[0.03] sm:bg-transparent">
                  <span className="text-base sm:text-2xl font-extrabold text-white font-satoshi text-center leading-tight">{value}</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/60 text-center">
                    <Icon size={12} /> {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════
            MAIN BODY
        ══════════════════════════════ */}
        <div className="section-container py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left: Tab Content ── */}
            <div className="flex-1 min-w-0">

              {/* Tab Nav */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-7"
              >
                <TabNav active={tab} onChange={setTab} jobCount={companyJobs.length} />
              </motion.div>

              <AnimatePresence mode="wait">

                {/* ═══ OVERVIEW TAB ═══ */}
                {tab === "Overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-8"
                  >
                    {/* About */}
                    <section>
                      <h2 className="heading-sm mb-4">About {company.companyName}</h2>
                      <p className="text-body leading-relaxed">{company.description}</p>
                    </section>

                    {/* Mission */}
                    {company.mission && (
                      <section>
                        <h3 className="text-base font-bold text-heading font-satoshi mb-3 flex items-center gap-2">
                          <IconTarget size={18} className="text-indigo-600 dark:text-indigo-400" /> Our Mission
                        </h3>
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                          <p className="text-body leading-relaxed italic">"{company.mission}"</p>
                        </div>
                      </section>
                    )}

                    {/* Quick facts */}
                    <section>
                      <h3 className="text-base font-bold text-heading font-satoshi mb-4">Quick Facts</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          company.foundedYear && { icon: IconCalendar, title: "Founded", desc: company.foundedYear },
                          company.headquarters && { icon: IconMapPin, title: "Headquarters", desc: company.headquarters },
                          company.companySize && { icon: IconUsers, title: "Company Size", desc: company.companySize },
                          company.industry && { icon: IconBuildingSkyscraper, title: "Industry", desc: company.industry },
                        ]
                          .filter(Boolean)
                          .map(({ icon: Icon, title, desc }) => (
                            <div
                              key={title}
                              className="rounded-2xl border border-border bg-surface p-5 flex items-start gap-4 hover:border-primary/20 transition-colors"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
                                <Icon size={18} />
                              </div>
                              <div>
                                <p className="font-semibold text-heading text-sm">{title}</p>
                                <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* ── Company Jobs (Overview teaser) ── */}
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-heading font-satoshi flex items-center gap-2">
                          <IconBriefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                          Open Positions
                          {companyJobs.length > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-indigo-50 dark:bg-primary/15 border border-indigo-200 dark:border-primary/25 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              {companyJobs.length}
                            </span>
                          )}
                        </h3>
                        {companyJobs.length > 3 && (
                          <button
                            onClick={() => setTab("Open Roles")}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            See all {companyJobs.length} roles →
                          </button>
                        )}
                      </div>

                      {jobsLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <IconLoader2 size={24} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                        </div>
                      ) : companyJobs.length === 0 ? (
                        <EmptyJobs />
                      ) : (
                        <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="visible">
                          {companyJobs.slice(0, 3).map((job) => (
                            <JobRow key={job.id} job={job} />
                          ))}
                        </motion.div>
                      )}
                    </section>

                    {/* Benefits teaser */}
                    {benefits.length > 0 && (
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-bold text-heading font-satoshi">Benefits & Perks</h3>
                          <button
                            onClick={() => setTab("Benefits")}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            See all →
                          </button>
                        </div>
                        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={stagger} initial="hidden" animate="visible">
                          {benefits.slice(0, 4).map(({ label, icon: Icon }) => (
                            <motion.div
                              key={label}
                              variants={fadeUp}
                              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
                                <Icon size={16} />
                              </div>
                              <span className="text-sm text-body">{label}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </section>
                    )}
                  </motion.div>
                )}

                {/* ═══ OPEN ROLES TAB ═══ */}
                {tab === "Open Roles" && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="heading-sm">
                        Open Roles
                        {companyJobs.length > 0 && (
                          <span className="ml-2 text-lg text-muted font-normal">({companyJobs.length})</span>
                        )}
                      </h2>
                    </div>

                    {jobsLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <IconLoader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                      </div>
                    ) : companyJobs.length === 0 ? (
                      <EmptyJobs />
                    ) : (() => {
                      const BATCH = 8;
                      const visible = showAllJobs ? companyJobs : companyJobs.slice(0, BATCH);
                      const hasMore = companyJobs.length > BATCH;
                      return (
                        <>
                          <motion.div
                            ref={rolesRef}
                            className="space-y-3"
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                          >
                            {visible.map((job) => (
                              <JobRow key={job.id} job={job} />
                            ))}
                          </motion.div>

                          {hasMore && (
                            <motion.div
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                              className="mt-6 flex flex-col items-center gap-3"
                            >
                              {/* Progress indicator */}
                              {!showAllJobs && (
                                <div className="w-full flex flex-col items-center gap-2">
                                  <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-gradient-to-r from-primary to-violet"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(Math.min(BATCH, companyJobs.length) / companyJobs.length) * 100}%` }}
                                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted">
                                    Showing <span className="font-semibold text-heading">{BATCH}</span> of{" "}
                                    <span className="font-semibold text-heading">{companyJobs.length}</span> jobs
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setShowAllJobs((prev) => {
                                      if (prev) {
                                        // scroll back to top of roles section
                                        rolesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }
                                      return !prev;
                                    });
                                  }}
                                  className="inline-flex items-center gap-2.5 rounded-xl gradient-bg-signature px-6 py-3 text-sm font-semibold text-white shadow-button hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-all cursor-pointer"
                                >
                                  {showAllJobs ? (
                                    <>
                                      <IconChevronRight size={15} className="rotate-[-90deg]" />
                                      Show Less
                                    </>
                                  ) : (
                                    <>
                                      <IconBriefcase size={15} />
                                      Show All {companyJobs.length} Jobs
                                    </>
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ═══ BENEFITS TAB ═══ */}
                {tab === "Benefits" && (
                  <motion.div
                    key="benefits"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <h2 className="heading-sm mb-2">Benefits & Perks</h2>
                    <p className="text-body mb-6">
                      {company.companyName} offers the following benefits to help you thrive at work and beyond.
                    </p>
                    {benefits.length > 0 ? (
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                      >
                        {benefits.map(({ icon: Icon, label }) => (
                          <motion.div
                            key={label}
                            variants={fadeUp}
                            className="group rounded-2xl border border-border bg-surface p-6 flex items-start gap-4 hover:border-primary/25 hover:shadow-glow-primary transition-all duration-300"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-primary/15 transition-colors">
                              <Icon size={22} />
                            </div>
                            <div>
                              <p className="font-semibold text-heading">{label}</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted text-sm">
                        No benefits information available yet.
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ CONTACT TAB ═══ */}
                {tab === "Contact" && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="heading-sm mb-2">Contact Information</h2>
                      <p className="text-body">Get in touch with {company.companyName} directly.</p>
                    </div>

                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      variants={stagger}
                      initial="hidden"
                      animate="visible"
                    >
                      {[
                        company.email && { icon: IconMail, label: "Email", value: company.email, href: `mailto:${company.email}` },
                        company.phone && { icon: IconPhone, label: "Phone", value: company.phone, href: `tel:${company.phone}` },
                        company.website && { icon: IconWorld, label: "Website", value: websiteDisplay, href: company.website },
                        company.headquarters && { icon: IconMapPin, label: "Address", value: company.headquarters, href: null },
                      ]
                        .filter(Boolean)
                        .map(({ icon: Icon, label, value, href }) => (
                          <motion.div
                            key={label}
                            variants={fadeUp}
                            className="group rounded-2xl border border-border bg-surface p-5 flex items-start gap-4 hover:border-primary/25 hover:shadow-glow-primary transition-all duration-300"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-primary/15 transition-colors">
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="text-xs text-muted mb-0.5">{label}</p>
                              {href ? (
                                <a
                                  href={href}
                                  target={href.startsWith("http") ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-all"
                                >
                                  {value}
                                </a>
                              ) : (
                                <p className="text-sm font-semibold text-heading">{value}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Right: Sidebar ── */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24"
            >
              {/* CTA */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 text-center">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                  {companyJobs.length > 0 ? `${companyJobs.length} Open Positions` : "Hiring Now"}
                </p>
                <h3 className="text-lg font-extrabold text-heading font-satoshi mb-1">Ready to join?</h3>
                <p className="text-xs text-muted mb-4">Apply now and take the first step toward your dream career at {company.companyName}.</p>
                <button
                  onClick={() => setTab("Open Roles")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-bg-signature py-3 text-sm font-semibold text-white shadow-button hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-all cursor-pointer"
                >
                  <IconSparkles size={15} /> View All Roles
                </button>
              </div>

              {/* Company Details */}
              <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5">
                <h3 className="text-sm font-bold text-heading">Company Details</h3>
                {details.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                      <Icon size={14} className="text-muted" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-xs text-muted shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-heading text-right truncate">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Quick Links */}
              {(company.email || company.phone || company.website) && (
                <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                  <h3 className="text-sm font-bold text-heading">Contact</h3>
                  {company.email && (
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-3 text-xs text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated group-hover:bg-indigo-50 dark:group-hover:bg-primary/10 transition-colors">
                        <IconMail size={14} />
                      </div>
                      <span className="truncate">{company.email}</span>
                    </a>
                  )}
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="flex items-center gap-3 text-xs text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated group-hover:bg-indigo-50 dark:group-hover:bg-primary/10 transition-colors">
                        <IconPhone size={14} />
                      </div>
                      <span>{company.phone}</span>
                    </a>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-xs text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated group-hover:bg-indigo-50 dark:group-hover:bg-primary/10 transition-colors">
                        <IconWorld size={14} />
                      </div>
                      <span className="truncate">{websiteDisplay}</span>
                      <IconExternalLink size={11} className="shrink-0 ml-auto" />
                    </a>
                  )}
                </div>
              )}
            </motion.aside>

          </div>
        </div>

      </div>
    </div>
  );
}
