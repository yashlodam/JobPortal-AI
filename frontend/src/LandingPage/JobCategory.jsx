/**
 * src/LandingPage/JobCategory.jsx
 *
 * Ultra-Premium "Browse Job Categories" Section.
 * Features ambient mesh lighting, glassmorphism, 3D hover cards,
 * job count badges, and interactive category/work-mode filters.
 */

import React, { useId, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Code2, Briefcase, Megaphone, BarChart3, HeartPulse, Palette, ShieldCheck, GraduationCap, Globe, Laptop, Home, Building2, Database, Cpu, Cloud, Network, MonitorSmartphone, Blocks } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { useAppSelector } from "../State/Store";
import { categories as defaultCategories, workModes as defaultWorkModes } from "../Data/Data";

/* ===========================
   Icon & Color System
=========================== */
const ICONS = [
  Code2,
  Briefcase,
  Megaphone,
  BarChart3,
  HeartPulse,
  Palette,
  ShieldCheck,
  GraduationCap,
  Globe,
  Laptop,
  Building2,
  Home,
  Database,
  Cpu,
  Cloud,
  Network,
  MonitorSmartphone,
  Blocks,
];

const GRADIENTS = [
  { from: "#6366F1", to: "#8B5CF6", glow: "rgba(99, 102, 241, 0.35)", badgeBg: "rgba(99, 102, 241, 0.15)", text: "#A5B4FC" },
  { from: "#EC4899", to: "#F43F5E", glow: "rgba(236, 72, 153, 0.35)", badgeBg: "rgba(236, 72, 153, 0.15)", text: "#F472B6" },
  { from: "#06B6D4", to: "#3B82F6", glow: "rgba(6, 182, 212, 0.35)", badgeBg: "rgba(6, 182, 212, 0.15)", text: "#67E8F9" },
  { from: "#F59E0B", to: "#EF4444", glow: "rgba(245, 158, 11, 0.35)", badgeBg: "rgba(245, 158, 11, 0.15)", text: "#FCD34D" },
  { from: "#10B981", to: "#14B8A6", glow: "rgba(16, 185, 129, 0.35)", badgeBg: "rgba(16, 185, 129, 0.15)", text: "#6EE7B7" },
  { from: "#8B5CF6", to: "#EC4899", glow: "rgba(139, 92, 246, 0.35)", badgeBg: "rgba(139, 92, 246, 0.15)", text: "#C084FC" },
  { from: "#3B82F6", to: "#6366F1", glow: "rgba(59, 130, 246, 0.35)", badgeBg: "rgba(59, 130, 246, 0.15)", text: "#93C5FD" },
  { from: "#F43F5E", to: "#FB923C", glow: "rgba(244, 63, 94, 0.35)", badgeBg: "rgba(244, 63, 94, 0.15)", text: "#FDA4AF" },
];

const TABS = [
  { key: "category", label: "By Category", param: "category" },
  { key: "mode", label: "By Work Mode", param: "mode" },
];

const MotionLink = motion(Link);

/* ===========================
   Animation Variants
=========================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

import { useTheme } from "../context/ThemeContext";

/* ===========================
   Card Component
=========================== */
function CategoryCard({ item, activeParam, variants }) {
  const Icon = item.icon || Code2;
  const gradient = item.gradient || GRADIENTS[0];
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <MotionLink
      to={`/find-jobs?${activeParam}=${encodeURIComponent(item.title)}`}
      variants={variants}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
        isLight
          ? "border-slate-200/90 bg-white/85 shadow-xs hover:border-indigo-300 hover:shadow-xl hover:bg-white"
          : "border-white/10 bg-[#090d16]/85 hover:border-indigo-500/50 hover:bg-[#0c111f] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Glow Wash effect on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"
        style={{
          background: `radial-gradient(400px circle at top left, ${gradient.glow}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        {/* Icon Badge Container */}
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border shadow-md transition-all duration-300 group-hover:scale-110 ${
            isLight ? "border-slate-200/80" : "border-white/10 group-hover:border-white/20"
          }`}
          style={{
            background: `linear-gradient(135deg, ${gradient.from}25, ${gradient.to}15)`,
          }}
        >
          <Icon
            className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
            style={{ color: gradient.from }}
          />
        </div>

        {/* Arrow Badge */}
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5 ${
            isLight
              ? "border-slate-200 bg-slate-100 text-slate-600 group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              : "border-white/10 bg-white/5 text-slate-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-500/20 group-hover:text-white"
          }`}
        >
          <ArrowRight size={16} />
        </span>
      </div>

      {/* Title & Job Count */}
      <div className="relative z-10 mt-6">
        <h3 className={`text-base font-extrabold font-satoshi transition-colors leading-tight ${
          isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"
        }`}>
          {item.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border"
            style={{
              borderColor: `${gradient.from}40`,
              backgroundColor: isLight ? `${gradient.from}15` : gradient.badgeBg,
              color: isLight ? gradient.from : gradient.text,
            }}
          >
            {item.jobs}
          </span>
          <span className={`text-[11px] font-medium transition ${isLight ? "text-slate-500 group-hover:text-indigo-600" : "text-slate-500 group-hover:text-slate-400"}`}>
            Explore →
          </span>
        </div>
      </div>
    </MotionLink>
  );
}

/* ===========================
   Main JobCategory Component
=========================== */
export default function JobCategory() {
  const [activeTab, setActiveTab] = useState("category");
  const prefersReducedMotion = useReducedMotion();
  const tabPanelId = useId();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const categoriesState = useAppSelector((state) => state.job.categories);
  const workModesState = useAppSelector((state) => state.job.workModes);

  const categories = Array.isArray(categoriesState)
    ? categoriesState
    : categoriesState?.data ?? defaultCategories;

  const workModes = Array.isArray(workModesState)
    ? workModesState
    : workModesState?.data ?? defaultWorkModes;

  const isLoading =
    categoriesState?.status === "loading" || workModesState?.status === "loading";

  // Format Items with Gradient Palette & Icons
  const formattedCategories = useMemo(() => {
    const sourceList = categories.length > 0 ? categories : defaultCategories;
    return sourceList.map((item, index) => ({
      title: item.title || item.name || "Category",
      jobs: typeof item.jobs === "string" ? item.jobs : `${item.count || item.jobCount || 120} Open Jobs`,
      icon: item.icon || ICONS[index % ICONS.length],
      gradient: GRADIENTS[index % GRADIENTS.length],
    }));
  }, [categories]);

  const formattedWorkModes = useMemo(() => {
    const sourceList = workModes.length > 0 ? workModes : defaultWorkModes;
    return sourceList.map((item, index) => ({
      title: item.title || item.workingMode || "Work Mode",
      jobs: typeof item.jobs === "string" ? item.jobs : `${item.jobCount || item.count || 240} Open Jobs`,
      icon: item.icon || ICONS[(index + 4) % ICONS.length],
      gradient: GRADIENTS[(index + 3) % GRADIENTS.length],
    }));
  }, [workModes]);

  const items = activeTab === "category" ? formattedCategories : formattedWorkModes;
  const activeTabMeta = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`}>
      {/* ── Background Ambient Lighting & Mesh Orbs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-[180px]"
      />

      {/* Dot Grid Backdrop */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${isLight ? "opacity-[0.03]" : "opacity-[0.025]"}`}
        style={{
          backgroundImage: isLight ? "radial-gradient(circle, #6366F1 1px, transparent 1px)" : "radial-gradient(circle, #A5B4FC 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Career Discovery"
          title={
            <>
              Browse <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Job Categories</span>
            </>
          }
          subtitle="Discover high-demand opportunities across top industries, flexible work arrangements, and specialized engineering domains."
        />

        {/* ── Filter Tab Switcher ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex w-full justify-center sm:mt-10"
        >
          <div
            role="tablist"
            aria-label="Browse categories or work modes"
            className={`flex w-full max-w-[360px] items-center gap-2 rounded-2xl border p-1.5 backdrop-blur-xl ${
              isLight ? "border-slate-200 bg-white shadow-md" : "border-white/10 bg-[#090d16]/90 shadow-2xl"
            }`}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  id={`${tabPanelId}-${tab.key}-tab`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tabPanelId}-panel`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-4 text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "!text-white shadow-lg"
                      : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="job-category-tab-indicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.key === "category" && <Sparkles size={14} className={isActive ? "!text-white" : "text-amber-500"} />}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Category Cards Grid ── */}
        <div
          id={`${tabPanelId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabPanelId}-${activeTab}-tab`}
          className="mt-10 sm:mt-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {items.map((item) => (
                <CategoryCard
                  key={item.title}
                  item={item}
                  activeParam={activeTabMeta.param}
                  variants={cardVariants}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}