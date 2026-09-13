/**
 * src/features/resume-analyzer/components/LoadingAnalyzer.jsx
 * Professional AI Analyzing loading screen with dynamic step animations.
 * Fixed React state update side-effect lifecycle warning.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, Sparkles, FileText, Search, ShieldCheck } from "lucide-react";

export default function LoadingAnalyzer({ onComplete }) {
  const steps = [
    { title: "Parsing Resume Document Structure...", icon: FileText },
    { title: "Scanning ATS Parsing Algorithms & Layout...", icon: Search },
    { title: "Extracting Core Hard & Soft Technical Skills...", icon: Cpu },
    { title: "Evaluating Quantified Experience Impact...", icon: ShieldCheck },
    { title: "Generating Targeted Job Match Rankings & Insights...", icon: Sparkles },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Step progression interval: smoothly advances through steps while real AI processes
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="py-12 px-4 max-w-xl mx-auto text-center space-y-8 font-satoshi">
      {/* Glow Avatar Circle */}
      <div className="relative inline-block">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-surface border border-primary/40 text-primary mx-auto shadow-sm">
          <Cpu size={48} className="animate-pulse text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">
          AI Neural Analysis <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">In Progress</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted font-medium max-w-md mx-auto">
          Please wait while our AI engine scans your resume against enterprise applicant tracking systems.
        </p>
      </div>

      {/* Step Progress List */}
      <div className="p-6 rounded-3xl bg-surface border border-border space-y-3 text-left shadow-sm backdrop-blur-2xl">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold transition-all ${
                isDone
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : isCurrent
                  ? "bg-primary/10 text-heading border border-primary/40 shadow-sm"
                  : "text-muted border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isDone ? "text-emerald-500" : isCurrent ? "text-primary animate-spin" : "text-muted"} />
                <span>{step.title}</span>
              </div>

              {isDone && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
