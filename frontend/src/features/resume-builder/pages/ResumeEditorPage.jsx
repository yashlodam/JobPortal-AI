import React, { useState, useEffect } from "react";
import { Sparkles, Save, CheckCircle2, Loader2, FileText, Download, ArrowLeft, ShieldCheck, AlertCircle, Target, Eye } from "lucide-react";
import { useResumeBuilder } from "../hooks/useResumeBuilder";
import { useToast } from "../../../components/ui/ToastNotification";
import SectionNav from "../components/Editor/SectionNav";
import PersonalInfoForm from "../components/Editor/PersonalInfoForm";
import SummaryForm from "../components/Editor/SummaryForm";
import ExperienceForm from "../components/Editor/ExperienceForm";
import EducationForm from "../components/Editor/EducationForm";
import ProjectsForm from "../components/Editor/ProjectsForm";
import SkillsForm from "../components/Editor/SkillsForm";
import CertificationsForm from "../components/Editor/CertificationsForm";
import AchievementsForm from "../components/Editor/AchievementsForm";
import ResumePreviewContainer from "../components/Preview/ResumePreviewContainer";
import AISuggestionModal from "../components/AI/AISuggestionModal";

// ── Resume Health Panel ────────────────────────────────────────────────────────
function ResumeHealthPanel({ resume, atsAnalysis, onRunAudit, isAiLoading }) {
  const completion = resume?.completionPercentage || 0;
  const checks = [
    { label: "Personal Info", done: !!(resume?.personalInfo?.fullName && resume?.personalInfo?.email) },
    { label: "Professional Summary", done: !!(resume?.summary && resume.summary.length > 30) },
    { label: "Work Experience", done: !!(resume?.experience?.length > 0) },
    { label: "Education", done: !!(resume?.education?.length > 0) },
    { label: "Technical Skills", done: !!(resume?.skills?.technical?.length > 0 || (Array.isArray(resume?.skills) && resume.skills.length > 0)) },
    { label: "Projects", done: !!(resume?.projects?.length > 0) },
    { label: "Certifications", done: !!(resume?.certifications?.length > 0) },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  const atsScore = atsAnalysis?.atsScore || resume?.atsScore || null;

  return (
    <div className="p-4 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-500 dark:text-indigo-400" />
          <span className="text-sm font-black text-heading">Resume Health</span>
        </div>
        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
          completion >= 80
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            : completion >= 50
            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
            : "text-rose-500 bg-rose-500/10 border-rose-500/20"
        }`}>
          {completion}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-surface-hover overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            completion >= 80 ? "bg-emerald-500" : completion >= 50 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Section Checklist */}
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-[11px] font-medium">
            {c.done ? (
              <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={12} className="text-rose-400 shrink-0" />
            )}
            <span className={c.done ? "text-body" : "text-muted"}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* ATS Score / Audit */}
      <div className="pt-2 border-t border-border space-y-2">
        {atsScore ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs font-black text-heading">ATS Score</span>
            </div>
            <span className={`text-sm font-black ${atsScore >= 80 ? "text-emerald-500" : atsScore >= 60 ? "text-amber-500" : "text-rose-500"}`}>
              {atsScore}/100
            </span>
          </div>
        ) : null}

        <button
          onClick={onRunAudit}
          disabled={isAiLoading || !resume?.id}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-black hover:bg-indigo-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiLoading ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
          {isAiLoading ? "Auditing..." : atsScore ? "Re-run ATS Audit" : "Run ATS Audit"}
        </button>
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "preview"

  const {
    currentResume,
    updatePersonalInfo,
    updateSummary,
    updateExperience,
    updateEducation,
    updateProjects,
    updateSkills,
    updateCertifications,
    updateAchievements,
    updateLanguages,
    updateResume,
    saveStatus,
    isDirty,
    setViewMode,
    analyzeBuilderResume,
    aiLoading,
    atsAnalysis,
  } = useResumeBuilder();

  // Debounced auto-save effect (1.5s after user stops typing)
  useEffect(() => {
    if (!isDirty || !currentResume?.id) return;
    const timer = setTimeout(() => {
      updateResume({ id: currentResume.id, resumeData: currentResume });
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentResume, isDirty]);

  const handleManualSave = () => {
    if (currentResume?.id) {
      updateResume({ id: currentResume.id, resumeData: currentResume });
      toast.success("Resume saved successfully!");
    }
  };

  const handleRunAudit = async () => {
    if (!currentResume?.id) {
      toast.error("Please save your resume before running ATS audit.");
      return;
    }
    toast.info("Running ATS audit on your resume...");
    try {
      await analyzeBuilderResume(currentResume.id);
      toast.success("ATS audit complete! Check your score above.");
    } catch {
      toast.error("ATS audit failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 font-satoshi text-body pb-12">
      {/* Top Controls & Cloud Auto-Save Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode("dashboard")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-surface-hover hover:bg-surface-elevated text-xs font-bold text-body hover:text-heading transition cursor-pointer border border-border"
          >
            <ArrowLeft size={15} /> Dashboard
          </button>

          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-0.5 text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles size={12} className="text-amber-500 dark:text-amber-300 animate-pulse" /> Live A4 Sync Active
            </div>
            <h2 className="text-base sm:text-lg font-black text-heading flex items-center gap-2">
              <FileText size={18} className="text-indigo-500 dark:text-indigo-400" />
              {currentResume?.title || "Untitled Resume"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                <Loader2 size={14} className="animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Saved to Cloud
              </span>
            )}
          </div>

          <button
            onClick={handleManualSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-xl shadow-indigo-500/20 hover:scale-105"
          >
            <Save size={15} /> Save Draft
          </button>
        </div>
      </div>

      {/* Mobile-Only Segment Switcher: Edit Sections vs Live A4 Preview */}
      <div className="lg:hidden flex items-center p-1.5 rounded-2xl bg-surface border border-border shadow-md">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            mobileTab === "editor"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-muted hover:text-heading"
          }`}
        >
          <FileText size={14} /> Edit Form
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-muted hover:text-heading"
          }`}
        >
          <Eye size={14} /> Live Preview & Download
        </button>
      </div>

      {/* Spacious 2-Column Grid Layout (Editor: 5 cols | Preview: 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Section Selector Nav + Resume Health + Dynamic Form Editor (5 cols on Desktop) */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === "editor" ? "block" : "hidden lg:block"}`}>
          {/* Compact Section Navigation Bar */}
          <div className="p-4 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl">
            <SectionNav
              activeSection={activeSection}
              onSelectSection={setActiveSection}
              resume={currentResume}
            />
          </div>

          {/* Resume Health Panel */}
          <ResumeHealthPanel
            resume={currentResume}
            atsAnalysis={atsAnalysis}
            onRunAudit={handleRunAudit}
            isAiLoading={aiLoading}
          />

          {/* Form Editor Card */}
          <div className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl min-h-[550px]">
            {activeSection === "personalInfo" && (
              <PersonalInfoForm
                info={currentResume?.personalInfo}
                onChange={updatePersonalInfo}
              />
            )}

            {activeSection === "summary" && (
              <SummaryForm
                summary={currentResume?.summary}
                onChange={updateSummary}
              />
            )}

            {activeSection === "experience" && (
              <ExperienceForm
                experience={currentResume?.experience}
                onChange={updateExperience}
              />
            )}

            {activeSection === "education" && (
              <EducationForm
                education={currentResume?.education}
                onChange={updateEducation}
              />
            )}

            {activeSection === "projects" && (
              <ProjectsForm
                projects={currentResume?.projects}
                onChange={updateProjects}
              />
            )}

            {activeSection === "skills" && (
              <SkillsForm
                skills={currentResume?.skills}
                onChange={updateSkills}
              />
            )}

            {activeSection === "certifications" && (
              <CertificationsForm
                certifications={currentResume?.certifications}
                onChange={updateCertifications}
              />
            )}

            {activeSection === "achievements" && (
              <AchievementsForm
                achievements={currentResume?.achievements}
                onChange={updateAchievements}
              />
            )}
          </div>
        </div>

        {/* Right Column: Live A4 Document Canvas */}
        <div className={`lg:col-span-7 lg:sticky lg:top-6 ${mobileTab === "preview" ? "block" : "hidden lg:block"}`}>
          <ResumePreviewContainer resume={currentResume} />
        </div>
      </div>

      {/* Mobile Floating "Preview & Download" Quick Action Button (when in editor mode) */}
      {mobileTab === "editor" && (
        <div className="lg:hidden fixed bottom-6 right-4 z-40">
          <button
            type="button"
            onClick={() => {
              setMobileTab("preview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-2xl shadow-indigo-600/40 border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Eye size={16} />
            <span>Preview Resume</span>
          </button>
        </div>
      )}

      {/* AI Suggestion Modal — only shown for non-auto-applied suggestions */}
      <AISuggestionModal />
    </div>
  );
}

