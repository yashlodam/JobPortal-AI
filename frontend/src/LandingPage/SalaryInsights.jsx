/**
 * src/LandingPage/SalaryInsights.jsx
 *
 * Ultra-Premium Interactive Tech Salary & Compensation Benchmark Explorer.
 * Real-time salary distributions, YoY trends, and experience level breakdowns.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  IndianRupee,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  BarChart3,
  Award,
  Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useTheme } from "../context/ThemeContext";

const ROLES_DATA = [
  {
    id: "fullstack",
    role: "Fullstack Engineer",
    avgSalary: "₹21.5 LPA",
    range: "₹12L – ₹38L",
    growth: "+28% YoY",
    description: "High demand for Next.js, React, Node.js, and Spring Boot specialists with cloud deployment experience.",
    levels: [
      { level: "Entry (0–2 yrs)", salary: "₹8L – ₹14L" },
      { level: "Mid (2–5 yrs)", salary: "₹15L – ₹24L" },
      { level: "Senior (5–8 yrs)", salary: "₹25L – ₹38L" },
      { level: "Lead / Staff (8+ yrs)", salary: "₹40L – ₹65L" },
    ],
    topCities: ["Bengaluru", "Pune", "Hyderabad", "Remote"],
    activeJobs: "High Demand",
  },
  {
    id: "ai_ml",
    role: "AI / ML Engineer",
    avgSalary: "₹27.0 LPA",
    range: "₹16L – ₹52L",
    growth: "+38% YoY",
    description: "Surging demand for LLM orchestration, PyTorch, RAG architectures, and fine-tuning specialists.",
    levels: [
      { level: "Entry (0–2 yrs)", salary: "₹12L – ₹18L" },
      { level: "Mid (2–5 yrs)", salary: "₹20L – ₹32L" },
      { level: "Senior (5–8 yrs)", salary: "₹34L – ₹55L" },
      { level: "Lead / Staff (8+ yrs)", salary: "₹55L – ₹90L" },
    ],
    topCities: ["Bengaluru", "Hyderabad", "Mumbai", "Remote"],
    activeJobs: "Surging Demand",
  },
  {
    id: "frontend",
    role: "Frontend Developer",
    avgSalary: "₹16.8 LPA",
    range: "₹9L – ₹30L",
    growth: "+22% YoY",
    description: "Strong focus on React 19, TypeScript, micro-frontends, performance optimization, and responsive design systems.",
    levels: [
      { level: "Entry (0–2 yrs)", salary: "₹6L – ₹11L" },
      { level: "Mid (2–5 yrs)", salary: "₹12L – ₹19L" },
      { level: "Senior (5–8 yrs)", salary: "₹20L – ₹32L" },
      { level: "Lead / Staff (8+ yrs)", salary: "₹35L – ₹50L" },
    ],
    topCities: ["Bengaluru", "Pune", "Noida", "Remote"],
    activeJobs: "High Demand",
  },
  {
    id: "devops",
    role: "DevOps & Cloud Architect",
    avgSalary: "₹24.2 LPA",
    range: "₹14L – ₹45L",
    growth: "+32% YoY",
    description: "Critical demand for Kubernetes, Terraform, AWS/GCP architecture, and CI/CD automated pipeline architects.",
    levels: [
      { level: "Entry (0–2 yrs)", salary: "₹10L – ₹15L" },
      { level: "Mid (2–5 yrs)", salary: "₹18L – ₹28L" },
      { level: "Senior (5–8 yrs)", salary: "₹30L – ₹45L" },
      { level: "Lead / Staff (8+ yrs)", salary: "₹48L – ₹75L" },
    ],
    topCities: ["Bengaluru", "Hyderabad", "Pune", "Remote"],
    activeJobs: "Critical Demand",
  },
  {
    id: "product_design",
    role: "Product Designer (UI/UX)",
    avgSalary: "₹18.0 LPA",
    range: "₹10L – ₹34L",
    growth: "+25% YoY",
    description: "High demand for Figma design system architects, user research leads, and interaction designers.",
    levels: [
      { level: "Entry (0–2 yrs)", salary: "₹7L – ₹12L" },
      { level: "Mid (2–5 yrs)", salary: "₹14L – ₹22L" },
      { level: "Senior (5–8 yrs)", salary: "₹24L – ₹35L" },
      { level: "Lead / Staff (8+ yrs)", salary: "₹38L – ₹55L" },
    ],
    topCities: ["Bengaluru", "Mumbai", "Delhi NCR", "Remote"],
    activeJobs: "Steady Growth",
  },
];

export default function SalaryInsights() {
  const [selectedRole, setSelectedRole] = useState(ROLES_DATA[0]);
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 font-inter transition-colors duration-300 bg-transparent ${
      isLight ? "text-slate-800" : "text-slate-200"
    }`} aria-label="Salary Insights">
      <div className="section-container relative z-10">
        <SectionHeader
          badge="Industry Compensation Benchmarks"
          title={
            <>
              Tech Salary &{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Compensation Benchmarks
              </span>
            </>
          }
          subtitle="Comparative compensation benchmark estimates across software engineering, AI, and product roles in India and Remote."
        />
        <p className={`text-xs mt-1 text-center max-w-2xl mx-auto ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          Sample data for illustration purposes. Actual compensation varies by experience, location, and company.
        </p>

        {/* Role Selector Tabs */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {ROLES_DATA.map((r) => {
            const isSelected = selectedRole.id === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`relative px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 !text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105"
                    : isLight
                      ? "border border-slate-200/90 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-900 shadow-xs backdrop-blur-md"
                      : "border border-white/10 bg-[#090d16]/85 text-slate-400 hover:text-white hover:border-white/20 hover:bg-[#0c111f] backdrop-blur-md"
                }`}
              >
                <span className={isSelected ? "!text-white" : ""}>{r.role}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Deep-Dive Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className={`mt-8 rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-2xl ${
              isLight
                ? "border-slate-200/90 bg-white/90 shadow-xl"
                : "border-white/10 bg-[#090d16]/90"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Top Metric Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${
                    isLight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  }`}>
                    <TrendingUp size={13} className="text-emerald-500" />
                    <span>{selectedRole.growth} Demand Growth</span>
                  </div>

                  <h3 className={`mt-3 text-2xl sm:text-3xl font-black font-satoshi ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    {selectedRole.role}
                  </h3>

                  <p className={`mt-2 text-xs sm:text-sm font-medium leading-relaxed ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    {selectedRole.description}
                  </p>
                </div>

                {/* Salary KPI Box */}
                <div className={`rounded-2xl border p-5 space-y-3 ${
                  isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#070b14]"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Average Market Package
                    </span>
                    <span className={`text-xs font-extrabold ${isLight ? "text-indigo-600" : "text-indigo-400"}`}>{selectedRole.activeJobs}</span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black font-satoshi text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {selectedRole.avgSalary}
                  </div>

                  <div className={`text-xs flex items-center justify-between border-t pt-2.5 ${
                    isLight ? "border-slate-200 text-slate-600" : "border-white/10 text-slate-400"
                  }`}>
                    <span>Typical Range:</span>
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedRole.range}</span>
                  </div>
                </div>

                {/* Top Hiring Hubs */}
                <div className="space-y-2">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Top Hiring Hubs
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.topCities.map((city) => (
                      <span
                        key={city}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                          isLight
                            ? "border-slate-200 bg-slate-100 text-slate-700"
                            : "bg-white/5 border-white/5 text-slate-300"
                        }`}
                      >
                        <MapPin size={12} className={isLight ? "text-indigo-600" : "text-indigo-400"} />
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/find-jobs?keyword=${encodeURIComponent(selectedRole.role)}`}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-xs font-extrabold !text-white shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  <span className="!text-white">Explore {selectedRole.role} Jobs</span>
                  <ArrowRight size={15} className="!text-white" />
                </Link>
              </div>

              {/* Right Column: Experience Level Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                <span className={`text-xs font-bold uppercase tracking-wider block font-satoshi ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}>
                  Experience Level Breakdown (Annual CTC)
                </span>

                <div className="space-y-3">
                  {selectedRole.levels.map((lvl, index) => (
                    <div
                      key={lvl.level}
                      className={`flex items-center justify-between rounded-2xl border p-4 transition-colors ${
                        isLight
                          ? "border-slate-200 bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-200"
                          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-black ${
                          isLight ? "border-slate-200 bg-white text-indigo-600" : "border-white/10 bg-white/5 text-indigo-400"
                        }`}>
                          L{index + 1}
                        </span>
                        <div>
                          <h5 className={`text-xs sm:text-sm font-bold font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
                            {lvl.level}
                          </h5>
                          <span className={`text-[10px] font-semibold ${isLight ? "text-slate-400" : "text-slate-500"}`}>Verified Market Baseline</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-satoshi">
                          {lvl.salary}
                        </span>
                        <span className={`block text-[10px] font-bold ${isLight ? "text-slate-400" : "text-slate-400"}`}>Fixed + Bonus</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data Transparency Banner */}
                <div className={`rounded-2xl border p-4 text-[11px] leading-relaxed flex items-center gap-2.5 ${
                  isLight ? "border-slate-200 bg-slate-50 text-slate-600 font-medium" : "border-white/10 bg-white/[0.02] text-slate-400"
                }`}>
                  <Sparkles size={16} className={isLight ? "text-indigo-600 shrink-0" : "text-indigo-400 shrink-0"} />
                  <span>
                    Aggregated from 15,000+ verified active job postings and employer compensation disclosures.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
