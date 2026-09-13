/**
 * src/LandingPage/HowItWorks.jsx
 *
 * Ultra-Premium 3-Step "How AI Matching Works" Section.
 * Explains the platform's core differentiator with interactive cards,
 * connecting gradient lines, and an animated AI Match preview card.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  Bot,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useTheme } from "../context/ThemeContext";

const STEPS = [
  {
    step: "01",
    title: "Smart Resume & Skill Extraction",
    description:
      "Upload your PDF resume or build one with our AI Resume Studio. The engine automatically indexes your core tech stack, achievements, and ATS keywords.",
    icon: FileText,
    gradient: "from-indigo-500 to-purple-600",
    badge: "ATS Indexed",
    badgeColor: "text-indigo-600 border-indigo-200 bg-indigo-50 dark:text-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10",
    metrics: "Structured Profile Indexing",
    numberColor: "text-indigo-600/30 group-hover:text-indigo-600/60 dark:text-indigo-400/30 dark:group-hover:text-indigo-400/60",
    stepTextColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    step: "02",
    title: "Neural AI Match & Fit Analysis",
    description:
      "Our matching algorithm compares your profile against live verified job postings, calculating real-time 0–100% Match Scores and highlighting missing high-value skills.",
    icon: Zap,
    gradient: "from-cyan-500 to-blue-600",
    badge: "Semantic Fit",
    badgeColor: "text-cyan-600 border-cyan-200 bg-cyan-50 dark:text-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/10",
    metrics: "Instant Skill Gap Report",
    numberColor: "text-cyan-600/35 group-hover:text-cyan-600/70 dark:text-cyan-400/30 dark:group-hover:text-cyan-400/60",
    stepTextColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    step: "03",
    title: "1-Click Apply & Live Pipeline Tracker",
    description:
      "Generate tailored cover letters in seconds, apply in 1 click, and monitor your progress across all recruitment pipeline stages with transparent status updates.",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    badge: "Transparent Pipeline",
    badgeColor: "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    metrics: "Direct Recruiter Chat",
    numberColor: "text-emerald-600/35 group-hover:text-emerald-600/70 dark:text-emerald-400/30 dark:group-hover:text-emerald-400/60",
    stepTextColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HowItWorks() {
  const [activePreview, setActivePreview] = useState(1);
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`} aria-label="How it works">
      <div className="section-container relative z-10">
        <SectionHeader
          badge="Intelligent Recruitment"
          title={
            <>
              How Our AI Matches You to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Dream Roles
              </span>
            </>
          }
          subtitle="A frictionless, transparent hiring journey designed to land you interviews 3x faster than traditional job boards."
        />

        {/* 3 Step Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {STEPS.map((stepItem, index) => {
            const Icon = stepItem.icon;

            return (
              <motion.div
                key={stepItem.step}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-7 sm:p-8 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
                  isLight
                    ? "border-slate-200/90 bg-white/85 shadow-xs hover:border-indigo-300 hover:shadow-xl hover:bg-white"
                    : "border-white/10 bg-[#090d16]/85 hover:border-indigo-500/50 hover:bg-[#0c111f] hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
                }`}
              >
                {/* Step Number Watermark */}
                <span
                  className={`absolute top-4 right-6 text-5xl sm:text-6xl font-black font-satoshi select-none pointer-events-none transition-all duration-300 ${stepItem.numberColor}`}
                >
                  {stepItem.step}
                </span>

                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${stepItem.gradient} text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon size={24} />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-extrabold shadow-sm ${stepItem.badgeColor}`}
                    >
                      <Sparkles size={11} className="animate-pulse" />
                      {stepItem.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`mt-6 text-lg sm:text-xl font-extrabold font-satoshi transition-colors leading-snug ${
                    isLight ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"
                  }`}>
                    {stepItem.title}
                  </h3>

                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed font-medium ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    {stepItem.description}
                  </p>
                </div>

                {/* Footer Metric */}
                <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}>
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {stepItem.metrics}
                  </span>
                  <span className={`font-extrabold font-mono text-[11px] ${stepItem.stepTextColor}`}>
                    STEP {stepItem.step}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Live Interactive AI Match Preview Box */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-12 sm:mt-16 rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden ${
            isLight
              ? "border-indigo-100 bg-white shadow-xl"
              : "border-indigo-500/30 bg-gradient-to-br from-[#0c1122] via-[#090d16] to-[#05070d]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Explanatory Copy */}
            <div className="lg:col-span-6 space-y-4">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-extrabold ${
                isLight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              }`}>
                <Cpu size={14} className="text-emerald-500" />
                <span>Live AI Match Engine Demo</span>
              </div>

              <h4 className={`text-2xl sm:text-3xl font-black font-satoshi tracking-tight leading-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                See How Your Resume Scores in Real Time
              </h4>

              <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}>
                Our embedding engine evaluates semantic fit across tech competencies, required years of experience, and project complexity — giving you clarity before you apply.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/career-hub/resume-analyzer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition cursor-pointer font-satoshi"
                >
                  <Sparkles size={14} className="text-amber-300 fill-amber-300/20" />
                  <span>Analyze My Resume (Free)</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  to="/find-jobs"
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <Zap size={14} className={isLight ? "text-indigo-600" : "text-indigo-400"} />
                  <span>Explore Matched Jobs</span>
                </Link>
              </div>
            </div>

            {/* Right: Realistic AI Match Score Simulation Card */}
            <div className="lg:col-span-6">
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-xl space-y-4 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#070b14]/90 border-white/10"
              }`}>
                {/* Header */}
                <div className={`flex items-center justify-between border-b pb-4 ${
                  isLight ? "border-slate-200" : "border-white/10"
                }`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-satoshi ${
                      isLight ? "text-indigo-600" : "text-indigo-400"
                    }`}>
                      Sample Match Preview
                    </span>
                    <h5 className={`text-base font-extrabold font-satoshi ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      Fullstack Engineer • Tech Sector
                    </h5>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5">
                    <Zap size={16} className="text-emerald-500" />
                    <span className={`text-base font-black font-satoshi ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>92%</span>
                    <span className="text-[10px] font-bold text-emerald-600">Match</span>
                  </div>
                </div>

                {/* Skill Matrix */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className={isLight ? "text-slate-600" : "text-slate-400"}>Matched Competencies (5/6)</span>
                    <span className="text-emerald-600 font-extrabold">High Compatibility</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["React 19", "TypeScript", "Node.js", "GraphQL", "PostgreSQL"].map((skill) => (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          isLight
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        {skill}
                      </span>
                    ))}
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                      isLight
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}>
                      <Sparkles size={11} className="text-amber-500" />
                      Docker (Recommended)
                    </span>
                  </div>
                </div>

                {/* AI Summary note */}
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  isLight
                    ? "bg-indigo-50 border-indigo-200 text-indigo-950 font-medium"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-200"
                }`}>
                  💡 <strong>AI Recommendation:</strong> Strong match on modern frontend and relational architecture. Highlight your recent distributed system experience in your cover letter.
                </div>

                {/* Direct Action Link */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className={`text-[11px] font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>Want to see your resume score?</span>
                  <Link
                    to="/career-hub/resume-analyzer"
                    className={`inline-flex items-center gap-1 font-bold transition group ${
                      isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-400 hover:text-indigo-300"
                    }`}
                  >
                    <span>Test Your Resume Now</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
