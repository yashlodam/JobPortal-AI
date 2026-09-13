/**
 * src/features/mock-interview/components/InterviewHero.jsx
 * Premium SaaS Landing Hero Section with glassmorphism glow and stat highlights.
 */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot, ArrowRight, ShieldCheck, Award, Zap, Terminal } from "lucide-react";

export default function InterviewHero({ onStartClick, onExploreTracksClick }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 sm:p-12 font-satoshi shadow-xl">
      {/* Background Animated Glow Orb */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-r from-pink-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span>Next-Gen AI Mock Interview Platform</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-6xl font-black text-heading tracking-tight leading-tight"
        >
          Master Technical Interviews with <br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Real-Time AI Feedback
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-lg text-muted max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Simulate realistic technical and behavioral interviews for Java, React, System Design, and AI engineering roles. Receive instant grading, detailed code analysis, and targeted learning recommendations.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 hover:scale-105 transition duration-300 cursor-pointer"
          >
            <Bot size={20} />
            <span>Start AI Interview Now</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreTracksClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-surface-hover border border-border text-body hover:text-heading hover:bg-surface-elevated font-black text-sm transition cursor-pointer"
          >
            <Terminal size={18} className="text-indigo-500 dark:text-indigo-400" />
            <span>Explore Track Library</span>
          </button>
        </motion.div>

        {/* Key Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border"
        >
          <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-indigo-500 dark:text-indigo-400">12,500+</h4>
            <p className="text-xs text-muted font-medium">Interviews Completed</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-purple-500 dark:text-purple-400">94.8%</h4>
            <p className="text-xs text-muted font-medium">Interview Pass Rate</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-pink-500 dark:text-pink-400">500+</h4>
            <p className="text-xs text-muted font-medium">AI Question Models</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-hover border border-border space-y-1">
            <h4 className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-400">4.9/5.0</h4>
            <p className="text-xs text-muted font-medium">Candidate Rating</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
