/**
 * src/features/mock-interview/components/InterviewSetupForm.jsx
 * Interactive setup form configuring track, difficulty, type, question count, and duration.
 */

import React, { useState } from "react";
import TrackSelector from "./TrackSelector";
import DifficultySelector from "./DifficultySelector";
import { INTERVIEW_TYPES, INTERVIEW_TRACKS } from "../constants/interviewData";
import { Sparkles, Clock, HelpCircle, ArrowRight } from "lucide-react";

export default function InterviewSetupForm({ initialConfig, onSubmit, isLoading = false }) {
  const [trackId, setTrackId] = useState(initialConfig.trackId || "java-fullstack");
  const [difficulty, setDifficulty] = useState(
    initialConfig.difficulty ? String(initialConfig.difficulty).toUpperCase() : "INTERMEDIATE"
  );
  const [interviewType, setInterviewType] = useState(
    initialConfig.interviewType ? String(initialConfig.interviewType).toUpperCase() : "TECHNICAL"
  );
  const [questionCount, setQuestionCount] = useState(initialConfig.questionCount || 3);
  const [durationMinutes, setDurationMinutes] = useState(initialConfig.durationMinutes || 20);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trackObj = INTERVIEW_TRACKS.find((t) => t.id === trackId) || INTERVIEW_TRACKS[0];
    onSubmit({
      trackId,
      trackTitle: trackObj.title,
      difficulty,
      interviewType,
      questionCount: Number(questionCount),
      durationMinutes: Number(durationMinutes),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-satoshi text-body">
      {/* 1. Track Selector */}
      <div className="space-y-3">
        <label className="text-sm font-black text-heading uppercase tracking-wider flex items-center gap-2">
          <span>1. Select Interview Track</span>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold lowercase">(required)</span>
        </label>
        <TrackSelector selectedTrackId={trackId} onSelectTrack={setTrackId} />
      </div>

      {/* 2. Difficulty Selector */}
      <div className="space-y-3">
        <label className="text-sm font-black text-heading uppercase tracking-wider flex items-center gap-2">
          <span>2. Choose Experience Level & Difficulty</span>
        </label>
        <DifficultySelector selectedDifficulty={difficulty} onSelectDifficulty={setDifficulty} />
      </div>

      {/* 3. Interview Type & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Interview Type */}
        <div className="space-y-3 md:col-span-1">
          <label className="text-xs font-black uppercase tracking-wider text-muted">Interview Type</label>
          <div className="space-y-2">
            {INTERVIEW_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setInterviewType(t.id)}
                className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer ${
                  interviewType === t.id
                    ? "bg-indigo-500/15 border-indigo-500 text-heading font-bold shadow-sm"
                    : "bg-surface-hover border-border text-muted hover:text-heading hover:bg-surface-elevated"
                }`}
              >
                <div className="text-xs font-bold text-heading">{t.label}</div>
                <div className="text-[10px] text-muted font-medium line-clamp-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
            <HelpCircle size={14} className="text-indigo-500 dark:text-indigo-400" /> Number of Questions
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 8].map((count) => (
              <button
                type="button"
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`p-3 rounded-2xl border text-center font-black text-sm transition cursor-pointer ${
                  questionCount === count
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                    : "bg-surface-hover border-border text-muted hover:text-heading hover:bg-surface-elevated"
                }`}
              >
                {count} Qs
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted font-medium">
            Recommended: 3 to 5 questions for optimal session feedback.
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Clock size={14} className="text-indigo-500 dark:text-indigo-400" /> Total Duration (Mins)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 20, 30].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`p-3 rounded-2xl border text-center font-black text-sm transition cursor-pointer ${
                  durationMinutes === mins
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                    : "bg-surface-hover border-border text-muted hover:text-heading hover:bg-surface-elevated"
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted font-medium">
            Enforces live timer during technical response submissions.
          </p>
        </div>
      </div>

      {/* Generate AI Questions Submit Button */}
      <div className="pt-6 text-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[320px] px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/25 hover:scale-[1.02] transition cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-3"
        >
          <Sparkles size={20} className="text-amber-300 animate-pulse" />
          <span>{isLoading ? "Generating AI Questions..." : "Generate AI Questions & Start"}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
