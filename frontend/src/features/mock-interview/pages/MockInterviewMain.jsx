/**
 * src/features/mock-interview/pages/MockInterviewMain.jsx
 * Master parent entry point managing tab switching between Landing, Setup, Live, Evaluation, History, & Report views.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sliders, Play, Award, History, BarChart2, Sparkles } from "lucide-react";
import { useMockInterview } from "../hooks/useMockInterview";
import MockInterviewLandingPage from "./MockInterviewLandingPage";
import InterviewSetupPage from "./InterviewSetupPage";
import LiveInterviewPage from "./LiveInterviewPage";
import AIEvaluationPage from "./AIEvaluationPage";
import InterviewHistoryPage from "./InterviewHistoryPage";
import InterviewReportPage from "./InterviewReportPage";

export default function MockInterviewMain() {
  const { activeTab, setTab, questions, evaluation } = useMockInterview();
  const [selectedReport, setSelectedReport] = useState(null);

  const navItems = [
    { id: "landing", label: "Overview", icon: Bot },
    { id: "setup", label: "Interview Setup", icon: Sliders },
    { id: "live", label: "Live Session", icon: Play, disabled: questions.length === 0 },
    { id: "evaluation", label: "AI Evaluation", icon: Award, disabled: !evaluation },
    { id: "history", label: "History", icon: History },
    { id: "report", label: "Report", icon: BarChart2, disabled: !evaluation && !selectedReport },
  ];

  return (
    <div className="space-y-6 font-satoshi text-body min-h-screen">
      {/* Module Top Navigation Switcher Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-heading flex items-center gap-2">
              <span>AI Mock Interview Studio</span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                PRO ENGINE
              </span>
            </h2>
            <p className="text-xs text-muted font-medium">Real-Time Technical Interview Simulator & Neural Evaluator</p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-surface-hover border border-border p-1.5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && setTab(item.id)}
                disabled={item.disabled}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-muted hover:text-heading hover:bg-surface-elevated"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "landing" && (
            <MockInterviewLandingPage
              onStartClick={() => setTab("setup")}
              onTrackSelect={() => setTab("setup")}
            />
          )}

          {activeTab === "setup" && (
            <InterviewSetupPage
              onGenerateQuestions={() => setTab("live")}
            />
          )}

          {activeTab === "live" && (
            <LiveInterviewPage
              onEvaluateComplete={() => setTab("evaluation")}
            />
          )}

          {activeTab === "evaluation" && (
            <AIEvaluationPage
              onRestartClick={() => setTab("setup")}
              onViewFullReportClick={() => setTab("report")}
            />
          )}

          {activeTab === "history" && (
            <InterviewHistoryPage
              onStartNewSession={() => setTab("setup")}
              onViewReportClick={(histItem) => {
                setSelectedReport(histItem);
                setTab("report");
              }}
            />
          )}

          {activeTab === "report" && (
            <InterviewReportPage
              reportData={evaluation || selectedReport}
              onStartNewSession={() => setTab("setup")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
