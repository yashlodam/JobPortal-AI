/**
 * src/features/resume-builder/components/AI/AISuggestionModal.jsx
 * Side-by-Side Diff Modal for AI suggestions that have NOT been auto-applied.
 * Auto-applied suggestions (summary, experience, projects, skills) bypass this modal.
 * This modal only shows for edge-case suggestions the user should review manually.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, RotateCcw } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";

export default function AISuggestionModal() {
  const {
    aiSuggestion,
    clearAISuggestion,
    applyAISuggestion,
    generateAiSummary,
    currentResume,
  } = useResumeBuilder();

  // Do NOT show this modal if the suggestion was already auto-applied inline
  if (!aiSuggestion || aiSuggestion.applied) return null;

  const { targetField, originalContent, aiContent } = aiSuggestion;

  const handleApply = () => {
    applyAISuggestion();
  };

  const handleTryAgain = () => {
    clearAISuggestion();
    if (targetField === "summary") {
      generateAiSummary(currentResume?.id);
    }
  };

  const fieldLabel = targetField
    ? targetField.charAt(0).toUpperCase() + targetField.slice(1)
    : "Content";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md font-satoshi text-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-3xl rounded-3xl bg-surface border border-indigo-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={clearAISuggestion}
            className="absolute top-6 right-6 p-2 rounded-xl bg-surface-hover hover:bg-surface-elevated text-muted hover:text-heading transition cursor-pointer border border-border"
          >
            <X size={18} />
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles size={14} className="text-amber-500 dark:text-amber-300 animate-pulse" /> AI Content Polish — {fieldLabel}
            </div>
            <h3 className="text-2xl font-black text-heading tracking-tight">Review AI Enhancement</h3>
            <p className="text-xs text-muted font-medium">
              Compare your original draft with the AI-optimized suggestion before applying changes to your resume.
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Original Draft */}
            <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-2">
              <span className="font-black text-muted uppercase tracking-wider block">Original Text</span>
              <p className="text-body font-mono leading-relaxed font-medium min-h-[100px] whitespace-pre-wrap">
                {originalContent || "No original content provided."}
              </p>
            </div>

            {/* AI Suggestion */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2">
              <span className="font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500 dark:text-amber-400" /> AI Optimized Suggestion
              </span>
              <p className="text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed min-h-[100px] whitespace-pre-wrap">
                {aiContent || "No suggestion generated."}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
            <button
              onClick={handleTryAgain}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-hover hover:bg-surface-elevated border border-border text-xs font-bold text-body hover:text-heading transition cursor-pointer"
            >
              <RotateCcw size={14} /> Try Again
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={clearAISuggestion}
                className="px-5 py-2.5 rounded-2xl bg-surface-hover hover:bg-surface-elevated border border-border text-xs font-bold text-body hover:text-heading transition cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Check size={14} /> Use Suggestion
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
