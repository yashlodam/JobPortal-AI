/**
 * src/LandingPage/DualCTA.jsx
 *
 * Ultra-Premium Dual-Sided Call-To-Action (Job Seekers vs. Employers/Recruiters).
 * Distinct value propositions, verified feature checkmarks, and targeted CTAs.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Building2,
  Bot,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function DualCTA() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`} aria-label="Join JobPortal">
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Job Seekers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 sm:p-10 shadow-2xl backdrop-blur-2xl transition ${
              isLight
                ? "border-indigo-200/90 bg-white/90 shadow-xl hover:border-indigo-300 hover:shadow-2xl"
                : "border-indigo-500/30 bg-gradient-to-br from-[#0c1122]/90 via-[#090d16]/90 to-[#05070d]/90 hover:border-indigo-500/60 hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]"
            }`}
          >
            {/* Top Accent */}
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold ${
                isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
              }`}>
                <UserCheck size={13} className={isLight ? "text-indigo-600" : "text-indigo-400"} />
                <span>For Tech Candidates</span>
              </div>

              <div>
                <h3 className={`text-2xl sm:text-3xl font-black font-satoshi tracking-tight leading-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  Ready to Land Your{" "}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Next Dream Role?
                  </span>
                </h3>
                <p className={`mt-3 text-xs sm:text-sm leading-relaxed font-medium ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}>
                  Supercharge your search with real-time AI Match Scores, automated cover letters, and live application tracking.
                </p>
              </div>

              {/* Benefits List */}
              <ul className={`space-y-3 text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                {[
                  "Evaluate your resume fit with 0–100% AI Match Scores",
                  "Auto-generate customized cover letter tones",
                  "Prepare with AI Mock Technical & HR Interviews",
                  "Direct messaging with verified company recruiters",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className={`mt-8 pt-6 border-t flex flex-wrap items-center gap-3 ${
              isLight ? "border-slate-100" : "border-white/10"
            }`}>
              <Link
                to="/find-jobs"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3.5 text-xs font-extrabold !text-white shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <span className="!text-white">Find Jobs Now</span>
                <ArrowRight size={14} className="!text-white" />
              </Link>
              <Link
                to="/profile"
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-bold transition cursor-pointer ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Build Smart Profile
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Employers & Recruiters */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-8 sm:p-10 shadow-2xl backdrop-blur-2xl transition ${
              isLight
                ? "border-purple-200/90 bg-white/90 shadow-xl hover:border-purple-300 hover:shadow-2xl"
                : "border-purple-500/30 bg-gradient-to-br from-[#120c1f]/90 via-[#090d16]/90 to-[#05070d]/90 hover:border-purple-500/60 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)]"
            }`}
          >
            {/* Top Accent */}
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold ${
                isLight ? "border-purple-200 bg-purple-50 text-purple-700" : "border-purple-500/40 bg-purple-500/15 text-purple-300"
              }`}>
                <Building2 size={13} className={isLight ? "text-purple-600" : "text-purple-400"} />
                <span>For Employers & Hiring Teams</span>
              </div>

              <div>
                <h3 className={`text-2xl sm:text-3xl font-black font-satoshi tracking-tight leading-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  Hiring the Top 1%{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                    Engineering Talent?
                  </span>
                </h3>
                <p className={`mt-3 text-xs sm:text-sm leading-relaxed font-medium ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}>
                  Automate candidate screening with neural skill ranking, reduce time-to-hire by 60%, and manage full hiring pipelines.
                </p>
              </div>

              {/* Benefits List */}
              <ul className={`space-y-3 text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                {[
                  "Post verified jobs with AI automated skill requirements",
                  "AI candidate rank-ordering based on ATS resume audits",
                  "Schedule and coordinate technical interviews directly",
                  "Verified employer badge and enterprise candidate pipeline",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 size={16} className="text-purple-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className={`mt-8 pt-6 border-t flex flex-wrap items-center gap-3 ${
              isLight ? "border-slate-100" : "border-white/10"
            }`}>
              <Link
                to="/upload-job"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-3.5 text-xs font-extrabold !text-white shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <span className="!text-white">Post a Job Opening</span>
                <ArrowRight size={14} className="!text-white" />
              </Link>
              <Link
                to="/find-talent"
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-bold transition cursor-pointer ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Browse Candidates
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
