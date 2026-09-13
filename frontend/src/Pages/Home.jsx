/**
 * src/Pages/Home.jsx
 *
 * Public landing page — assembled from section components.
 *
 * Section order:
 * 1. DreamJob — Hero with search, quick filters, live job count
 * 2. Companies — Employer marquee
 * 3. RecommendedJobsSection (authenticated) / CTA card (guest)
 * 4. JobCategory — Role & work mode discovery
 * 5. FeaturedJobs — Live opportunities
 * 6. HowItWorks — 3-step AI matching workflow
 * 7. AIToolsShowcase — Feature suite
 * 8. SalaryInsights — Salary benchmarks (illustrative, with disclaimer)
 * 9. ProductFeatures — Honest platform capability highlights
 * 10. DualCTA — Job seeker vs. employer conversion
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../State/Store";
import { useTheme } from "../context/ThemeContext";
import DreamJob from "../LandingPage/DreamJob";
import Companies from "../LandingPage/Companies";
import JobCategory from "../LandingPage/JobCategory";
import FeaturedJobs from "../LandingPage/FeaturedJobs";
import HowItWorks from "../LandingPage/HowItWorks";
import AIToolsShowcase from "../LandingPage/AIToolsShowcase";
import SalaryInsights from "../LandingPage/SalaryInsights";
import ProductFeatures from "../LandingPage/Testimonials";
import DualCTA from "../LandingPage/DualCTA";
import RecommendedJobsSection from "../components/recommendation/RecommendedJobsSection";

function Home() {
  const { profile } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const accountType = (profile?.accountType || profile?.role || "").toUpperCase();
  const isRecruiter = accountType === "EMPLOYER" || accountType === "RECRUITER";
  const isAdmin = accountType === "ADMIN";
  const isCandidate = Boolean(profile && !isRecruiter && !isAdmin);

  return (
    <div className={`relative min-h-screen font-inter transition-colors duration-500 overflow-x-hidden ${
      isLight 
        ? "bg-[#F8FAFC] text-slate-800" 
        : "bg-[#070B12] text-slate-200"
    }`}>
      {/* Subtle static gradient orbs - CSS only, no JS/canvas */}
      {!isLight && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/8 blur-[120px]" />
          <div className="absolute top-1/3 right-0 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-violet-600/6 blur-[100px]" />
        </div>
      )}

      {/* ── UX-Optimized Section Flow with Layered Stacking ── */}
      <div className="relative z-10 space-y-0">
        <DreamJob />
        <Companies />

        {/* Dynamic Personalization Layer: Top Recommended Jobs for Candidates / Recruiter Studio / Guest Preview */}
        {isCandidate ? (
          <section className={`relative py-12 border-b transition-colors ${
            isLight ? "border-slate-200/80 bg-gradient-to-b from-indigo-50/40 via-white/20 to-transparent backdrop-blur-xs" : "border-white/5 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent"
          }`}>
            <div className="section-container">
              <RecommendedJobsSection
                showHeading={true}
                limit={20}
                initialDisplayCount={4}
                stepCount={4}
                showViewAllButton={true}
                viewAllLink="/find-jobs?feed=recommended"
              />
            </div>
          </section>
        ) : isRecruiter ? (
          <section className={`relative py-10 border-b transition-colors ${
            isLight ? "border-purple-200/80 bg-gradient-to-r from-purple-50/40 via-white/30 to-indigo-50/40 backdrop-blur-xs" : "border-white/5 bg-gradient-to-r from-purple-950/25 via-transparent to-indigo-950/25"
          }`}>
            <div className="section-container">
              <div className={`flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all ${
                isLight ? "border-purple-200/80 bg-white/85 shadow-purple-100/50 hover:border-purple-300" : "border-purple-500/20 bg-[#090d16]/80 hover:border-purple-500/40"
              }`}>
                <div className="space-y-2 text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                    isLight ? "bg-purple-50 border border-purple-200 text-purple-700" : "bg-purple-500/10 border border-purple-500/20 text-purple-300"
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>Recruiter Command Studio</span>
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-black font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
                    Hire Top Talent Faster with Deterministic ATS Matching
                  </h3>
                  <p className={`text-xs sm:text-sm max-w-xl leading-relaxed font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Post openings with automated skill extraction, review candidate ATS fit percentages, and schedule interviews seamlessly.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <Link
                    to="/upload-job"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    <span>Post a New Job</span>
                  </Link>
                  <Link
                    to="/recruiter/dashboard"
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                      isLight ? "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>Recruiter Dashboard</span>
                  </Link>
                  <Link
                    to="/find-talent"
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                      isLight ? "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>Source Candidates</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className={`relative py-10 border-b transition-colors ${
            isLight ? "border-slate-200/80 bg-gradient-to-r from-indigo-50/40 via-white/30 to-purple-50/40 backdrop-blur-xs" : "border-white/5 bg-gradient-to-r from-indigo-950/25 via-transparent to-purple-950/25"
          }`}>
            <div className="section-container">
              <div className={`flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all ${
                isLight ? "border-indigo-200/80 bg-white/85 shadow-indigo-100/50 hover:border-indigo-300" : "border-indigo-500/20 bg-[#090d16]/80 hover:border-indigo-500/40"
              }`}>
                <div className="space-y-2 text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                    isLight ? "bg-indigo-50 border border-indigo-200 text-indigo-700" : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>AI Career Matching Preview</span>
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-black font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
                    Unlock Personalized Job Matches &amp; Fit Scores
                  </h3>
                  <p className={`text-xs sm:text-sm max-w-xl leading-relaxed font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Create your candidate profile or enter your skills to get instant deterministic ATS match scores, salary benchmarks, and tailored openings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    <span>Get Matched Now</span>
                  </Link>
                  <Link
                    to="/find-jobs"
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                      isLight ? "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>Browse All Roles</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <JobCategory />
        <FeaturedJobs />
        <HowItWorks />
        <AIToolsShowcase />
        <SalaryInsights />
        <ProductFeatures />
        <DualCTA />
      </div>
    </div>
  );
}

export default Home;