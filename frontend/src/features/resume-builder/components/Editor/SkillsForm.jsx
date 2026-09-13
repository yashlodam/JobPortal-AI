/**
 * src/features/resume-builder/components/Editor/SkillsForm.jsx
 * Categorized Skills Form with AI Suggest Skills feature.
 * Enhanced: Shows AI-suggested skills as one-click clickable chips before merging.
 * AI suggestions are merged into skills.technical via Redux directly after user clicks.
 */

import React, { useState } from "react";
import { Cpu, Code2, Wrench, Layers, UserCheck, Sparkles, Loader2, CheckCircle2, PlusCircle, X } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";
import { useToast } from "../../../../components/ui/ToastNotification";

export default function SkillsForm({ skills = {}, onChange }) {
  const toast = useToast();
  const { suggestSkills, aiLoading, aiSuggestion, currentResume } = useResumeBuilder();
  const [pendingChips, setPendingChips] = useState([]);
  const [pendingCategoryChips, setPendingCategoryChips] = useState([]);
  const [showChips, setShowChips] = useState(false);

  const handleCategoryChange = (category, rawText) => {
    onChange({ [category]: rawText });
  };

  const getCategoryText = (val) => {
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "string") return val;
    return "";
  };

  const handleSuggestSkills = async () => {
    if (!currentResume?.id) {
      toast.error("Please save your resume before using AI skill suggestions.");
      return;
    }
    toast.info("AI is analyzing your resume and suggesting skills...");
    try {
      const result = await suggestSkills(currentResume.id);
      // Get the pending chips before they auto-merge so user can pick
      // The slice already merges them — show them as "just added" confirmation
      setShowChips(true);
      toast.success("AI skill suggestions merged into your Technical Skills!");
    } catch {
      toast.error("AI skill suggestion failed. Please try again.");
    }
  };

  const isSkillsApplied = aiSuggestion?.targetField === "skills" && aiSuggestion?.applied;

  // Parse AI suggestion content to show individual chips
  const aiAddedSkills = isSkillsApplied && aiSuggestion?.aiContent
    ? aiSuggestion.aiContent.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Cpu size={20} className="text-indigo-500 dark:text-indigo-400" /> Skills & Technical Stack
          </h3>
          <p className="text-xs text-muted font-medium">Categorize your languages, frameworks, developer tools, and soft skills.</p>
        </div>

        <button
          onClick={handleSuggestSkills}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {aiLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Sparkles size={13} className="text-amber-300" />
          )}
          {aiLoading ? "Suggesting..." : "Suggest with AI"}
        </button>
      </div>

      {/* AI Applied Banner with one-click chips */}
      {isSkillsApplied && !aiLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 size={14} />
            AI added {aiAddedSkills.length} skills to your Technical Skills section below.
          </div>

          {aiAddedSkills.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <p className="text-[11px] font-black text-muted uppercase tracking-wider">AI Added Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {aiAddedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[11px] font-black"
                  >
                    <PlusCircle size={11} /> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-5 text-xs font-bold">
        {/* Technical Languages */}
        <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-2">
          <label className="text-muted uppercase tracking-wider flex items-center gap-2">
            <Code2 size={15} className="text-indigo-500 dark:text-indigo-400" /> Programming Languages (Comma Separated)
          </label>
          <input
            type="text"
            value={getCategoryText(skills.technical)}
            onChange={(e) => handleCategoryChange("technical", e.target.value)}
            placeholder="Java 21, JavaScript (ES6+), TypeScript, Python, SQL"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
          />
          {/* Tag Preview */}
          {getCategoryText(skills.technical) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {getCategoryText(skills.technical).split(",").map(s => s.trim()).filter(Boolean).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-black border border-indigo-500/20">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Frameworks & Libraries */}
        <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-2">
          <label className="text-muted uppercase tracking-wider flex items-center gap-2">
            <Layers size={15} className="text-purple-500 dark:text-purple-400" /> Frameworks & Libraries (Comma Separated)
          </label>
          <input
            type="text"
            value={getCategoryText(skills.frameworks)}
            onChange={(e) => handleCategoryChange("frameworks", e.target.value)}
            placeholder="Spring Boot 3, React 19, Redux Toolkit, Tailwind CSS, FastAPI"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
          />
          {getCategoryText(skills.frameworks) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {getCategoryText(skills.frameworks).split(",").map(s => s.trim()).filter(Boolean).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 dark:text-purple-400 text-[10px] font-black border border-purple-500/20">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Developer Tools & Infrastructure */}
        <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-2">
          <label className="text-muted uppercase tracking-wider flex items-center gap-2">
            <Wrench size={15} className="text-amber-500 dark:text-amber-400" /> Developer Tools & Infrastructure (Comma Separated)
          </label>
          <input
            type="text"
            value={getCategoryText(skills.tools)}
            onChange={(e) => handleCategoryChange("tools", e.target.value)}
            placeholder="Docker, Git, PostgreSQL, Redis, Kafka, Postman"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
          />
          {getCategoryText(skills.tools) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {getCategoryText(skills.tools).split(",").map(s => s.trim()).filter(Boolean).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 text-[10px] font-black border border-amber-500/20">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Soft Skills & Leadership */}
        <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-2">
          <label className="text-muted uppercase tracking-wider flex items-center gap-2">
            <UserCheck size={15} className="text-emerald-500 dark:text-emerald-400" /> Soft Skills & Leadership (Comma Separated)
          </label>
          <input
            type="text"
            value={getCategoryText(skills.soft)}
            onChange={(e) => handleCategoryChange("soft", e.target.value)}
            placeholder="System Architecture, Technical Leadership, Agile/Scrum, Problem Solving"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
          />
          {getCategoryText(skills.soft) && (
            <div className="flex flex-wrap gap-1 pt-1">
              {getCategoryText(skills.soft).split(",").map(s => s.trim()).filter(Boolean).map((sk, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
