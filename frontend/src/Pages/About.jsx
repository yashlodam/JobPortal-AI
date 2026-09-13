/**
 * src/Pages/About.jsx
 *
 * Professional About Us & Founder Spotlight Page.
 * Dedicated to Yash Lodam (Founder & Chief Architect) with verified credentials,
 * architecture principles, and direct contact avenues.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  Shield,
  Award,
  Zap,
  Target,
  ArrowRight,
  Briefcase,
  UserCheck,
  TrendingUp,
  Globe,
  Code2,
  Cpu,
  Mail,
  CheckCircle2,
  ExternalLink,
  Layers,
  Terminal,
  Database,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function LinkedInIcon({ className = "" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className = "" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ===========================
    Animated Counter Component
=========================== */
function AnimatedCounter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const numericEnd = parseInt(end.toString().replace(/\D/g, ""), 10);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * numericEnd));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const PLATFORM_STATS = [
  { icon: Briefcase, value: "AI Match", label: "Semantic Skill Fit Scoring" },
  { icon: Globe, value: "8 Stages", label: "Transparent Pipeline Tracking" },
  { icon: Zap, value: "Real-time", label: "ATS Resume Health Analysis" },
  { icon: TrendingUp, value: "Spring + React", label: "Enterprise Architecture" },
];

const CORE_PILLARS = [
  {
    icon: Cpu,
    title: "Neural Skill Fit Scoring",
    description:
      "Unlike legacy keyword matchers, our semantic embedding algorithms evaluate project complexity, technical depth, and actual skill alignment.",
    from: "#6366F1",
    to: "#8B5CF6",
  },
  {
    icon: Zap,
    title: "Transparent Pipeline Tracking",
    description:
      "Every applicant can track their progress across recruitment stages with clear status updates and direct messaging to verified recruiters.",
    from: "#06B6D4",
    to: "#3B82F6",
  },
  {
    icon: Shield,
    title: "Verified Compensation Brackets",
    description:
      "No hidden salary bands or misleading ranges. All job postings show transparent compensation models with verified market equity rates.",
    from: "#10B981",
    to: "#14B8A6",
  },
  {
    icon: UserCheck,
    title: "AI Technical Interview Coach",
    description:
      "Empower candidates to practice coding and behavioral questions with realistic AI interview simulations before real recruiter screens.",
    from: "#EC4899",
    to: "#F43F5E",
  },
  {
    icon: Sparkles,
    title: "ATS-Optimized Resume Engine",
    description:
      "Automated document formatting and keyword analysis ensure resumes pass through ATS filters (Greenhouse, Lever, Workday) with top scores.",
    from: "#F59E0B",
    to: "#EF4444",
  },
  {
    icon: Database,
    title: "High-Performance Fullstack Architecture",
    description:
      "Built with high-throughput Spring Boot micro-services, reactive PostgreSQL storage, and a responsive React 19 interface.",
    from: "#8B5CF6",
    to: "#A855F7",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function About() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <main className={`relative min-h-screen font-inter overflow-x-hidden transition-colors duration-300 ${
      isLight ? "bg-[#F8FAFC] text-slate-800" : "bg-[#05070d] text-slate-200"
    }`} aria-label="About JobPortal AI">
      {/* Background Ambient Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[200px]" />
      </div>

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold mb-6 shadow-sm ${
            isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
          }`}
        >
          <Sparkles size={14} className={isLight ? "text-amber-500" : "text-amber-300 fill-amber-300/20"} />
          <span>Our Mission & Architectural Vision</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className={`text-3xl sm:text-5xl lg:text-6xl font-black font-satoshi tracking-tight leading-tight max-w-4xl mx-auto ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          Engineering the Future of{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            AI-Driven Recruitment
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mt-6 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium ${
            isLight ? "text-slate-600" : "text-slate-300"
          }`}
        >
          JobPortal AI was founded to fix the broken tech hiring pipeline. We combine deterministic skill evaluation, automated ATS scoring, and direct recruiter communication to help developers land life-changing roles.
        </motion.p>
      </section>

      {/* ══════════ STATS ROW ══════════ */}
      <section className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {PLATFORM_STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className={`rounded-3xl border p-6 text-center backdrop-blur-xl transition shadow-sm hover:scale-105 ${
                isLight
                  ? "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:shadow-xl"
                  : "border-white/10 bg-[#090d16]/90 hover:border-indigo-500/40 hover:bg-[#0c111f]"
              }`}
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border mb-4 shadow-sm ${
                isLight ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
              }`}>
                <stat.icon size={22} />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-satoshi tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {typeof stat.value === "number" ? (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                ) : (
                  stat.value
                )}
              </div>
              <p className={`mt-1 text-xs font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════ FOUNDER SPOTLIGHT (YASH LODAM) ══════════ */}
      <section className={`section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold ${
              isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
            }`}>
              <UserCheck size={14} className={isLight ? "text-indigo-600" : "text-indigo-400"} />
              <span>Founder & Chief Architect</span>
            </span>
            <h2 className={`mt-4 text-3xl sm:text-4xl font-black font-satoshi tracking-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Meet the Creator Behind the Platform
            </h2>
          </div>

          {/* Executive Founder Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl border p-8 sm:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden ${
              isLight
                ? "border-indigo-200 bg-white shadow-xl"
                : "border-indigo-500/40 bg-gradient-to-br from-[#0e1326] via-[#090d16] to-[#05070d]"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Avatar & Quick Badges */}
              <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
                <div className="relative">
                  <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-3xl sm:text-4xl font-black text-white font-satoshi shadow-[0_0_35px_rgba(99,102,241,0.4)] border-2 border-white/20">
                    YL
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold border-2 border-[#090d16] shadow-lg">
                    <CheckCircle2 size={18} className="text-white" />
                  </span>
                </div>

                <h3 className={`mt-5 text-2xl font-black font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
                  Yash Lodam
                </h3>
                <p className={`text-xs sm:text-sm font-bold mt-0.5 ${isLight ? "text-indigo-600" : "text-indigo-400"}`}>
                  Founder & Fullstack AI Architect
                </p>

                {/* Social & Contact Pills */}
                <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                  <a
                    href="mailto:yashlodam03@gmail.com"
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-slate-100"
                        : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-indigo-500/40"
                    }`}
                  >
                    <Mail size={13} className="text-indigo-500" />
                    <span>Email</span>
                  </a>
                  <a
                    href="https://github.com/yashlodam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-slate-100"
                        : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-indigo-500/40"
                    }`}
                  >
                    <GitHubIcon className="text-purple-500" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://linkedin.com/in/yashlodam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-slate-100"
                        : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-indigo-500/40"
                    }`}
                  >
                    <LinkedInIcon className="text-cyan-500" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Founder Narrative & Architecture Highlights */}
              <div className="md:col-span-8 space-y-4">
                <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                  "I engineered JobPortal AI with a single mission: to eliminate the frustrating blackhole of online job applications. Traditional job boards rely on crude keyword filters that reject qualified developers, while leaving candidates stranded in months of recruiter silence."
                </p>
                <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}>
                  "Every piece of this platform — from the neural match scoring and live 8-stage application stepper to the interactive AI technical interview coach — was built with enterprise craftsmanship to empower software engineers to showcase their real potential."
                </p>

                {/* Core Stack Highlights */}
                <div className={`pt-2 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider font-satoshi block mb-2 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}>
                    Core Engineering Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "React 19 & Tailwind",
                      "Java & Spring Boot",
                      "PostgreSQL & Microservices",
                      "Spring AI & Neural Embeddings",
                      "Docker & Cloud CI/CD",
                      "REST & WebSocket Messaging",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          isLight
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
                        }`}
                      >
                        <Code2 size={11} className="text-indigo-500" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ CORE ARCHITECTURAL PILLARS ══════════ */}
      <section className={`section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        <div className="text-center mb-12">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold ${
            isLight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}>
            <Shield size={14} className="text-emerald-500" />
            <span>Platform Principles</span>
          </span>
          <h2 className={`mt-4 text-3xl sm:text-4xl font-black font-satoshi tracking-tight ${
            isLight ? "text-slate-900" : "text-white"
          }`}>
            How JobPortal AI Outperforms Traditional Job Boards
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CORE_PILLARS.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={itemVariants}
              className={`rounded-3xl border p-7 backdrop-blur-xl transition duration-300 hover:shadow-xl flex flex-col justify-between ${
                isLight
                  ? "border-slate-200 bg-white hover:border-indigo-300 shadow-sm"
                  : "border-white/10 bg-[#090d16]/90 hover:border-indigo-500/40 hover:bg-[#0c111f]"
              }`}
            >
              <div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${pillar.from}, ${pillar.to})`,
                  }}
                >
                  <pillar.icon size={22} className="text-white" />
                </div>
                <h3 className={`text-lg font-extrabold font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>{pillar.title}</h3>
                <p className={`mt-2.5 text-xs sm:text-sm font-medium leading-relaxed ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}>
                  {pillar.description}
                </p>
              </div>
              <div className={`mt-6 pt-4 border-t flex items-center gap-1.5 text-xs font-bold text-emerald-500 ${
                isLight ? "border-slate-100" : "border-white/10"
              }`}>
                <CheckCircle2 size={13} /> Active on Platform
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════ DIRECT CONTACT & PARTNERSHIP CTA ══════════ */}
      <section className={`section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`rounded-3xl border p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden ${
            isLight
              ? "border-indigo-200 bg-white shadow-xl"
              : "border-indigo-500/30 bg-gradient-to-br from-[#120d24] via-[#090d16] to-[#05070d]"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl mb-6">
            <Mail size={24} />
          </div>

          <h2 className={`text-2xl sm:text-4xl font-black font-satoshi tracking-tight ${
            isLight ? "text-slate-900" : "text-white"
          }`}>
            Have Inquiries or Partnership Proposals?
          </h2>

          <p className={`mt-4 text-xs sm:text-sm leading-relaxed font-medium max-w-xl mx-auto ${
            isLight ? "text-slate-600" : "text-slate-300"
          }`}>
            Directly connect with founder <strong className={isLight ? "text-slate-900 font-bold" : "text-white font-bold"}>Yash Lodam</strong> for platform questions, enterprise recruiter onboarding, or technical collaborations.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:yashlodam03@gmail.com"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-7 py-3.5 text-xs sm:text-sm font-extrabold !text-white shadow-lg shadow-indigo-600/30 hover:scale-105 transition cursor-pointer font-satoshi"
            >
              <Mail size={15} className="!text-white" />
              <span className="!text-white">Contact Yash Lodam (yashlodam03@gmail.com)</span>
              <ArrowRight size={15} className="!text-white" />
            </a>

            <Link
              to="/find-jobs"
              className={`inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Explore Live Jobs
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}