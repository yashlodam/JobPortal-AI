/**
 * src/features/mock-interview/components/InterviewTimer.jsx
 * Live countdown timer component with low-time pulse alerts.
 */

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function InterviewTimer({ durationMinutes = 20, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLow = secondsLeft < 300; // less than 5 mins

  return (
    <div
      className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono font-black text-xs transition-all ${
        isLow
          ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          : "bg-white/5 text-slate-200 border-white/10"
      }`}
    >
      {isLow ? <AlertTriangle size={14} className="text-rose-400" /> : <Clock size={14} className="text-indigo-400" />}
      <span>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      <span className="text-[10px] font-satoshi text-slate-400">REMAINING</span>
    </div>
  );
}
