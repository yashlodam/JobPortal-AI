/**
 * src/features/resume-analyzer/pages/ResumeAnalyzerMain.jsx
 * Parent main entry point managing user flow between Upload and AI Analysis Dashboard views.
 * Fetches latest analysis ONLY ONCE on mount to prevent infinite view-switch refresh loops.
 */

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, BarChart3, Sparkles } from "lucide-react";
import { useResumeAnalyzer } from "../hooks/useResumeAnalyzer";
import { fetchLatestAnalysisThunk, resetAnalysisState } from "../slices/analysisSlice";
import ResumeUploadPage from "./ResumeUploadPage";
import ResumeAnalysisDashboard from "./ResumeAnalysisDashboard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import AIErrorBanner from "../../../components/ui/AIErrorBanner";

export default function ResumeAnalyzerMain() {
  const dispatch = useDispatch();
  const { status, currentResume, analysis, error } = useResumeAnalyzer();

  // Mode: "dashboard" (if valid analysis exists) or "upload"
  const [viewMode, setViewMode] = useState(analysis ? "dashboard" : "upload");

  // Track initial mount fetch to prevent infinite refresh loops when user resets state
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current && !analysis && status === "idle") {
      initialFetchDone.current = true;
      dispatch(fetchLatestAnalysisThunk(currentResume?.id));
    }
  }, [dispatch, analysis, status, currentResume]);

  // Sync viewMode whenever analysis is successfully loaded on mount/analyze
  useEffect(() => {
    if (analysis && status === "success") {
      setViewMode("dashboard");
    }
  }, [analysis, status]);

  const handleUploadNavClick = () => {
    dispatch(resetAnalysisState());
    setViewMode("upload");
  };

  const handleDashboardNavClick = () => {
    setViewMode("dashboard");
  };

  if (status === "analyzing" && viewMode === "dashboard") {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 font-satoshi text-body">
      {/* Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-heading">AI Resume Analyzer</h2>
            <p className="text-xs text-muted font-medium">ATS Document Compliance, Skill Extraction & Analysis Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-surface-elevated border border-border p-1.5 font-satoshi">
          <button
            onClick={handleUploadNavClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              viewMode === "upload"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-muted hover:text-heading"
            }`}
          >
            <Upload size={14} /> Upload Resume
          </button>
          <button
            onClick={handleDashboardNavClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              viewMode === "dashboard"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-muted hover:text-heading"
            }`}
          >
            <BarChart3 size={14} /> Analysis Dashboard
          </button>
        </div>
      </div>

      {error && (
        <AIErrorBanner
          message={error}
          onRetry={() => {
            if (currentResume?.id) {
              dispatch(fetchLatestAnalysisThunk(currentResume.id));
            } else {
              handleUploadNavClick();
            }
          }}
        />
      )}

      {/* View Switcher Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "upload" ? (
            <ResumeUploadPage onAnalyzeSuccess={() => setViewMode("dashboard")} />
          ) : (
            <ResumeAnalysisDashboard onReUploadClick={handleUploadNavClick} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
