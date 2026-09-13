import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCheck,
  RotateCcw,
  Upload,
  Zap,
  Briefcase,
  FileText,
  Copy,
  Check,
  Layers,
  Award,
  Cpu,
  Brain,
  MessageSquare,
  PenLine,
  Target,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BadgeCheck,
  Globe,
} from "lucide-react";
import { useResumeAnalyzer } from "../hooks/useResumeAnalyzer";
import { useToast } from "../../../components/ui/ToastNotification";
import ScoreCard from "../components/ScoreCard";
import SkillChips from "../components/SkillChips";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ResumeUploadPage from "./ResumeUploadPage";

export default function ResumeAnalysisDashboard({ onReUploadClick }) {
  const { analysis, status, reAnalyze, removeResume } = useResumeAnalyzer();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null);

  if (status === "analyzing" || status === "uploading") {
    return <LoadingSkeleton />;
  }

  if (!analysis) {
    return <ResumeUploadPage onAnalyzeSuccess={onReUploadClick} />;
  }

  // Extract all fields from real backend ResumeAnalysisResponse DTO
  const overallScore   = analysis.overallScore ?? 0;
  const atsScore       = analysis.atsScore ?? 0;
  const summaryText    = analysis.summary || "";
  const resumeName     = analysis.resumeName || "Uploaded Resume";
  const fromCache      = analysis.fromCache;
  const analyzedAt     = analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleDateString() : "";

  // New AI intelligence fields
  const careerLevel    = analysis.careerLevel || null;
  const industryDomain = analysis.industryDomain || null;
  const interviewQuestions = Array.isArray(analysis.interviewQuestions) ? analysis.interviewQuestions : [];
  const resumeRewriteTips  = Array.isArray(analysis.resumeRewriteTips)  ? analysis.resumeRewriteTips  : [];
  const atsBulletPoints    = Array.isArray(analysis.atsBulletPoints)    ? analysis.atsBulletPoints    : [];

  const scoreBreakdown    = analysis.scoreBreakdown || {};
  const deterministicScore = scoreBreakdown.deterministicScore ?? Math.round(overallScore * 0.98);
  const semanticScore     = scoreBreakdown.semanticScore ?? overallScore;

  const detectedSkills  = Array.isArray(analysis.skills)         ? analysis.skills         : [];
  const missingSkills   = Array.isArray(analysis.missingSkills)  ? analysis.missingSkills  : [];
  const strengthsList   = Array.isArray(analysis.strengths)      ? analysis.strengths      : [];
  const improvementsList = Array.isArray(analysis.improvements)  ? analysis.improvements   : [];
  const recommendedJobs = Array.isArray(analysis.recommendedJobs)? analysis.recommendedJobs: [];

  const handleCopySummary = () => {
    const reportText = `Resume Health Report â€” ${resumeName}
Overall Score: ${overallScore}/100 | ATS Score: ${atsScore}/100
Career Level: ${careerLevel || "N/A"} | Domain: ${industryDomain || "N/A"}
Deterministic: ${deterministicScore}/100 | AI Semantic: ${semanticScore}/100
Summary: ${summaryText}
Top Strengths: ${strengthsList.join("; ")}
Key Improvements: ${improvementsList.join("; ")}`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success("Analysis report copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    toast.success("ATS bullet copied!");
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const getScoreColor = (val) => {
    if (val >= 80) return "bg-emerald-500 text-emerald-700 dark:text-emerald-300";
    if (val >= 65) return "bg-indigo-500 text-indigo-700 dark:text-indigo-300";
    if (val >= 50) return "bg-amber-500 text-amber-700 dark:text-amber-300";
    return "bg-rose-500 text-rose-700 dark:text-rose-300";
  };

  const getScoreBgText = (val) => {
    if (val >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 65) return "text-indigo-600 dark:text-indigo-400";
    if (val >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const careerLevelColors = {
    "Fresher":      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    "Junior":       "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    "Mid-Level":    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    "Senior":       "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
    "Lead/Principal":"bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    "Executive":    "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30",
  };
  const careerColor = careerLevelColors[careerLevel] || "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";

  const TABS = [
    { id: "all",       label: "Full Overview",          icon: Layers },
    { id: "scores",    label: "Score Breakdown",         icon: Zap },
    { id: "skills",    label: "Skills & Gaps",           icon: Sparkles },
    { id: "insights",  label: "Strengths & Actions",     icon: Award },
    { id: "interview", label: "Interview Prep",          icon: MessageSquare },
    { id: "rewrite",   label: "Rewrite Tips",            icon: PenLine },
    { id: "bullets",   label: "ATS Bullets",             icon: Target },
    { id: "roles",     label: "Recommended Roles",       icon: UserCheck },
  ];

  return (
    <div className="space-y-8 font-satoshi py-4 text-body">

      {/* â”€â”€ TOP BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Resume Health Audit: Complete
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-heading">
            Authoritative Resume{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Health Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium">
            Document: <span className="text-heading font-bold">{resumeName}</span>
            {analyzedAt ? ` â€¢ Audited on ${analyzedAt}` : ""}
            {fromCache ? " â€¢ Cached" : ""}
          </p>

          {/* Career Level & Industry Domain Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {careerLevel && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${careerColor}`}>
                <BadgeCheck size={12} /> {careerLevel}
              </span>
            )}
            {industryDomain && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/25">
                <Globe size={12} /> {industryDomain}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-2 rounded-2xl bg-surface-elevated border border-border hover:bg-surface-hover px-4 py-2.5 text-xs font-black text-heading transition cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy Report"}
          </button>
          <button
            onClick={reAnalyze}
            className="flex items-center gap-2 rounded-2xl bg-surface-elevated border border-border hover:bg-surface-hover px-4 py-2.5 text-xs font-black text-heading transition cursor-pointer"
          >
            <RotateCcw size={14} /> Re-Analyze
          </button>
          <button
            onClick={() => { removeResume(); if (onReUploadClick) onReUploadClick(); }}
            className="flex items-center gap-2 rounded-2xl gradient-bg-signature hover:opacity-90 px-5 py-2.5 text-xs font-black text-white shadow-button transition cursor-pointer"
          >
            <Upload size={14} /> Upload New
          </button>
        </div>
      </div>

      {/* â”€â”€ TAB NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-surface-elevated text-muted hover:text-heading border border-border"
              }`}
            >
              <Icon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* â”€â”€ PRIMARY SCORE CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "scores") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ScoreCard
            title="Authoritative Resume Health Score"
            score={overallScore}
            icon={ShieldCheck}
            badgeText={`${overallScore}/100`}
            description="100% reproducible baseline: 75% Deterministic Rules + 25% AI Semantic."
          />
          <ScoreCard
            title="ATS Parseability & Keyword Score"
            score={atsScore}
            icon={FileCheck}
            badgeText={`${atsScore}/100`}
            description="Evaluated against Workday, Greenhouse & Lever ATS parsing patterns."
          />
        </div>
      )}

      {/* â”€â”€ ENGINE CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "scores") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-surface border border-indigo-500/30 backdrop-blur-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={14} /> Deterministic Rule Engine
              </span>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                75% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-heading">{deterministicScore}/100</span>
              <span className="text-xs text-muted font-semibold">Objective rule-based mathematical score</span>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-surface border border-purple-500/30 backdrop-blur-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                <Brain size={14} /> AI Semantic Evaluation
              </span>
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/25">
                25% Weight
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-heading">{semanticScore}/100</span>
              <span className="text-xs text-muted font-semibold">LLM contextual quality & impact evaluation</span>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ COMPONENT BREAKDOWN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "scores") && scoreBreakdown && (
        <div className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <Zap size={18} className="text-indigo-500" /> Component Score Breakdown
            </h3>
            <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
              {analysis.scoringVersion || "RESUME_HEALTH_V1"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "ATS Structure",           score: scoreBreakdown.atsStructure ?? 75, weight: "15%" },
              { label: "Keywords Density",         score: scoreBreakdown.keywords     ?? 75, weight: "20%" },
              { label: "Skill Match Depth",        score: scoreBreakdown.skills       ?? 80, weight: "20%" },
              { label: "Experience & Impact",      score: scoreBreakdown.experience   ?? 75, weight: "20%" },
              { label: "Education & Credentials",  score: scoreBreakdown.education    ?? 80, weight: "10%" },
              { label: "Document Formatting",      score: scoreBreakdown.formatting   ?? 85, weight: "10%" },
              { label: "Section Completeness",     score: scoreBreakdown.completeness ?? 85, weight: "5%"  },
            ].map((comp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-heading">{comp.label}</span>
                  <span className={`text-xs font-black ${getScoreBgText(comp.score)}`}>{comp.score}/100</span>
                </div>
                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, comp.score))}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                    className={`h-full rounded-full ${getScoreColor(comp.score).split(" ")[0]}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted">{comp.weight} Weight</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ AI EXECUTIVE SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "insights") && summaryText && (
        <div className="p-6 rounded-3xl bg-surface border border-indigo-200 dark:border-primary/30 backdrop-blur-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
            <FileText size={16} /> AI Executive Summary
          </div>
          <p className="text-sm sm:text-base text-body leading-relaxed font-medium">
            "{summaryText}"
          </p>
        </div>
      )}

      {/* â”€â”€ SKILLS FOUND & MISSING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "skills") && (
        <SkillChips detectedSkills={detectedSkills} missingSkills={missingSkills} />
      )}

      {/* â”€â”€ STRENGTHS & IMPROVEMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "insights") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengthsList.length > 0 && (
            <div className="p-6 rounded-3xl bg-surface border border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-black text-heading flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> Key Strengths ({strengthsList.length})
                </h3>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                  Verified Advantages
                </span>
              </div>
              <ul className="space-y-3">
                {strengthsList.map((str, idx) => (
                  <li key={idx} className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvementsList.length > 0 && (
            <div className="p-6 rounded-3xl bg-surface border border-amber-500/20 dark:border-amber-500/30 backdrop-blur-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-black text-heading flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" /> Action Items ({improvementsList.length})
                </h3>
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                  High Impact
                </span>
              </div>
              <ul className="space-y-3">
                {improvementsList.map((imp, idx) => (
                  <li key={idx} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-500/30 flex items-start gap-3">
                    <Zap size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ INTERVIEW PREP QUESTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "interview") && interviewQuestions.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" /> Interview Prep Questions
            </h3>
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/25">
              AI-Generated for Your Profile
            </span>
          </div>
          <p className="text-xs text-muted font-medium">
            These are the questions a hiring manager is likely to ask you based on your domain and experience. Practice your answers before interviews.
          </p>
          <div className="space-y-3">
            {interviewQuestions.map((q, idx) => (
              <div key={idx} className="rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left bg-surface-elevated hover:bg-surface-hover transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-heading leading-relaxed">{q}</span>
                  </div>
                  {openQuestionIdx === idx
                    ? <ChevronUp size={16} className="text-muted shrink-0 ml-3" />
                    : <ChevronDown size={16} className="text-muted shrink-0 ml-3" />}
                </button>
                <AnimatePresence>
                  {openQuestionIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 bg-blue-50/40 dark:bg-blue-950/10 border-t border-border"
                    >
                      <p className="text-xs text-muted font-medium pt-3 leading-relaxed">
                        ðŸ’¡ <span className="font-bold text-heading">Tip:</span> Use the STAR method (Situation, Task, Action, Result) to structure your answer. Quantify your results wherever possible.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ RESUME REWRITE TIPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "rewrite") && resumeRewriteTips.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface border border-violet-500/20 dark:border-violet-500/30 backdrop-blur-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <PenLine size={18} className="text-violet-600 dark:text-violet-400" /> Resume Bullet Rewrite Tips
            </h3>
            <span className="text-[10px] font-black text-violet-700 dark:text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/25">
              BEFORE â†’ AFTER
            </span>
          </div>
          <p className="text-xs text-muted font-medium">
            Concrete before/after examples showing how to transform weak bullets into ATS-winning, metric-driven statements.
          </p>
          <div className="space-y-4">
            {resumeRewriteTips.map((tip, idx) => {
              const parts = tip.split(" â†’ ");
              const before = parts[0]?.replace("BEFORE: ", "").trim() || tip;
              const after  = parts[1]?.replace("AFTER: ", "").trim()  || "";
              return (
                <div key={idx} className="rounded-2xl border border-border overflow-hidden">
                  {/* BEFORE */}
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/15 border-b border-border">
                    <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">âŒ Before</p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{before}</p>
                  </div>
                  {/* AFTER */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15">
                    <div className="flex items-start gap-2 mb-1">
                      <ArrowRight size={12} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">âœ… After (Improved)</p>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">{after}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* â”€â”€ ATS BULLET POINTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "bullets") && atsBulletPoints.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface border border-teal-500/20 dark:border-teal-500/30 backdrop-blur-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <Target size={18} className="text-teal-600 dark:text-teal-400" /> AI-Generated ATS Bullet Points
            </h3>
            <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/25">
              Ready to Copy-Paste
            </span>
          </div>
          <p className="text-xs text-muted font-medium">
            High-impact, ATS-optimized bullet points tailored for your domain. Copy these directly into your resume as inspiration.
          </p>
          <div className="space-y-3">
            {atsBulletPoints.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/15 border border-teal-500/20">
                <Target size={14} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed flex-1">{bullet}</p>
                <button
                  onClick={() => handleCopyBullet(bullet, idx)}
                  className="shrink-0 p-1.5 rounded-xl hover:bg-teal-500/10 transition cursor-pointer"
                  title="Copy bullet"
                >
                  {copiedBulletIdx === idx
                    ? <Check size={14} className="text-emerald-500" />
                    : <Copy size={14} className="text-muted" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ RECOMMENDED ROLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(activeTab === "all" || activeTab === "roles") && recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-black text-heading flex items-center gap-2">
              <UserCheck size={20} className="text-primary" /> Recommended Target Roles ({recommendedJobs.length})
            </h3>
            <span className="text-xs font-bold text-muted">AI Specialization Match</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((role, idx) => (
              <div key={role} className="p-5 rounded-3xl bg-surface border border-border hover:border-primary/40 backdrop-blur-xl flex items-center justify-between gap-3 shadow-sm transition">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-heading text-sm">{role}</h4>
                  <span className="text-xs font-medium text-muted flex items-center gap-1">
                    <Briefcase size={12} className="text-primary" /> {industryDomain || "AI Alignment"}
                  </span>
                </div>
                <div className={`px-3 py-1.5 rounded-2xl text-xs font-black shrink-0 ${
                  idx === 0
                    ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-surface-elevated border border-border text-muted"
                }`}>
                  {idx === 0 ? "Best Match" : `#${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

