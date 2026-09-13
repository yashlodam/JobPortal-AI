/**
 * src/features/mock-interview/pages/LiveInterviewPage.jsx
 * 3. Live Interview Room with Toast Notification alerts for answer submissions, Next Question triggers, and AI evaluations.
 */

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useMockInterview } from "../hooks/useMockInterview";
import { useToast } from "../../../components/ui/ToastNotification";
import QuestionCard from "../components/QuestionCard";
import AnswerEditor from "../components/AnswerEditor";
import ProgressBar from "../components/ProgressBar";
import InterviewTimer from "../components/InterviewTimer";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function LiveInterviewPage({ onEvaluateComplete }) {
  const {
    sessionId,
    currentInterview,
    questions,
    answers,
    currentQuestionIndex,
    loading,
    recordAnswer,
    goNext,
    goPrev,
    jumpTo,
    getNextQuestion,
    evaluateInterview,
  } = useMockInterview();

  const toast = useToast();

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      goNext();
    } else if (sessionId) {
      try {
        toast.info("Generating next AI question...", 2500);
        await getNextQuestion(sessionId).unwrap();
        toast.success("Next AI question loaded!");
        goNext();
      } catch (err) {
        toast.error(typeof err === "string" ? err : err?.message || "Failed to fetch next question.");
      }
    }
  };

  const handleEvaluateSubmit = async () => {
    const hasAnyAnswer = Object.values(answers || {}).some(a => a?.trim().length > 0);
    if (!hasAnyAnswer) {
      toast.error("Please provide at least one answer before evaluating.");
      return;
    }

    try {
      toast.info("AI Neural Evaluator is scoring your answers...", 4000);
      await evaluateInterview().unwrap();
      toast.success("Evaluation completed! Displaying report...");
      if (onEvaluateComplete) onEvaluateComplete();
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to evaluate interview answers.");
    }
  };

  if (loading === "evaluating") {
    return <LoadingSkeleton text="AI Neural Evaluator is Scoring Answers & Generating Analysis..." />;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 font-satoshi text-body">
        <h3 className="text-xl font-black text-heading">No Active Interview Questions Found</h3>
        <p className="text-xs text-muted">Please setup your interview parameters first.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionId = currentQuestion?.id || currentQuestionIndex;
  const currentAnswer = answers[questionId] || "";
  const totalQuestions = currentQuestion?.totalQuestions || questions.length;
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  const handleAnswerChange = (val) => {
    recordAnswer(questionId, val);
  };

  return (
    <div className="space-y-6 font-satoshi text-body py-2">
      {/* Live Room Top Control Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Live Session
            </span>
            <span className="text-xs font-bold text-muted">• {currentInterview.trackTitle}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-heading">AI Live Technical Interview Room</h2>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Progress Bar Container */}
          <div className="w-48 hidden sm:block">
            <ProgressBar current={currentQuestionIndex} total={totalQuestions} />
          </div>

          {/* Countdown Timer */}
          <InterviewTimer
            durationMinutes={currentInterview.durationMinutes || 20}
            onTimeUp={handleEvaluateSubmit}
          />
        </div>
      </div>

      {/* Main Room Layout: Left Question & Editor | Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Question & Answer Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Question Display Card */}
          <QuestionCard
            question={currentQuestion}
            currentNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />

          {/* Answer Response Editor */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Your Response & Code Implementation</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[11px]">Markdown & Code Blocks Supported</span>
            </label>

            <AnswerEditor
              value={currentAnswer}
              onChange={handleAnswerChange}
              placeholder={`Write your technical explanation, architectural approach, and code snippet for Question ${currentQuestionIndex + 1}...`}
            />
          </div>

          {/* Bottom Control Bar: Prev, Next, Skip, Save Draft, Evaluate */}
          <div className="p-4 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2.5 rounded-2xl bg-surface-hover border border-border hover:bg-surface-elevated text-body hover:text-heading text-xs font-black transition cursor-pointer disabled:opacity-30 flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentQuestionIndex >= (currentInterview?.questionCount || 5) - 1}
                className="px-4 py-2.5 rounded-2xl bg-surface-hover border border-border hover:bg-surface-elevated text-body hover:text-heading text-xs font-black transition cursor-pointer disabled:opacity-30 flex items-center gap-1.5"
              >
                Next <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={isLastQuestion}
                className="px-4 py-2.5 rounded-2xl bg-surface-hover hover:bg-surface-elevated border border-border text-muted hover:text-heading text-xs font-bold transition cursor-pointer hidden sm:flex items-center gap-1.5"
              >
                <SkipForward size={14} /> Skip
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleEvaluateSubmit}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition cursor-pointer flex items-center gap-2 hover:scale-105"
              >
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span>Evaluate Answer & Finish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6 font-satoshi">
          {/* Interview Overview Card */}
          <div className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-heading pb-3 border-b border-border flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-500 dark:text-indigo-400" /> Track Details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted font-medium">Track</span>
                <span className="font-bold text-heading line-clamp-1">{currentInterview.trackTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted font-medium">Difficulty</span>
                <span className="font-bold text-indigo-500 dark:text-indigo-400 capitalize">{currentInterview.difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted font-medium">Format</span>
                <span className="font-bold text-purple-500 dark:text-purple-400 capitalize">{currentInterview.interviewType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted font-medium">Questions</span>
                <span className="font-bold text-heading">{totalQuestions} Total</span>
              </div>
            </div>
          </div>

          {/* Question List Navigator Sidebar */}
          <div className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-heading pb-3 border-b border-border flex items-center justify-between">
              <span>Question List</span>
              <span className="text-xs text-muted font-normal">{currentQuestionIndex + 1}/{totalQuestions}</span>
            </h4>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const qId = q?.id || idx;
                const isAnswered = Boolean(answers[qId]?.trim());
                const textSnippet = q?.question || q?.title || q?.questionTitle || `Question ${idx + 1}`;

                return (
                  <button
                    key={qId}
                    onClick={() => jumpTo(idx)}
                    className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      isCurrent
                        ? "bg-indigo-500/15 border-indigo-500 text-heading font-black"
                        : isAnswered
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold"
                        : "bg-surface-hover border-border text-muted hover:text-heading"
                    }`}
                  >
                    <span className="line-clamp-1">
                      {idx + 1}. {textSnippet}
                    </span>
                    {isAnswered && <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
