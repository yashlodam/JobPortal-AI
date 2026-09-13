/**
 * src/features/resume-analyzer/components/ResumeRewriteModal.jsx
 * Interactive AI Resume Rewrite Modal offering summary, project, experience, cover letter & LinkedIn generation options.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, FileText, Send, Zap, RefreshCw } from "lucide-react";
import { useResumeAnalyzer } from "../hooks/useResumeAnalyzer";

export default function ResumeRewriteModal() {
  const {
    rewriteModalOpen,
    activeRewriteType,
    rewriteResult,
    isGeneratingRewrite,
    hideRewriteModal,
    generateRewrite,
  } = useResumeAnalyzer();

  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState(activeRewriteType || "summary");

  if (!rewriteModalOpen) return null;

  const rewriteTypes = [
    { id: "summary", label: "Improve Summary", icon: FileText, desc: "Craft an executive, quantified summary." },
    { id: "experience", label: "Improve Experience", icon: Zap, desc: "Generate STAR method quantified impact bullets." },
    { id: "cover_letter", label: "Generate Cover Letter", icon: Send, desc: "Create a job-targeted cover letter." },
    { id: "linkedin_summary", label: "Generate LinkedIn Summary", icon: Sparkles, desc: "Draft an engaging LinkedIn About section." },
  ];

  const handleGenerate = (type) => {
    setSelectedType(type);
    generateRewrite(type);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-2xl font-satoshi relative overflow-hidden text-body"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-heading">AI Content Optimization Assistant</h3>
                <p className="text-xs text-muted font-medium">Generate ATS-optimized text, cover letters, & executive summaries.</p>
              </div>
            </div>

            <button onClick={hideRewriteModal} className="p-2 rounded-2xl hover:bg-surface-hover text-muted hover:text-heading transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Type Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {rewriteTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleGenerate(item.id)}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-primary/15 border-primary text-primary font-bold shadow-sm"
                      : "bg-surface-elevated border-border text-muted hover:bg-surface-hover hover:text-heading"
                  }`}
                >
                  <Icon size={16} className={isSelected ? "text-primary" : "text-muted"} />
                  <p className="text-xs font-black line-clamp-1">{item.label}</p>
                </button>
              );
            })}
          </div>

          {/* Generated Result Output */}
          <div className="p-5 rounded-3xl bg-surface-elevated border border-border min-h-[220px] flex flex-col justify-between space-y-4 shadow-inner">
            {isGeneratingRewrite ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <RefreshCw size={28} className="text-primary animate-spin" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest">AI Neural Model Drafting Response...</p>
              </div>
            ) : rewriteResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-primary uppercase tracking-wider">{rewriteResult.title}</span>
                  <button
                    onClick={() => handleCopy(rewriteResult.content || rewriteResult.bullets?.join("\n"))}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-extrabold text-heading transition cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
                  </button>
                </div>

                {rewriteResult.content && (
                  <p className="text-xs sm:text-sm text-body leading-relaxed font-medium whitespace-pre-line p-4 rounded-2xl bg-surface border border-border">
                    {rewriteResult.content}
                  </p>
                )}

                {rewriteResult.bullets && (
                  <ul className="space-y-2 text-xs sm:text-sm text-body font-medium">
                    {rewriteResult.bullets.map((b, i) => (
                      <li key={i} className="p-3 rounded-2xl bg-surface border border-border flex items-start gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <Sparkles size={32} className="text-primary mx-auto opacity-40" />
                <p className="text-xs text-muted font-medium">Click any option above to trigger instant AI text optimization.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={hideRewriteModal} className="text-xs font-bold text-muted hover:text-heading transition cursor-pointer">
              Close Studio
            </button>
            <button
              onClick={() => handleGenerate(selectedType)}
              disabled={isGeneratingRewrite}
              className="flex items-center gap-2 rounded-2xl gradient-bg-signature px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-button hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isGeneratingRewrite ? "animate-spin" : ""} />
              <span>Regenerate AI Variant</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
