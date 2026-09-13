/**
 * src/features/resume-builder/pages/ResumeBuilderMain.jsx
 * Master Container managing view switching between Dashboard, Resume Editor, and Full Preview.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Edit3, Eye, ArrowLeft } from "lucide-react";
import { useResumeBuilder } from "../hooks/useResumeBuilder";
import ResumeDashboard from "../components/Dashboard/ResumeDashboard";
import ResumeEditorPage from "./ResumeEditorPage";
import ResumePreviewContainer from "../components/Preview/ResumePreviewContainer";

export default function ResumeBuilderMain() {
  const { viewMode, setViewMode, currentResume } = useResumeBuilder();

  return (
    <div className="space-y-6 font-satoshi text-body min-h-screen">
      {/* Top Header Mode Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          {viewMode !== "dashboard" && (
            <button
              onClick={() => setViewMode("dashboard")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface-hover border border-border text-xs font-black text-body hover:text-heading hover:bg-surface transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          )}

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-heading font-satoshi">AI Resume Studio</h2>
            {currentResume?.title && viewMode !== "dashboard" && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Editing: {currentResume.title}
              </span>
            )}
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-surface border border-border p-1.5 shadow-sm">
          <button
            onClick={() => setViewMode("dashboard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              viewMode === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-muted hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button
            onClick={() => setViewMode("editor")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              viewMode === "editor"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-muted hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <Edit3 size={14} /> Editor
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              viewMode === "preview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-muted hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>
      </div>

      {/* View Switcher Render */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "dashboard" && <ResumeDashboard />}
          {viewMode === "editor" && <ResumeEditorPage />}
          {viewMode === "preview" && (
            <div className="max-w-4xl mx-auto py-4">
              <ResumePreviewContainer resume={currentResume} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
