/**
 * src/features/mock-interview/pages/MockInterviewLandingPage.jsx
 * 1. AI Mock Interview Landing Page: Hero, Introduction, Stats, Features Grid, Available Tracks, CTA.
 */

import React from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, ShieldCheck, ArrowRight, Brain } from "lucide-react";
import InterviewHero from "../components/InterviewHero";
import TrackSelector from "../components/TrackSelector";
import { useMockInterview } from "../hooks/useMockInterview";
import { INTERVIEW_TRACKS } from "../constants/interviewData";

export default function MockInterviewLandingPage({ onStartClick, onTrackSelect }) {
  const { setConfig, currentInterview } = useMockInterview();

  const handleSelectTrack = (trackId) => {
    const trackObj = INTERVIEW_TRACKS.find((t) => t.id === trackId) || INTERVIEW_TRACKS[0];
    setConfig({
      trackId,
      trackTitle: trackObj.title,
    });
    if (onTrackSelect) onTrackSelect(trackId);
  };

  const features = [
    {
      icon: Bot,
      title: "Real-Time AI Interviewer",
      description: "Generates role-specific questions tailored to your experience level and target tech stack.",
    },
    {
      icon: Brain,
      title: "Multi-Metric Scoring",
      description: "Evaluates technical precision, architecture decisions, STAR method communication, and confidence.",
    },
    {
      icon: Zap,
      title: "Instant Code & Concept Audit",
      description: "Analyzes code blocks, algorithm complexity, edge-case handling, and framework best practices.",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Benchmarking",
      description: "Compares candidate responses against real FAANG & Tier-1 tech company hiring bars.",
    },
  ];

  return (
    <div className="space-y-12 font-satoshi text-body py-4">
      {/* 1. Hero Section */}
      <InterviewHero
        onStartClick={onStartClick}
        onExploreTracksClick={() => {
          const el = document.getElementById("available-tracks-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 2. Introduction & Platform Features Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Why AI Mock Interviews?
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-heading tracking-tight">
            Practice Without Anxiety. <br />
            <span className="bg-gradient-to-r from-indigo-500 to-pink-500 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
              Perform with Complete Confidence.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-surface border border-border hover:border-indigo-500/40 backdrop-blur-2xl shadow-xl space-y-3 font-satoshi flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <h4 className="text-base font-black text-heading">{feat.title}</h4>
                  <p className="text-xs text-muted font-medium leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Available Interview Tracks */}
      <div id="available-tracks-section" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-heading">Available Interview Tracks</h3>
            <p className="text-xs text-muted font-medium">Select a track to launch a customized AI technical interview</p>
          </div>

          <button
            onClick={onStartClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <span>Custom Setup</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <TrackSelector
          selectedTrackId={currentInterview?.trackId || "java-fullstack"}
          onSelectTrack={handleSelectTrack}
        />
      </div>

      {/* 4. Bottom CTA Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-surface-elevated border border-border text-center space-y-4 backdrop-blur-2xl shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">
          <Sparkles size={14} /> Ready to Ace Your Next Interview?
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-heading">Start Your Free AI Practice Session Today</h3>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto font-medium">
          Get real-time feedback, detailed score breakdowns, and personalized learning paths.
        </p>

        <div className="pt-2">
          <button
            onClick={onStartClick}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-2xl shadow-indigo-500/30 hover:scale-105 transition cursor-pointer inline-flex items-center gap-2"
          >
            <Bot size={18} /> Configure & Start Interview <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
