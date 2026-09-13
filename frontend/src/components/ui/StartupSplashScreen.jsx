import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useDispatch } from "react-redux";
import { forceAuthRestored } from "../../State/AuthSlic";

const LOADING_STEPS = [
  "Connecting to secure gateway…",
  "Verifying session credentials…",
  "Loading intelligent job matching engine…",
  "Preparing your workspace…",
];

export default function StartupSplashScreen() {
  const dispatch = useDispatch();
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    // Increment progress smoothly
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const jump = Math.floor(Math.random() * 15) + 10;
        return Math.min(prev + jump, 92);
      });
    }, 320);

    // Step ticker
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 700);

    // Show manual bypass button if cloud backend takes > 1.8s (e.g. cold start)
    const bypassTimer = setTimeout(() => {
      setShowBypass(true);
    }, 1800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      clearTimeout(bypassTimer);
    };
  }, []);

  const handleEnterApp = () => {
    dispatch(forceAuthRestored());
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 select-none overflow-hidden"
      style={{
        backgroundColor: "#070B14",
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15), transparent 65%),
          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.10), transparent 50%),
          radial-gradient(circle at 20% 70%, rgba(6, 182, 212, 0.08), transparent 50%)
        `,
      }}
    >
      {/* Ambient background mesh glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-[#0C1222]/85 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center text-center transition-all">
        
        {/* Glowing Logo Pedestal */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Animated pulsing outer halo */}
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-indigo-500/25 via-purple-500/25 to-pink-500/25 blur-lg animate-pulse" />
          
          {/* Rotating ambient border */}
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-[1.5px] shadow-xl">
            <div className="h-full w-full rounded-[14px] bg-[#0A0F1E] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white drop-shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
              >
                <path
                  d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z"
                  fill="url(#logo_grad)"
                  fillOpacity="0.85"
                />
                <defs>
                  <linearGradient id="logo_grad" x1="5" y1="5" x2="11" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Headline */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-satoshi">
              JobPortal
            </h1>
            <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 px-2 py-0.5 text-[11px] font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 shadow-xs">
              <Sparkles size={10} className="text-indigo-400" /> AI
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 tracking-wide font-inter">
            Intelligent Recruitment & ATS Engine
          </p>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full space-y-2.5 mb-5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Status Ticker */}
          <div className="h-5 flex items-center justify-center overflow-hidden">
            <p className="text-[11px] font-medium text-slate-400 animate-fade-in truncate">
              {LOADING_STEPS[stepIndex]}
            </p>
          </div>
        </div>

        {/* Live Security & Telemetry Footer */}
        <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck size={12} className="text-emerald-400" />
            TLS 1.3 Secure
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Zap size={11} className="text-amber-400" />
            Fast Gateway
          </span>
        </div>

        {/* Manual Bypass Button (appears if network or backend takes longer) */}
        {showBypass && (
          <div className="mt-5 pt-3 w-full animate-fade-in">
            <button
              type="button"
              onClick={handleEnterApp}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight size={13} />
            </button>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Cloud service waking up. You can browse freely.
            </p>
          </div>
        )}
      </div>

      {/* Version Tag */}
      <div className="relative z-10 mt-6 text-center">
        <span className="text-[10px] font-medium text-slate-600 font-mono">
          JobPortal AI • v2.0 Production Release
        </span>
      </div>
    </div>
  );
}
