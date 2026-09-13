/**
 * src/components/ui/AIErrorBanner.jsx
 * Enterprise Candidate-Facing AI Error Alert (LinkedIn / OpenAI Style).
 * Clean, reassuring UX without exposing internal backend configuration, API keys, or technical jargon.
 */

import React from "react";
import { Sparkles, RefreshCw, Clock, ArrowRight } from "lucide-react";

export default function AIErrorBanner({
  message,
  onRetry,
  title = "AI Engine Temporarily Busy",
}) {
  // Translate raw backend errors into reassuring, professional user copy
  const getUserFriendlyMessage = () => {
    if (!message) return "Our AI engine is currently processing high demand. Please try again in a few moments.";
    if (message.toLowerCase().includes("gemini") || message.toLowerCase().includes("api key") || message.toLowerCase().includes("unavailable")) {
      return "Our AI analysis service is undergoing brief maintenance or experiencing high traffic. Please wait a moment and try again.";
    }
    if (message.toLowerCase().includes("limit") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate")) {
      return "Daily AI processing limit reached for this session. Please try again shortly.";
    }
    return "We couldn't complete the AI analysis right now. Please try again in a few moments.";
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-primary/30 backdrop-blur-2xl shadow-sm space-y-4 font-satoshi my-4 text-body">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm shrink-0">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-heading">{title}</h3>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase">
                High Demand
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-0.5 leading-relaxed max-w-lg">
              {getUserFriendlyMessage()}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl gradient-bg-signature text-white font-black text-xs transition cursor-pointer shadow-button hover:opacity-90 hover:scale-105 shrink-0"
          >
            <RefreshCw size={14} /> Try Again Now
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted font-medium pt-1 border-t border-border">
        <Clock size={14} className="text-primary" />
        <span>Average wait time: under 30 seconds</span>
      </div>
    </div>
  );
}
