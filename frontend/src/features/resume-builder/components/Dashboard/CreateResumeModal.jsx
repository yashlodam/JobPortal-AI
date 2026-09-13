/**
 * src/features/resume-builder/components/Dashboard/CreateResumeModal.jsx
 * Modal allowing candidates to enter a resume title and select from 6 ATS templates.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import TemplateSelector from "../Templates/TemplateSelector";

export default function CreateResumeModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("professional");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      title: title.trim() || "Senior Full Stack Resume",
      templateId: selectedTemplateId,
    });
    setTitle("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md font-satoshi text-body">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-surface-hover hover:bg-surface-elevated text-muted hover:text-heading transition cursor-pointer border border-border"
          >
            <X size={18} />
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
              <Sparkles size={14} /> AI Resume Studio Configurator
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">Create New Resume</h2>
            <p className="text-xs sm:text-sm text-muted font-medium">
              Enter your target resume title and pick an ATS-friendly layout template to launch the editor.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted block">
                Resume Title / Job Target <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer - Google"
                required
                className="w-full px-4 py-3 rounded-2xl bg-surface-hover border border-border text-heading placeholder:text-muted/60 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
              />
            </div>

            {/* Template Selector Grid */}
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={setSelectedTemplateId}
            />

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-surface-hover hover:bg-surface-elevated border border-border text-xs font-bold text-body transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-indigo-500/20 hover:scale-105 transition cursor-pointer"
              >
                <span>Launch Builder</span> <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
