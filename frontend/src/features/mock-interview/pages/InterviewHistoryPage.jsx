/**
 * src/features/mock-interview/pages/InterviewHistoryPage.jsx
 * 5. Interview History Page with Toast Notifications and API report loading.
 */

import React, { useEffect } from "react";
import { History, Plus } from "lucide-react";
import { useMockInterview } from "../hooks/useMockInterview";
import { useToast } from "../../../components/ui/ToastNotification";
import HistoryCard from "../components/HistoryCard";
import EmptyState from "../components/EmptyState";

export default function InterviewHistoryPage({ onStartNewSession, onViewReportClick }) {
  const { history, loadHistory, loadReport, removeSession, setTab } = useMockInterview();
  const toast = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const handleViewReport = async (item) => {
    const sId = item.id || item.sessionId;
    if (sId) {
      try {
        toast.info("Fetching interview report from AI Engine...", 2500);
        const reportData = await loadReport(sId).unwrap();
        toast.success("Interview report loaded successfully!");
        if (onViewReportClick) onViewReportClick(reportData || item);
        setTab("report");
      } catch (err) {
        toast.error(typeof err === "string" ? err : err?.message || "Failed to load interview report from backend.");
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await removeSession(sessionId).unwrap();
      toast.success("Interview session deleted successfully.");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to delete interview session.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-satoshi py-4 text-body">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
            <History size={14} /> Practice Record Archive
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-heading tracking-tight">
            Interview <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">History & Archives</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium max-w-xl">
            Review past mock interview evaluations, performance progression charts, and detailed question breakdowns.
          </p>
        </div>

        <button
          onClick={onStartNewSession}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0"
        >
          <Plus size={16} /> Start New Session
        </button>
      </div>

      {/* History Cards List */}
      <div className="space-y-4">
        {!history || history.length === 0 ? (
          <EmptyState
            title="No Interview History Found"
            message="Launch your first AI mock interview session to start building your practice archive."
            onAction={onStartNewSession}
          />
        ) : (
          history.map((item) => (
            <HistoryCard
              key={item.id || item.sessionId}
              item={item}
              onViewReport={() => handleViewReport(item)}
              onDelete={handleDeleteSession}
            />
          ))
        )}
      </div>
    </div>
  );
}
