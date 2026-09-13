/**
 * src/features/resume-analyzer/components/AnalyzeButton.jsx
 * Large CTA Analyze Resume button component with Framer Motion hover & pulse effects.
 */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AnalyzeButton({ onClick, isLoading = false, disabled = false }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto min-w-[280px] rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-10 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:shadow-[0_0_45px_rgba(99,102,241,0.7)] transition-all cursor-pointer disabled:opacity-50 font-satoshi flex items-center justify-center gap-3"
    >
      <Sparkles size={20} className="text-amber-400 animate-pulse" />
      <span>{isLoading ? "Analyzing Resume..." : "Analyze Resume Now"}</span>
      <ArrowRight size={18} />
    </motion.button>
  );
}
