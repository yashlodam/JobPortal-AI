/**
 * src/LandingPage/LiveStatsBar.jsx
 *
 * Senior 15+ Year Production-Grade Live Platform Stats Console.
 * Beautifully unified glassmorphic segmented console with ambient glow accents,
 * interactive segment routing, and crisp Satoshi typography.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../State/Store";

const STATS_DATA = [
  {
    id: "jobs",
    badge: "Live Openings",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    label: "Active Tech Roles",
    value: "Explore All",
    subtext: "Verified openings across tech stacks",
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-600",
    glow: "rgba(99, 102, 241, 0.22)",
    link: "/find-jobs",
  },
  {
    id: "precision",
    badge: "ATS AI Engine",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    label: "AI Match Precision",
    value: "Semantic Fit",
    subtext: "Skill & requirement alignment",
    icon: Zap,
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6, 182, 212, 0.22)",
    link: "/career-hub/resume-analyzer",
  },
  {
    id: "interview",
    badge: "Voice & Text",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    label: "AI Mock Coach",
    value: "Interactive",
    subtext: "Role-specific dynamic interview drills",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-600",
    glow: "rgba(168, 85, 247, 0.22)",
    link: "/career-hub",
  },
  {
    id: "pipeline",
    badge: "Direct Connect",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: "Direct Pipeline",
    value: "Direct Connect",
    subtext: "Direct communication with verified recruiters",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16, 185, 129, 0.22)",
    link: "/find-jobs",
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      staggerChildren: 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function LiveStatsBar() {
  const allJobs = useAppSelector((state) => state.job.allJobs);
  const liveJobCount =
    Array.isArray(allJobs) && allJobs.length > 0
      ? `${allJobs.length.toLocaleString()} Openings`
      : "Live Openings";

  return (
    <section className="relative z-20 py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-inter">
      
      {/* ── Unified Glassmorphic Stats Console ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#080d1a]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-indigo-600/10 blur-[100px]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {STATS_DATA.map((stat, idx) => {
            const Icon = stat.icon;
            const displayValue = stat.id === "jobs" ? liveJobCount : stat.value;

            return (
              <motion.div
                key={stat.id}
                variants={cardVariants}
                className="relative group p-5 sm:p-6 lg:p-7 transition-all duration-300 hover:bg-[#0c1224]/80 cursor-pointer"
              >
                <Link to={stat.link} className="block h-full focus:outline-none">
                  {/* Radial Hover Glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(320px circle at top left, ${stat.glow}, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    {/* Header: Micro Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${stat.badgeColor} font-satoshi shadow-sm`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {stat.badge}
                      </span>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon size={18} />
                      </div>
                    </div>

                    {/* Main Counter & Label */}
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white font-satoshi tracking-tight leading-none group-hover:text-indigo-200 transition-colors">
                        {displayValue}
                      </div>
                      <div className="text-xs font-bold text-slate-300 font-satoshi">
                        {stat.label}
                      </div>
                    </div>

                    {/* Footer Subtext with hover arrow */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="truncate pr-2">{stat.subtext}</span>
                      <ArrowUpRight
                        size={14}
                        className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
