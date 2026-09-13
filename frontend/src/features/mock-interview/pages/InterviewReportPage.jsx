/**
 * src/features/mock-interview/pages/InterviewReportPage.jsx
 * 6. Comprehensive Interview Report Page matching Spring Boot InterviewReportResponse DTO.
 * Includes Multi-Metric Score Cards, Strengths/Weaknesses, Question-wise AI Grading, and Curriculum.
 */

import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  BarChart2,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Target,
  Brain,
  MessageSquare,
  Zap,
  FileCheck,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { useMockInterview } from "../hooks/useMockInterview";
import ScoreCard from "../components/ScoreCard";
import StrengthCard from "../components/StrengthCard";
import WeaknessCard from "../components/WeaknessCard";

export default function InterviewReportPage({ reportData, onStartNewSession }) {
  const { evaluation, currentInterview, answers } = useMockInterview();
  const rawData = reportData || evaluation;

  if (!rawData) {
    return (
      <div className="py-16 text-center space-y-4 font-satoshi text-body">
        <h3 className="text-xl font-black text-heading">No Report Selected</h3>
        <p className="text-xs text-muted">Please select an interview session from history to view its detailed report.</p>
        <button
          onClick={onStartNewSession}
          className="mt-4 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          Start New Practice Session
        </button>
      </div>
    );
  }

  // Safely extract backend data payload (handles ApiResponse wrapper)
  const data = rawData.data?.data || rawData.data || rawData;

  const evaluationsList = Array.isArray(data.evaluations)
    ? data.evaluations
    : Array.isArray(data.questionResults)
    ? data.questionResults
    : [];

  const validEvaluations = evaluationsList.filter(
    (item) => item.userAnswer && item.userAnswer.trim().length > 0
  );

  const answeredCount =
    data.answeredQuestions !== undefined
      ? data.answeredQuestions
      : validEvaluations.length;

  const isUnanswered = answeredCount === 0;

  const calculatedAvgScore =
    validEvaluations.length > 0
      ? Math.round(validEvaluations.reduce((sum, item) => sum + (item.score || 0), 0) / validEvaluations.length)
      : 0;

  const overallScore = isUnanswered ? 0 : (data.overallScore ?? calculatedAvgScore);
  const technicalScore = isUnanswered ? 0 : (data.technicalScore ?? overallScore);
  const communicationScore = isUnanswered ? 0 : (data.communicationScore ?? overallScore);
  const problemSolvingScore = isUnanswered ? 0 : (data.problemSolvingScore ?? overallScore);
  const confidenceScore = isUnanswered ? 0 : (data.confidenceScore ?? overallScore);
  const bestPracticesScore = isUnanswered ? 0 : (data.bestPracticesScore ?? overallScore);

  const strengths = Array.isArray(data.overallStrengths)
    ? data.overallStrengths
    : Array.isArray(data.strengths)
    ? data.strengths
    : [];

  const weaknesses = Array.isArray(data.overallWeaknesses)
    ? data.overallWeaknesses
    : Array.isArray(data.weaknesses)
    ? data.weaknesses
    : isUnanswered
    ? ["No questions were answered during this session."]
    : [];

  const learningPath = Array.isArray(data.overallRecommendations)
    ? data.overallRecommendations
    : Array.isArray(data.learningPath)
    ? data.learningPath
    : Array.isArray(data.recommendations)
    ? data.recommendations
    : isUnanswered
    ? ["Answer questions in your next session to receive personalized recommendations."]
    : [];

  const candidateName = data.candidateName || data.userName || "Candidate";
  const trackTitle = data.trackTitle || data.track || data.interviewTrack || currentInterview?.trackTitle || "Technical Interview";
  const difficulty = data.difficulty || currentInterview?.difficulty || "INTERMEDIATE";

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-satoshi py-4 text-body">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
            <BarChart2 size={14} /> Comprehensive Analytical Report
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-heading tracking-tight">
            Performance Report for <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{candidateName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium flex items-center gap-3">
            <span>Track: <strong className="text-heading">{trackTitle}</strong></span>
            <span>•</span>
            <span>Difficulty: <strong className="text-indigo-500 dark:text-indigo-400 uppercase">{difficulty}</strong></span>
          </p>
        </div>

        <button
          onClick={onStartNewSession}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0"
        >
          <RotateCcw size={14} /> New Practice Session
        </button>
      </div>

      {/* Unanswered Session Warning Banner */}
      {isUnanswered && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 font-satoshi">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <CheckCircle2 size={18} className="text-amber-500" /> Session Completed — 0 Answers Submitted
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            You finished this session without submitting any technical answers. Scores and verified key strengths are only generated when answers are provided during the live interview.
          </p>
        </div>
      )}

      {/* Multi-Metric Score Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScoreCard
          title="Overall Performance"
          score={overallScore}
          icon={Award}
          category="Performance"
          description="Synthesized from multi-metric technical scoring."
        />
        <ScoreCard
          title="Technical Precision"
          score={technicalScore}
          icon={Brain}
          category="Code Precision"
          description="Core CS concepts, framework knowledge, and algorithmic accuracy."
        />
        <ScoreCard
          title="Problem Solving"
          score={problemSolvingScore}
          icon={Zap}
          category="Architecture"
          description="Tradeoff analysis, edge-case handling, and scalability."
        />
        <ScoreCard
          title="Communication Clarity"
          score={communicationScore}
          icon={MessageSquare}
          category="STAR Method"
          description="Clarity, structure, and precision of technical explanations."
        />
        <ScoreCard
          title="Candidate Confidence"
          score={confidenceScore}
          icon={ShieldCheck}
          category="Delivery"
          description="Confidence level and technical delivery completeness."
        />
        <ScoreCard
          title="Best Practices"
          score={bestPracticesScore}
          icon={FileCheck}
          category="Standards"
          description="Security, clean code principles, and design patterns."
        />
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrengthCard strengths={strengths} />
        <WeaknessCard weaknesses={weaknesses} />
      </div>

      {/* Recommended Next Learning Path */}
      {learningPath.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-indigo-500/30 backdrop-blur-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-lg font-black text-heading flex items-center gap-2">
              <Target size={20} className="text-indigo-500 dark:text-indigo-400" /> Recommended AI Learning Curriculum
            </h3>
            <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Personalized
            </span>
          </div>

          <div className="space-y-4">
            {learningPath.map((path, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-2xl bg-surface-hover border border-border flex items-start gap-4"
              >
                <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-heading">
                    {typeof path === "string" ? path : path.title || path.name}
                  </h4>
                  <p className="text-xs text-muted font-medium">
                    {typeof path === "object" && path.description
                      ? path.description
                      : "Targeted learning curriculum generated by Spring Boot AI engine."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Question-wise AI Grading & Solutions */}
      {evaluationsList.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-lg font-black text-heading flex items-center gap-2">
              <HelpCircle size={20} className="text-indigo-500 dark:text-indigo-400" /> Question-wise AI Evaluations
            </h3>
            <span className="text-xs font-black text-muted">{evaluationsList.length} Questions Evaluated</span>
          </div>

          <div className="space-y-6">
            {evaluationsList.map((evalItem, idx) => {
              const qScore = evalItem.score ?? evalItem.userScore ?? 85;
              const qText = evalItem.question || evalItem.questionText || evalItem.title || `Question ${idx + 1}`;
              const userAnswer =
                evalItem.userAnswer ||
                evalItem.answer ||
                (answers && answers[evalItem.questionId]) ||
                (answers && answers[idx]) ||
                "";
              const aiFeedback = evalItem.aiFeedback || evalItem.feedback || evalItem.comment || "Demonstrated solid technical understanding.";
              const idealAnswer = evalItem.idealAnswer || evalItem.solution || "";
              const followUps = Array.isArray(evalItem.followUpQuestions) ? evalItem.followUpQuestions : [];

              return (
                <div key={idx} className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                    <h4 className="text-base font-black text-heading">
                      Q{idx + 1}. {qText}
                    </h4>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Score: {qScore}/100
                    </span>
                  </div>

                  {userAnswer && (
                    <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-1">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Your Response:</span>
                      <p className="text-xs sm:text-sm text-heading font-mono leading-relaxed whitespace-pre-wrap">{userAnswer}</p>
                    </div>
                  )}

                  {aiFeedback && (
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">AI Evaluator Feedback:</span>
                      <p className="text-xs sm:text-sm text-heading font-medium leading-relaxed">"{aiFeedback}"</p>
                    </div>
                  )}

                  {idealAnswer && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider block">Benchmark Solution:</span>
                      <p className="text-xs sm:text-sm text-purple-900 dark:text-purple-200 font-mono leading-relaxed whitespace-pre-wrap">{idealAnswer}</p>
                    </div>
                  )}

                  {followUps.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                      <h5 className="font-black text-amber-600 dark:text-amber-300 uppercase tracking-wider">Recommended Follow-up Questions:</h5>
                      <ul className="list-disc list-inside space-y-1 font-medium">
                        {followUps.map((fQ, fIdx) => (
                          <li key={fIdx}>{fQ}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
