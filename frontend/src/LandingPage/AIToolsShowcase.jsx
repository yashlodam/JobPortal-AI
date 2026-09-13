/**
 * src/LandingPage/AIToolsShowcase.jsx
 *
 * Ultra-Premium "Supercharge Your Career with AI" Bento Showcase Section.
 * Features 3D glassmorphic cards, radial background glow washes,
 * gold Sparkles tags, and direct navigation to platform AI tools.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Sparkles,
  FileText,
  MessageSquare,
  Mic,
  Bot,
  Zap,
  CheckCircle2,
  Video,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useTheme } from "../context/ThemeContext";

const AI_TOOLS_DATA = [
  {
    id: 1,
    title: "ATS Resume Studio",
    description:
      "Create high-scoring, ATS-compliant resumes with real-time keyword optimization, bullet improvements, and multi-template export.",
    icon: FileText,
    link: "/career-hub/resume-builder",
    gradient: { from: "#6366F1", to: "#8B5CF6", glow: "rgba(99, 102, 241, 0.35)", text: "#A5B4FC" },
    stats: "ATS-Ready Formats",
    tag: "Resume Studio",
  },
  {
    id: 2,
    title: "Neural Job Match Fit",
    description:
      "Evaluate your skill alignment against open jobs with instant semantic match scores and personalized skill gap reports.",
    icon: Zap,
    link: "/find-jobs",
    gradient: { from: "#06B6D4", to: "#3B82F6", glow: "rgba(6, 182, 212, 0.35)", text: "#67E8F9" },
    stats: "Semantic Gap Analysis",
    tag: "Match Fit",
  },
  {
    id: 3,
    title: "Mock Technical Interview",
    description:
      "Practice coding, system design, and behavioral questions with an intelligent mock interviewer that provides actionable evaluation.",
    icon: Video,
    link: "/career-hub/interview-coach",
    gradient: { from: "#EC4899", to: "#F43F5E", glow: "rgba(236, 72, 153, 0.35)", text: "#F472B6" },
    stats: "Interactive Practice",
    tag: "Interview Coach",
  },
  {
    id: 4,
    title: "Application Pipeline",
    description:
      "Track your applications with complete visibility across all hiring stages and message directly with hiring recruiters.",
    icon: Bot,
    link: "/my-jobs/applied",
    gradient: { from: "#10B981", to: "#14B8A6", glow: "rgba(16, 185, 129, 0.35)", text: "#6EE7B7" },
    stats: "Status Pipeline",
    tag: "Track Applications",
  },
];

/* ===========================
    Animation Variants
=========================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ===========================
    AI Tool Card
=========================== */
function AIToolCard({ tool }) {
  const navigate = useNavigate();
  const IconComponent = tool.icon;
  const gradient = tool.gradient;
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => navigate(tool.link)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
        isLight
          ? "border-slate-200/90 bg-white/85 shadow-xs hover:border-indigo-300 hover:shadow-xl hover:bg-white"
          : "border-white/10 bg-[#090d16]/85 hover:border-indigo-500/50 hover:bg-[#0c111f] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Glow Wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl"
        style={{
          background: `radial-gradient(400px circle at top left, ${gradient.glow}, transparent 70%)`,
        }}
      />

      <div>
        {/* Top Tag & Sparkles */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-sm"
            style={{
              borderColor: `${gradient.from}40`,
              backgroundColor: isLight ? `${gradient.from}15` : `${gradient.from}18`,
              color: isLight ? gradient.from : gradient.text,
            }}
          >
            <Sparkles size={12} className={isLight ? "text-amber-500 fill-amber-500/20" : "text-amber-300 fill-amber-300/20 animate-pulse"} />
            {tool.tag}
          </span>

          <div className={`flex items-center gap-1 text-[11px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            <BarChart3 size={13} className={isLight ? "text-indigo-600" : "text-indigo-400"} />
            <span>{tool.stats}</span>
          </div>
        </div>

        {/* Icon Container */}
        <div
          className="relative z-10 mt-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            boxShadow: `0 8px 24px ${gradient.glow}`,
          }}
        >
          <IconComponent size={26} className="text-white" />
        </div>

        {/* Title */}
        <h3 className={`relative z-10 mt-6 text-xl font-extrabold font-satoshi transition-colors leading-tight ${
          isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"
        }`}>
          {tool.title}
        </h3>

        {/* Description */}
        <p className={`relative z-10 mt-2.5 text-xs sm:text-sm leading-relaxed font-medium ${
          isLight ? "text-slate-600" : "text-slate-400"
        }`}>
          {tool.description}
        </p>
      </div>

      {/* Action Footer */}
      <div className={`relative z-10 mt-6 pt-4 border-t flex items-center justify-between ${
        isLight ? "border-slate-100" : "border-white/10"
      }`}>
        <span className={`text-xs font-bold transition flex items-center gap-1 ${
          isLight ? "text-slate-600 group-hover:text-slate-900" : "text-slate-300 group-hover:text-white"
        }`}>
          <CheckCircle2 size={13} className="text-emerald-500" /> AI Intelligence Enabled
        </span>

        <span
          className="inline-flex items-center gap-1.5 text-xs font-extrabold transition-all group-hover:translate-x-1"
          style={{ color: isLight ? gradient.from : gradient.text }}
        >
          Launch Tool <ArrowRight size={14} />
        </span>
      </div>
    </motion.div>
  );
}

/* ===========================
    Main Component
=========================== */
export default function AIToolsShowcase() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`} aria-label="AI tools showcase">
      {/* Background Lighting Mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/5 blur-[200px]" />
      </div>

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Proprietary AI Suite"
          title={
            <>
              Supercharge Your Career with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                JobPortal AI
              </span>
            </>
          }
          subtitle="Everything you need to optimize your resume, practice technical interviews, and match with the top 1% tech opportunities."
        />

        {/* 4 Cards Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {AI_TOOLS_DATA.map((tool) => (
            <AIToolCard key={tool.id} tool={tool} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
