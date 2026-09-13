/**
 * src/Pages/CareerHubPage.jsx
 *
 * Senior UI/UX Executive AI Career Command Center (Velora Suite v4.8).
 * Optimized with comfortable font sizes (text-sm/text-base), spacious layouts,
 * and high-contrast Satoshi typography for maximum User Experience (UX).
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SkillAssessmentsModule from "../features/career-hub/components/SkillAssessmentsModule";
import ResumeBuilderMain from "../features/resume-builder/pages/ResumeBuilderMain";
import {
  Sparkles,
  FileText,
  Video,
  CheckCircle2,
  Compass,
  TrendingUp,
  Download,
  Play,
  RotateCcw,
  Check,
  Zap,
  Briefcase,
  ChevronRight,
  Code,
  Award,
  AlertCircle,
  BarChart3,
  BookOpen,
  DollarSign,
  Mic,
  Star,
  Shield,
  Layers,
  Cpu,
  Target,
  ArrowUpRight,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import MockInterviewMain from "../features/mock-interview/pages/MockInterviewMain";
import ResumeAnalyzerMain from "../features/resume-analyzer/pages/ResumeAnalyzerMain";
import { useTheme } from "../context/ThemeContext";

export default function CareerHubPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const getActiveTab = (path) => {
    if (path.includes("builder")) return "builder";
    if (path.includes("interview")) return "interview";
    if (path.includes("assessments")) return "assessments";
    if (path.includes("roadmaps")) return "roadmaps";
    if (path.includes("salary")) return "salary";
    return "analyzer"; // Default #1 priority: AI Resume Analyzer
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  useEffect(() => {
    setActiveTab(getActiveTab(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const routes = {
      analyzer: "/career-hub/resume-analyzer",
      builder: "/career-hub/resume-builder",
      interview: "/career-hub/interview-coach",
      assessments: "/career-hub/assessments",
      roadmaps: "/career-hub/roadmaps",
      salary: "/career-hub/salary-insights",
    };
    navigate(routes[tabId]);
  };

  const tabs = [
    { id: "analyzer", label: "AI Resume Analyzer", icon: Sparkles, badge: "PRIORITY #1" },
    { id: "builder", label: "AI Resume Studio", icon: FileText, badge: "PRO" },
    { id: "interview", label: "Mock Interview Simulator", icon: Video, badge: "LIVE" },
    { id: "assessments", label: "Skill Assessments & Certifications", icon: Award },
    { id: "roadmaps", label: "Role Progression Trees", icon: Compass },
    { id: "salary", label: "Compensation Intelligence", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-satoshi relative overflow-hidden transition-colors duration-300 text-body">
      {/* Executive Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-[180px] bg-gradient-to-tr from-indigo-600/10 via-purple-600/5 to-pink-600/5" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-widest font-satoshi shadow-sm ${
              isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              <Cpu className="h-4 w-4 animate-pulse" /> JobPortal Neural AI Engine v4.8 Active
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-satoshi tracking-tight leading-tight text-heading">
              AI Career <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Command Center</span>
            </h1>
            <p className="text-sm sm:text-base max-w-2xl font-medium leading-relaxed text-muted">
              Accelerate your engineering trajectory with real-time ATS document audits, AI interview coaching, live skill verification, and market compensation benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
          </div>
        </div>

        {/* Navigation Pill Tabs - Mobile Momentum Scrolling & Touch Optimized */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 touch-scroll-x no-scrollbar border-b font-satoshi border-border -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 sm:px-5 sm:py-3 min-h-[44px] rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 !text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    : "bg-surface border border-border text-muted hover:bg-surface-elevated hover:text-heading shadow-xs"
                }`}
              >
                <Icon size={17} className={isActive ? "!text-white" : "text-muted"} />
                <span className={`whitespace-nowrap ${isActive ? "!text-white" : ""}`}>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isActive ? "bg-white/20 !text-white" : isLight ? "bg-indigo-100 text-indigo-700" : "bg-indigo-500/20 text-indigo-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content Render */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "builder" && <ResumeBuilderSection />}
            {activeTab === "analyzer" && <ResumeAnalyzerMain />}
            {activeTab === "interview" && <InterviewCoachSection />}
            {activeTab === "assessments" && <AssessmentsSection />}
            {activeTab === "roadmaps" && <RoadmapsSection />}
            {activeTab === "salary" && <SalaryInsightsSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   1. Executive AI Resume Builder Section
   ──────────────────────────────────────────────────────────── */
function ResumeBuilderSection() {
  return <ResumeBuilderMain />;
}

/* ────────────────────────────────────────────────────────────
   2. Interactive ATS Document Auditor Section
   ──────────────────────────────────────────────────────────── */
function ResumeAnalyzerSection() {
  return <ResumeAnalyzerMain />;
}

/* ────────────────────────────────────────────────────────────
   3. Interactive AI Interview Coach Section
   ──────────────────────────────────────────────────────────── */
function InterviewCoachSection() {
  return <MockInterviewMain />;
}

/* ────────────────────────────────────────────────────────────
   4. Skill Assessments Section
   ──────────────────────────────────────────────────────────── */
function AssessmentsSection() {
  return <SkillAssessmentsModule />;
}

/* ────────────────────────────────────────────────────────────
   5. Career Roadmaps Section
   ──────────────────────────────────────────────────────────── */
function RoadmapsSection() {
  const roadmaps = [
    { role: "Senior Full-Stack Engineer", steps: ["HTML/CSS & Modern JavaScript", "React 19 & Redux Toolkit", "Spring Boot & Microservices", "System Design & Cloud Deployment"] },
    { role: "AI & Machine Learning Engineer", steps: ["Python & Applied Mathematics", "Data Structures & PyTorch", "LLM Fine-tuning & RAG Pipelines", "Production Model Deployment"] },
  ];

  return (
    <div className="space-y-6 font-satoshi">
      {roadmaps.map((r) => (
        <Card key={r.role} className="p-6 sm:p-8 space-y-5 border-border bg-surface shadow-xl">
          <h3 className="font-black text-heading font-satoshi text-xl flex items-center gap-2">
            <Compass className="h-6 w-6 text-indigo-500 dark:text-indigo-400" /> {r.role} Roadmap
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {r.steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Step 0{idx + 1}</span>
                <p className="text-xs font-extrabold text-heading">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   6. Salary Insights Section
   ──────────────────────────────────────────────────────────── */
function SalaryInsightsSection() {
  const salaries = [
    { role: "Senior Full-Stack Developer", avg: "₹22,50,000", min: "₹14,00,000", max: "₹34,00,000" },
    { role: "Spring Boot Backend Specialist", avg: "₹20,00,000", min: "₹13,00,000", max: "₹30,00,000" },
    { role: "Lead AI Systems Architect", avg: "₹35,00,000", min: "₹24,00,000", max: "₹50,00,000" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-satoshi">
      {salaries.map((s) => (
        <Card key={s.role} className="p-6 sm:p-7 space-y-3 border-border bg-surface shadow-xl">
          <p className="text-xs text-muted font-bold">{s.role}</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-satoshi">{s.avg} / yr</h3>
          <p className="text-xs text-muted font-medium">Market Range: {s.min} - {s.max}</p>
        </Card>
      ))}
    </div>
  );
}
