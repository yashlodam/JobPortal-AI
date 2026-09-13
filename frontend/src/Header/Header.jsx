import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Avatar, Button, Indicator } from "@mantine/core";
import {
  Sparkles,
  Bell,
  MessageSquare,
  Settings,
  Search,
  Menu,
  X,
  Plus,
  ChevronDown,
  FileText,
  Video,
  CheckCircle2,
  Compass,
  TrendingUp,
  Briefcase,
  Bookmark,
  Calendar,
  Award,
  Layers,
  UserCheck,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "../features/notifications/components/NotificationBell";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { useSelector } from "react-redux";
import { logout } from "../State/AuthSlic";
import { selectProfile } from "../State/profileSlice";
import { resolveImageUrl } from "../utils/assetUtils";
import { fetchMySavedJobsThunk } from "../State/savedJobThunk";
import { fetchMyApplicationsThunk } from "../State/applicationThunk";
import { getUnreadCountApi } from "../api/chatApi";
import { useTheme } from "../context/ThemeContext";


/* ────────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────────── */
const USER_NAV_LINKS = [
  { name: "Find Jobs", url: "/find-jobs" },
  {
    name: "My Jobs",
    url: "/my-jobs",
    children: [
      {
        name: "Applied Jobs",
        url: "/my-jobs/applied",
        desc: "Track status & pipeline progress of active applications",
        icon: Briefcase,
      },
      {
        name: "Saved Jobs",
        url: "/my-jobs/saved",
        desc: "Bookmarked job postings saved for quick apply",
        icon: Bookmark,
      },
      {
        name: "Interviews",
        url: "/my-jobs/interviews",
        desc: "Scheduled video interviews & interviewer notes",
        icon: Calendar,
      },
      {
        name: "Offers",
        url: "/my-jobs/offers",
        desc: "Job offer letters & compensation details",
        icon: Award,
      },
    ],
  },
  {
    name: "Career Hub",
    url: "/career-hub",
    children: [
      {
        name: "AI Resume Builder",
        url: "/career-hub/resume-builder",
        desc: "Create ATS-optimized resumes with AI assistance",
        icon: FileText,
        badge: "AI",
      },
      {
        name: "AI Resume Analyzer",
        url: "/career-hub/resume-analyzer",
        desc: "Score & match your resume against target jobs",
        icon: Sparkles,
        badge: "AI",
      },
      {
        name: "AI Interview Coach",
        url: "/career-hub/interview-coach",
        desc: "Interactive mock interviews with real-time feedback",
        icon: Video,
        badge: "AI",
      },
      {
        name: "Skill Assessments",
        url: "/career-hub/assessments",
        desc: "Verify technical skills and showcase badges",
        icon: CheckCircle2,
      },
      {
        name: "Career Roadmaps",
        url: "/career-hub/roadmaps",
        desc: "Step-by-step career progression guides & skill trees",
        icon: Compass,
      },
      {
        name: "Salary Insights",
        url: "/career-hub/salary-insights",
        desc: "Real-time industry salary trends by role & location",
        icon: TrendingUp,
      },
    ],
  },
];

const RECRUITER_NAV_LINKS = [
  { name: "Dashboard", url: "/dashboard" },
  {
    name: "Jobs",
    url: "/recruiter/jobs",
    children: [
      { name: "Post Job", url: "/upload-job" },
      { name: "Manage Jobs", url: "/recruiter/jobs/manage" },
      { name: "Featured Jobs", url: "/recruiter/jobs/featured" },
      { name: "Archived Jobs", url: "/recruiter/jobs/archived" },
    ],
  },
  {
    name: "Candidates",
    url: "/recruiter/candidates",
    children: [
      { name: "Find Talent", url: "/find-talent" },
      { name: "Applications", url: "/recruiter/candidates/applications" },
      { name: "Shortlisted Candidates", url: "/recruiter/candidates/shortlist" },
      { name: "Interviews", url: "/recruiter/candidates/interviews" },
    ],
  },
  { name: "Company", url: "/company" },
];

const ADMIN_NAV_LINKS = [
  { name: "Dashboard", url: "/admin/dashboard" },
  { name: "Users", url: "/admin/users" },
  { name: "Recruiters", url: "/admin/recruiters" },
  { name: "Companies", url: "/admin/companies" },
  { name: "Jobs", url: "/admin/jobs" },
  { name: "Reports", url: "/admin/reports" },
];

// Role → nav link lookup, kept as a static map instead of a switch that
// gets recreated (and re-evaluated) on every render.
const NAV_LINKS_BY_ROLE = {
  RECRUITER: RECRUITER_NAV_LINKS,
  EMPLOYER: RECRUITER_NAV_LINKS,
  ADMIN: ADMIN_NAV_LINKS,
  JOB_SEEKER: USER_NAV_LINKS,
};

// Role → primary CTA. Admin intentionally has none — the admin header is
// a monitoring surface, not an action surface.
const PRIMARY_CTA_BY_ROLE = {
  RECRUITER: { label: "Post a Job", url: "/upload-job", icon: Plus },
  EMPLOYER: { label: "Post a Job", url: "/upload-job", icon: Plus },
  JOB_SEEKER: { label: "Find Jobs", url: "/find-jobs", icon: Search },
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080F]";

const BRAND_GRADIENT = "linear-gradient(135deg, #6366F1, #8B5CF6)";

/* ────────────────────────────────────────────────────────────
   Framer Motion variants
   ──────────────────────────────────────────────────────────── */
const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, delay: i * 0.05, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: -6, transition: { duration: 0.12 } },
};

/* ────────────────────────────────────────────────────────────
   Pure helpers — moved outside the component so they aren't
   redefined on every render, and so they're independently testable.
   ──────────────────────────────────────────────────────────── */
function getNavLinksForRole(role) {
  return NAV_LINKS_BY_ROLE[role] ?? USER_NAV_LINKS;
}

function isNavItemActive(item, pathname) {
  if (item.url && (pathname === item.url || pathname.startsWith(item.url))) return true;
  return item.children?.some(
    (child) => child.url && (pathname === child.url || pathname.startsWith(child.url))
  );
}

/* ────────────────────────────────────────────────────────────
   Small, reusable icon-button used across the desktop and
   mobile rows, with an optional unread-count badge.
   ──────────────────────────────────────────────────────────── */
const IconButton = memo(function IconButton({
  icon: Icon,
  label,
  onClick,
  hoverRotate = 0,
  className = "",
  badgeCount = 0,
}) {
  const { theme } = useTheme();
  const hasBadge = badgeCount > 0;
  const isLight = theme === "light";

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06, rotate: hoverRotate }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      aria-label={hasBadge ? `${label} (${badgeCount} unread)` : label}
      onClick={onClick}
      className={`relative rounded-xl p-2.5 transition-colors duration-200 ${FOCUS_RING} ${
        isLight
          ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          : "text-[#708090] hover:bg-[#161B22] hover:text-[#F1F5F9]"
      } ${className}`}
    >
      {hasBadge ? (
        <Indicator
          color="var(--color-primary, #6366F1)"
          size={7}
          offset={3}
          label={badgeCount > 9 ? "9+" : undefined}
        >
          <Icon size={18} strokeWidth={1.8} />
        </Indicator>
      ) : (
        <Icon size={18} strokeWidth={1.8} />
      )}
    </motion.button>
  );
});

/* ────────────────────────────────────────────────────────────
   Header
   ──────────────────────────────────────────────────────────── */
function Header() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const isAuthRestored = useSelector((state) => state.auth.isAuthRestored);
  const { savedJobs } = useAppSelector((state) => state.savedJob);
  const { myApplications } = useAppSelector((state) => state.application);

  useEffect(() => {
    dispatch(fetchMySavedJobsThunk());
    dispatch(fetchMyApplicationsThunk());
  }, [dispatch]);

  const unreadNotifications = useAppSelector(
    (state) => state.notifications?.unreadCount ?? 0
  );

  // Live unread message count — polled from REST API every 30s
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      getUnreadCountApi().then(setUnreadMessages).catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef(null);
  const mobileNavRef = useRef(null);
  const toggleBtnRef = useRef(null);

  // Only hide global header when within dedicated studio/admin routes that have their own sidebar/navbar
  const isDedicatedStudioRoute =
    location.pathname.startsWith("/recruiter") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin");

  if (isDedicatedStudioRoute) {
    return null;
  }

  // Track expanded state for submenus in mobile drawer (e.g. My Jobs, Career Hub)
  const [expandedMobileSubmenu, setExpandedMobileSubmenu] = useState({});

  const toggleMobileSubmenu = useCallback((name) => {
    setExpandedMobileSubmenu((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Scroll detection for the header's translucent/blur state */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll(); // set initial state on mount instead of assuming top-of-page
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close on outside click — scoped to the mobile nav panel + toggle
     button only, not the whole header, so clicking a desktop link
     or the logo doesn't get misread as "inside the menu". */
  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (e) => {
      const clickedInsideNav = mobileNavRef.current?.contains(e.target);
      const clickedToggle = toggleBtnRef.current?.contains(e.target);
      if (!clickedInsideNav && !clickedToggle) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  /* Escape key closes the menu and returns focus to the toggle button */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        toggleBtnRef.current?.focus();
      }
    },
    [mobileOpen]
  );

  /* Lock body scroll while the mobile menu is open, restoring
     whatever value was there before (rather than assuming ""). */
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, handleKeyDown]);

  const handleBellClick = useCallback(() => navigate("/notifications"), [navigate]);
  const handleMessagesClick = useCallback(() => navigate("/messages"), [navigate]);
  const handleSettingsClick = useCallback(() => navigate("/settings"), [navigate]);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    setMobileOpen(false);
    navigate("/login");
  }, [dispatch, navigate]);

  // Memoized so these aren't recomputed on unrelated re-renders
  // (e.g. the scroll-driven `scrolled` state changing).
  const role = user?.role;
  const accountType = user?.accountType;
  const effectiveRole = (role || accountType || "JOB_SEEKER").toUpperCase();
  const navLinks = useMemo(() => getNavLinksForRole(effectiveRole), [effectiveRole]);
  const primaryCta = PRIMARY_CTA_BY_ROLE[effectiveRole] ?? PRIMARY_CTA_BY_ROLE.JOB_SEEKER;

  const reduxProfile = useAppSelector(selectProfile);
  const profileImageSrc = resolveImageUrl(reduxProfile?.profileImage, "uploads");

  const displayName = user?.name ?? reduxProfile?.name ?? "Guest";
  const displayRole = user?.role ?? user?.accountType ?? "Candidate";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Skip link — first focusable element, invisible until tabbed to.
          Essential once a header carries this much nav + interactive chrome. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-heading border border-border"
      >
        Skip to main content
      </a>

      <header
        ref={headerRef}
        role="banner"
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? theme === "light"
              ? "border-border bg-surface/95 shadow-md backdrop-blur-2xl"
              : "border-border bg-surface/95 shadow-lg backdrop-blur-2xl"
            : theme === "light"
              ? "border-border bg-surface/90 backdrop-blur-xl"
              : "border-border bg-surface/80 backdrop-blur-xl"
        }`}
      >
        {/* Top gradient accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)",
          }}
        />

        {/* ─── Main nav row ─── */}
        <div className="section-container grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:h-[68px] lg:h-[72px]">
          {/* Column 1: Logo & Brand Name */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-2xl cursor-pointer min-w-0"
            aria-label="JobPortal AI — Home"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 4 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-white/20 shrink-0"
            >
              <Sparkles className="text-amber-300 fill-amber-300/20 animate-pulse h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
            
            <div className="flex flex-col shrink-0 min-w-0">
              <span className={`text-base sm:text-xl lg:text-2xl font-black font-satoshi tracking-tight leading-none transition-colors truncate ${theme === "light" ? "text-slate-900 group-hover:text-indigo-700" : "text-white group-hover:text-indigo-200"}`}>
                JobPortal <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className={`hidden xs:inline-block text-[9px] font-extrabold uppercase tracking-widest mt-0.5 font-satoshi truncate ${theme === "light" ? "text-indigo-600" : "text-indigo-300"}`}>
                Career Intelligence
              </span>
            </div>
          </Link>

          {/* Column 2: Desktop Navigation */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className={`hidden items-center justify-center gap-1 sm:gap-2 rounded-2xl border p-1.5 backdrop-blur-xl md:flex ${theme === "light" ? "border-slate-200 bg-slate-100/60" : "border-white/10 bg-white/[0.03]"}`}
          >
            {navLinks.map((item) => {
                const active = isNavItemActive(item, location.pathname);

                return (
                  <div key={item.name} className="group relative">
                    <Link
                      to={item.url}
                      aria-current={active ? "page" : undefined}
                      className={`
                        group relative flex h-10 items-center justify-center
                        whitespace-nowrap rounded-xl px-3.5 text-sm font-medium
                        transition-colors duration-300 lg:px-4
                        ${FOCUS_RING}
                        ${active
                          ? theme === "light" ? "text-slate-900" : "text-white"
                          : theme === "light"
                            ? "text-slate-500 hover:text-slate-900"
                            : "text-[#94A3B8] hover:text-[#F1F5F9]"
                        }
                      `}
                    >
                      {/* Active background */}
                      {active && (
                        <motion.span
                          layoutId="nav-active-bg"
                          className={`absolute inset-0 rounded-xl shadow-sm ${theme === "light" ? "border border-slate-200 bg-white" : "border border-white/[0.07] bg-[#161B22] shadow-[0_4px_16px_rgba(0,0,0,0.25)]"}`}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}

                      {/* Hover background */}
                      <span className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${theme === "light" ? "bg-slate-100" : "bg-white/[0.04]"}`} />

                      {/* Label & Chevron */}
                      <span
                        className={`relative z-10 inline-flex items-center gap-1.5 transition-all duration-300 ${
                          active
                            ? theme === "light" ? "font-extrabold text-slate-900" : "font-extrabold text-white"
                            : theme === "light" ? "group-hover:text-slate-900" : "group-hover:text-white"
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.name === "My Jobs" && savedJobs?.length > 0 && (
                          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                            {savedJobs.length}
                          </span>
                        )}
                        {item.children && (
                          <ChevronDown size={13} className={`transition-transform group-hover:rotate-180 duration-200 ${theme === "light" ? "text-slate-400 group-hover:text-slate-700" : "text-slate-400 group-hover:text-white"}`} />
                        )}
                      </span>

                      {/* Active gradient indicator */}
                      <span
                        className={`absolute bottom-1 left-1/2 z-10 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ${
                          active
                            ? "w-6 opacity-100"
                            : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-50"
                        }`}
                      />

                      {/* Active glow */}
                      {active && (
                        <span
                          className="pointer-events-none absolute -bottom-2 left-1/2 h-4 w-12 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-xl"
                          aria-hidden="true"
                        />
                      )}
                    </Link>

                    {item.children && (
                      <div className="invisible absolute left-1/2 -translate-x-1/2 top-full z-50 w-88 sm:w-96 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <div className={`overflow-hidden rounded-3xl border p-3 backdrop-blur-2xl ${
                          theme === "light"
                            ? "bg-surface-elevated border-border shadow-lg"
                            : "bg-surface-elevated border-border shadow-xl"
                        }`}>
                          <div className="space-y-1.5">
                            {item.children.map((child) => {
                              const childActive = location.pathname === child.url;
                              const Icon = child.icon;
                              const offersCount = (myApplications || []).filter(
                                (a) => a?.status === "OFFERED" || a?.status === "ACCEPTED"
                              ).length;
                              const badgeText =
                                child.url === "/my-jobs/saved"
                                  ? (savedJobs?.length > 0 ? String(savedJobs.length) : null)
                                  : child.url === "/my-jobs/applied"
                                  ? (myApplications?.length > 0 ? String(myApplications.length) : null)
                                  : child.url === "/my-jobs/offers"
                                  ? (offersCount > 0 ? String(offersCount) : null)
                                  : child.badge;
                              return (
                                <Link
                                  key={child.url}
                                  to={child.url}
                                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                  aria-current={childActive ? "page" : undefined}
                                  className={`group/child relative flex items-start gap-3.5 rounded-2xl p-3 transition-all duration-200 ${FOCUS_RING} ${
                                    childActive
                                      ? theme === "light"
                                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm"
                                        : "bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md"
                                      : theme === "light"
                                      ? "text-slate-700 hover:bg-slate-100 hover:border-slate-200 border border-transparent"
                                      : "text-slate-200 hover:bg-white/10 hover:border-indigo-500/30 border border-transparent"
                                  }`}
                                >
                                  {Icon && (
                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 group-hover/child:bg-gradient-to-r group-hover/child:from-indigo-600 group-hover/child:to-purple-600 group-hover/child:text-white transition-all shadow-md">
                                      <Icon size={18} />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-black font-satoshi transition-colors ${
                                        theme === "light"
                                          ? "text-slate-900 group-hover/child:text-indigo-600"
                                          : "text-white group-hover/child:text-indigo-300"
                                      }`}>
                                        {child.name}
                                      </span>
                                      {badgeText && (
                                        <span className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                                          {badgeText}
                                        </span>
                                      )}
                                    </div>
                                    {child.desc && (
                                      <p className={`text-[11px] font-medium leading-snug mt-0.5 line-clamp-1 ${
                                        theme === "light" ? "text-slate-500" : "text-slate-400"
                                      }`}>
                                        {child.desc}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

          {/* Column 3: Right section */}
          <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1 lg:gap-1.5">
            {/* Primary role CTA — the one dominant action per role.
                Admin has none by design (monitoring surface, not an action one). */}
            {primaryCta && (
              <Link to={primaryCta.url} className={`hidden rounded-xl sm:block ${FOCUS_RING}`}>
                <Button
                  radius="xl"
                  size="sm"
                  leftSection={<primaryCta.icon size={15} strokeWidth={2} />}
                  className="transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02]"
                  styles={{
                    root: {
                      height: 38,
                      paddingInline: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: BRAND_GRADIENT,
                      color: "#fff",
                      fontWeight: 600,
                      boxShadow: "0 6px 20px rgba(99,102,241,.3)",
                    },
                  }}
                >
                  {primaryCta.label}
                </Button>
              </Link>
            )}

            {/* Divider — lg only */}
            <div
              className="mx-1 hidden h-5 w-px lg:block"
              style={{ background: "rgba(148,163,184,0.10)" }}
            />

            {/* Messages — distinct from notifications; hidden for admins */}
            {effectiveRole !== "ADMIN" && (
              <IconButton
                icon={MessageSquare}
                label="Messages"
                onClick={handleMessagesClick}
                badgeCount={unreadMessages}
                className="flex"
              />
            )}

            {/* Notifications — full feature notification bell with badge and dropdown */}
            <NotificationBell />

            {/* Theme Toggle (desktop) — replaces old Settings icon */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              whileHover={{ scale: 1.08, rotate: theme === "dark" ? 15 : -15 }}
              whileTap={{ scale: 0.93 }}
              className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-2xl border backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                theme === "light"
                  ? "border-slate-200 bg-slate-100 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <Sun size={17} strokeWidth={1.8} />
                : <Moon size={17} strokeWidth={1.8} />
              }
            </motion.button>

            {/* Avatar / login */}
            <div className="ml-1 hidden items-center md:flex">
              {!isAuthRestored ? (
                <div className="h-[42px] w-24 animate-pulse rounded-xl bg-white/[0.06]" />
              ) : user ? (
                <ProfileMenu user={user} />
              ) : (
                <Link to="/auth" className={`rounded-xl ${FOCUS_RING}`}>
                  <Button
                    radius="xl"
                    size="md"
                    variant="filled"
                    className="transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02]"
                    styles={{
                      root: {
                        height: 42,
                        paddingInline: 26,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "linear-gradient(135deg,#6366F1 0%,#7C3AED 55%,#8B5CF6 100%)",
                        color: "#fff",
                        fontWeight: 700,
                        letterSpacing: "0.3px",
                        boxShadow:
                          "0 10px 28px rgba(99,102,241,.35), inset 0 1px 0 rgba(255,255,255,.12)",
                        transition: "box-shadow .3s cubic-bezier(.4,0,.2,1)",
                      },
                    }}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <motion.button
              ref={toggleBtnRef}
              type="button"
              whileTap={{ scale: 0.9 }}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              className={`ml-0.5 rounded-xl p-2.5 transition-colors duration-200 md:hidden ${FOCUS_RING} ${theme === "light" ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900" : "text-[#708090] hover:bg-[#161B22] hover:text-[#F1F5F9]"}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    <X size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    <Menu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ─── Mobile Navigation Panel ─── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              id="mobile-nav"
              ref={mobileNavRef}
              role="navigation"
              aria-label="Mobile navigation"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`overflow-hidden border-t md:hidden transition-colors duration-200 ${
                theme === "light"
                  ? "border-border bg-surface text-heading shadow-2xl backdrop-blur-2xl"
                  : "border-border bg-surface text-body shadow-2xl backdrop-blur-2xl"
              }`}
            >
              <div
                className="section-container py-3.5 space-y-2"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
                }}
              >
                {/* Mobile primary CTA */}
                {primaryCta && (
                  <Link
                    to={primaryCta.url}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 ${FOCUS_RING}`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <primaryCta.icon size={16} strokeWidth={2.2} />
                    {primaryCta.label}
                  </Link>
                )}

                {/* Mobile Direct Messages Quick Link */}
                {effectiveRole !== "ADMIN" && (
                  <Link
                    to="/messages"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between gap-3 rounded-2xl p-3.5 border transition-all duration-200 shadow-xs ${
                      location.pathname === "/messages"
                        ? theme === "light"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md text-white-force"
                          : "bg-indigo-600/30 border-indigo-500/50 text-white shadow-lg text-white-force"
                        : theme === "light"
                        ? "bg-indigo-50/80 border-indigo-200/90 text-slate-900 hover:border-indigo-300 hover:bg-indigo-100/70"
                        : "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white text-white-force shadow-md">
                        <MessageSquare size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black font-satoshi truncate ${
                              location.pathname === "/messages"
                                ? "text-white text-white-force"
                                : theme === "light"
                                ? "text-slate-900"
                                : "text-white"
                            }`}
                          >
                            Messages & Chats
                          </span>
                          {unreadMessages > 0 && (
                            <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white text-white-force shadow-md animate-pulse">
                              {unreadMessages} new
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] font-semibold truncate mt-0.5 ${
                            location.pathname === "/messages"
                              ? "text-indigo-100"
                              : theme === "light"
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          Direct chat with recruiters & employers
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        theme === "light"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                )}

                {/* Nav items loop */}
                <div className="space-y-1.5">
                  {navLinks.map((item, i) => {
                    const active = isNavItemActive(item, location.pathname);
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = !!expandedMobileSubmenu[item.name];

                    if (hasChildren) {
                      return (
                        <motion.div
                          key={item.name}
                          custom={i}
                          variants={mobileLinkVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {/* Accordion header button */}
                          <button
                            type="button"
                            onClick={() => toggleMobileSubmenu(item.name)}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black font-satoshi transition-all duration-200 cursor-pointer ${FOCUS_RING} ${
                              isExpanded
                                ? theme === "light"
                                  ? "bg-indigo-50/90 text-indigo-950 border border-indigo-200/90 shadow-xs"
                                  : "bg-indigo-950/40 text-indigo-200 border border-indigo-500/40 shadow-md"
                                : active
                                ? theme === "light"
                                  ? "bg-indigo-50 text-indigo-900 border border-indigo-200"
                                  : "bg-white/10 text-white border border-white/10"
                                : theme === "light"
                                ? "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 border border-slate-200/60 bg-slate-50/50"
                                : "text-slate-300 hover:bg-white/5 hover:text-white border border-white/5 bg-white/[0.02]"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              {active && (
                                <span
                                  className="h-4 w-[3px] rounded-full"
                                  style={{ background: BRAND_GRADIENT }}
                                />
                              )}
                              <span>{item.name}</span>
                              {item.name === "My Jobs" && savedJobs?.length > 0 && (
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                                  {savedJobs.length}
                                </span>
                              )}
                            </span>
                            <ChevronDown
                              size={17}
                              className={`transition-transform duration-300 ${
                                isExpanded
                                  ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                                  : theme === "light"
                                  ? "text-slate-400"
                                  : "text-slate-500"
                              }`}
                            />
                          </button>

                          {/* Accordion dropdown body */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div
                                  className={`my-2 space-y-1.5 p-2 rounded-2xl border-l-2 ml-3 ${
                                    theme === "light"
                                      ? "bg-slate-50/90 border-indigo-500 shadow-2xs"
                                      : "bg-white/[0.02] border-indigo-400 shadow-inner"
                                  }`}
                                >
                                  <Link
                                    to={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block rounded-xl px-3.5 py-2 text-xs font-black transition-colors ${
                                      location.pathname === item.url
                                        ? theme === "light"
                                          ? "text-indigo-900 bg-indigo-100/80"
                                          : "text-indigo-300 bg-indigo-500/20"
                                        : theme === "light"
                                        ? "text-slate-700 hover:text-indigo-900 hover:bg-white"
                                        : "text-slate-300 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    {item.name} Overview
                                  </Link>

                                  {item.children.map((child) => {
                                    const childActive = location.pathname === child.url;
                                    const Icon = child.icon;
                                    const offersCount = (myApplications || []).filter(
                                      (a) => a?.status === "OFFERED" || a?.status === "ACCEPTED"
                                    ).length;
                                    const badgeText =
                                      child.url === "/my-jobs/saved"
                                        ? savedJobs?.length > 0 ? String(savedJobs.length) : null
                                        : child.url === "/my-jobs/applied"
                                        ? myApplications?.length > 0 ? String(myApplications.length) : null
                                        : child.url === "/my-jobs/offers"
                                        ? offersCount > 0 ? String(offersCount) : null
                                        : child.badge;

                                    return (
                                      <Link
                                        key={child.url}
                                        to={child.url}
                                        onClick={() => setMobileOpen(false)}
                                        aria-current={childActive ? "page" : undefined}
                                        className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${FOCUS_RING} ${
                                          childActive
                                            ? theme === "light"
                                              ? "bg-white border border-indigo-200 text-indigo-900 shadow-xs font-black"
                                              : "bg-indigo-500/20 border border-indigo-500/40 text-white shadow-xs font-black"
                                            : theme === "light"
                                            ? "text-slate-700 hover:bg-white hover:text-slate-900"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                                        }`}
                                      >
                                        {Icon && (
                                          <div
                                            className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                                              theme === "light"
                                                ? "bg-indigo-100/70 text-indigo-700"
                                                : "bg-white/5 text-indigo-400"
                                            }`}
                                          >
                                            <Icon size={15} />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className={`text-xs font-extrabold font-satoshi ${
                                                theme === "light" ? "text-slate-900" : "text-white"
                                              }`}
                                            >
                                              {child.name}
                                            </span>
                                            {badgeText && (
                                              <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                                                {badgeText}
                                              </span>
                                            )}
                                          </div>
                                          {child.desc && (
                                            <p
                                              className={`text-[10px] leading-snug mt-0.5 line-clamp-1 ${
                                                theme === "light" ? "text-slate-500" : "text-slate-400"
                                              }`}
                                            >
                                              {child.desc}
                                            </p>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={item.name}
                        custom={i}
                        variants={mobileLinkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Link
                          to={item.url}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black font-satoshi transition-all duration-200 active:scale-[0.98] ${FOCUS_RING} ${
                            active
                              ? theme === "light"
                                ? "bg-indigo-50/90 text-indigo-950 border border-indigo-200/90 shadow-xs"
                                : "bg-indigo-950/40 text-indigo-200 border border-indigo-500/40 shadow-md"
                              : theme === "light"
                              ? "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 border border-slate-200/60 bg-slate-50/50"
                              : "text-slate-300 hover:bg-white/5 hover:text-white border border-white/5 bg-white/[0.02]"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {active && (
                              <span
                                className="h-4 w-[3px] rounded-full"
                                style={{ background: BRAND_GRADIENT }}
                              />
                            )}
                            <span>{item.name}</span>
                          </span>
                          <ChevronRight
                            size={16}
                            className={theme === "light" ? "text-slate-400" : "text-slate-500"}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile Dynamic Candidate / Recruiter Profile Card */}
                {user ? (
                  <div
                    className={`mt-4 rounded-3xl border p-4 shadow-lg space-y-3.5 backdrop-blur-xl ${
                      theme === "light"
                        ? "border-border bg-surface-elevated"
                        : "border-border bg-surface-elevated"
                    }`}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <Avatar src={profileImageSrc} radius="xl" size={44} className="border border-indigo-500/30">
                          {initials}
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#090d18] animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-sm font-black font-satoshi truncate group-hover:text-indigo-500 transition-colors ${
                            theme === "light" ? "text-slate-900" : "text-white"
                          }`}
                        >
                          {displayName}
                        </h4>
                        <p
                          className={`text-xs font-black truncate mt-0.5 ${
                            theme === "light" ? "text-indigo-700" : "text-indigo-400"
                          }`}
                        >
                          {user?.role ?? user?.accountType ?? "Candidate"}
                        </p>
                        <p
                          className={`text-[11px] font-bold flex items-center gap-1 mt-0.5 ${
                            theme === "light" ? "text-indigo-600" : "text-indigo-300"
                          }`}
                        >
                          View & Edit Profile &rarr;
                        </p>
                      </div>
                    </Link>

                    <div
                      className={`pt-2.5 border-t grid grid-cols-4 gap-1.5 ${
                        theme === "light" ? "border-slate-200/80" : "border-white/10"
                      }`}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-extrabold transition cursor-pointer ${
                          theme === "light"
                            ? "border-indigo-200/90 bg-indigo-50/90 text-indigo-900 hover:bg-indigo-100 shadow-2xs"
                            : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                        }`}
                      >
                        <User size={13} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          handleMessagesClick();
                        }}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-extrabold transition cursor-pointer relative ${
                          theme === "light"
                            ? "border-indigo-200/90 bg-white text-indigo-900 hover:bg-indigo-50 shadow-2xs"
                            : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        <MessageSquare
                          size={13}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                        <span>Chat</span>
                        {unreadMessages > 0 && (
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleTheme();
                          setMobileOpen(false);
                        }}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-extrabold transition cursor-pointer ${
                          theme === "light"
                            ? "border-amber-200/90 bg-amber-50/80 text-amber-900 hover:bg-amber-100/80 shadow-2xs"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        }`}
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun size={13} className="text-amber-400" /> Light
                          </>
                        ) : (
                          <>
                            <Moon size={13} className="text-indigo-600" /> Dark
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-extrabold transition cursor-pointer ${
                          theme === "light"
                            ? "border-rose-200/90 bg-rose-50/80 text-rose-800 hover:bg-rose-100/80 shadow-2xs"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        }`}
                      >
                        <LogOut size={13} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-surface-elevated">
                      <span className="text-xs font-bold text-heading">Theme Mode</span>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-bold text-heading hover:border-indigo-500/40 transition cursor-pointer"
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun size={14} className="text-amber-400" /> Light
                          </>
                        ) : (
                          <>
                            <Moon size={14} className="text-indigo-600" /> Dark
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center rounded-2xl border border-border bg-surface-elevated py-3 text-xs font-extrabold text-heading hover:bg-surface transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20"
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom safe-area spacer */}
                <div className="h-2" />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default memo(Header);