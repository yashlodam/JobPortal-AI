/**
 * src/features/mock-interview/components/QuestionCard.jsx
 * Display AI generated question matching Spring Boot QuestionResponse DTO:
 * { id, difficulty, orderNumber, question, sessionId, totalQuestions }
 */

import React, { useState } from "react";
import { Tag, Lightbulb, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function QuestionCard({ question, currentNumber, totalQuestions }) {
  const [showHints, setShowHints] = useState(false);

  if (!question) return null;

  // Safely normalize Spring Boot QuestionResponse DTO
  const q = question.data || question;

  // Question text content from Spring Boot 'question' field
  const questionText =
    q.question ||
    q.questionText ||
    q.text ||
    q.content ||
    q.description ||
    (typeof q === "string" ? q : "");

  const title =
    q.title ||
    q.questionTitle ||
    q.topic ||
    `Technical Question #${q.orderNumber || currentNumber}`;

  const currentNum = q.orderNumber || currentNumber;
  const totalNum = q.totalQuestions || totalQuestions;
  const topic = q.topic || q.category || "Software Engineering Architecture";
  const difficulty = q.difficulty || "INTERMEDIATE";
  const hints = Array.isArray(q.hints) ? q.hints : [];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl space-y-6 font-satoshi">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 font-black text-white text-xs shadow-md shadow-indigo-500/20">
            {currentNum}
          </span>
          <span className="text-xs font-black text-body uppercase tracking-wider">
            Question {currentNum} of {totalNum}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
            <Tag size={12} /> {topic}
          </span>
          <span className="text-[10px] font-black text-purple-500 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 uppercase">
            {difficulty}
          </span>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-300 leading-snug flex items-center gap-2">
          <HelpCircle size={20} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>{title}</span>
        </h3>
        <p className="text-base sm:text-lg text-heading font-extrabold leading-relaxed p-4 rounded-2xl bg-surface-hover border border-border shadow-inner">
          {questionText}
        </p>
      </div>

      {/* AI Hints Toggle */}
      {hints.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-xs font-black text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition cursor-pointer"
          >
            <Lightbulb size={16} />
            <span>{showHints ? "Hide AI Hints" : "Need AI Hints?"}</span>
            {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHints && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <h5 className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">Guiding Concepts:</h5>
              <ul className="list-disc list-inside space-y-1 font-medium">
                {hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
