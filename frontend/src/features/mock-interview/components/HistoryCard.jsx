/**
 * src/features/mock-interview/components/HistoryCard.jsx
 * Display past interview session card matching Spring Boot Page<InterviewSessionResponse> DTO:
 * { id, userName, userEmail, interviewTrack, interviewType, difficulty, startedAt, completedAt, status, currentQuestion, totalQuestions, overallScore }
 */

import React from "react";
import { Calendar, Clock, Award, ChevronRight, BarChart2, Trash2 } from "lucide-react";

export default function HistoryCard({ item, onViewReport, onDelete }) {
  if (!item) return null;

  const sessionId = item.id || item.sessionId;
  const userName = item.userName || "Candidate";
  const trackTitle = item.trackTitle || item.interviewTrack || item.trackName || "Technical Interview";
  const difficulty = item.difficulty || "BEGINNER";
  const status = item.status || "IN_PROGRESS";
  const isCompleted = status === "COMPLETED";

  const dateStr = item.startedAt
    ? new Date(item.startedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "Recent";

  const totalQuestions = item.totalQuestions || 5;
  const currentQuestion = item.currentQuestion || 1;
  const rawScore = item.overallScore;

  // Valid finished score ONLY when session status is COMPLETED and overallScore is not null/undefined
  const hasValidScore = isCompleted && rawScore !== null && rawScore !== undefined;
  const numericScore = hasValidScore ? Math.round(Number(rawScore)) : null;

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border hover:border-indigo-500/40 backdrop-blur-2xl shadow-xl transition-all font-satoshi flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-body">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              isCompleted
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
            }`}
          >
            {isCompleted ? "COMPLETED" : `IN PROGRESS (Q${currentQuestion}/${totalQuestions})`}
          </span>

          <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            {difficulty}
          </span>
        </div>

        <h4 className="text-lg font-black text-heading flex items-center gap-2">
          <span>{trackTitle} Track</span>
          {userName && <span className="text-xs text-muted font-normal">({userName})</span>}
        </h4>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" /> {dateStr}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-purple-500 dark:text-purple-400" /> {totalQuestions} Questions Total
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
        <div className="text-right">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest block">Overall Score</span>
          <div className={`text-base sm:text-lg font-black flex items-center justify-end gap-1 ${hasValidScore ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}>
            <Award size={18} />
            <span>{hasValidScore ? `${numericScore}/100` : "In Progress"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(sessionId)}
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-black transition cursor-pointer"
              title="Delete Session"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            onClick={() => onViewReport(item)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <BarChart2 size={14} />
            <span>View Report</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
