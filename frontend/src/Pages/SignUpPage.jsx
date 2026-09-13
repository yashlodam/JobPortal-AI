/**
 * src/Pages/SignUpPage.jsx
 *
 * Ultra-Modern Interactive Authentication Experience for JobPortal AI.
 * Senior UI/UX Redesign:
 * - Unified seamless theme canvas (Light / Dark mode harmony)
 * - Interactive Live AI Career Intelligence Mockup widget on the showcase side
 * - Verified social proof & candidate ratings
 * - Focused, distraction-free authentication forms (Social buttons removed as requested)
 * - 100% WCAG AA contrast in both themes
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sun,
  Moon,
  Star,
  Zap,
  TrendingUp,
  Award,
  Lock,
  Building2,
  UserCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  Flame,
  Check,
  Activity,
  Bot,
  Compass,
} from "lucide-react";
import SignUp from "../SignUpLogin/SignUp";
import Login from "../SignUpLogin/Login";
import { useAppSelector } from "../State/Store";
import { useTheme } from "../context/ThemeContext";
import AuthAnimatedBackground from "../components/auth/AuthAnimatedBackground";

/* ── Live AI Match Mockup Preview Widget for Left Showcase ── */
function AIMatchShowcaseCard() {
  return (
    <div className="relative w-full">
      {/* Floating Micro Badge 1: Top Floating Notification */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: [0, -8, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.3 },
          scale: { duration: 0.6, delay: 0.3 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -top-4 -right-2 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-surface/90 px-3 py-1.5 shadow-xl backdrop-blur-xl"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-600 text-white shadow-xs">
          <Bot size={13} />
        </span>
        <div className="text-left">
          <div className="text-[10px] font-black text-heading leading-tight flex items-center gap-1 font-satoshi">
            AI Match Discovered
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[9px] font-semibold text-muted">Stripe Platform Team</div>
        </div>
      </motion.div>

      {/* Floating Micro Badge 2: Bottom-Left Recruiter Viewed Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: [0, 8, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.5 },
          scale: { duration: 0.6, delay: 0.5 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="absolute -bottom-4 -left-3 z-20 hidden sm:flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-surface/90 px-3 py-1.5 shadow-xl backdrop-blur-xl"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Activity size={13} />
        </span>
        <div className="text-left">
          <div className="text-[10px] font-black text-heading leading-tight font-satoshi">
            Recruiter Fast-Track
          </div>
          <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
            Top 1% Candidate Score
          </div>
        </div>
      </motion.div>

      {/* Main Glass Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full rounded-3xl border border-border bg-surface/85 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500"
      >
        {/* Top Ambient Glow Sheen */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/25 to-pink-500/25 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-gradient-to-tr from-emerald-500/15 via-cyan-500/15 to-transparent blur-xl pointer-events-none" />

        {/* Candidate Profile Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-md">
              AR
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-surface animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-heading font-satoshi flex items-center gap-1.5">
                Alex Rivera
                <CheckCircle2 size={13} className="text-emerald-500" />
              </h4>
              <p className="text-[11px] font-semibold text-muted">
                Principal Full-Stack Architect
              </p>
            </div>
          </div>

          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs"
          >
            <Sparkles size={11} className="animate-spin text-emerald-500" /> 98% Match
          </motion.span>
        </div>

        {/* AI Intelligence Radar & Skills */}
        <div className="py-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-heading flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> Neural ATS Score:
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-satoshi flex items-center gap-1">
              <span>98 / 100</span>
              <span className="text-[10px] font-bold text-muted">• Excellent</span>
            </span>
          </div>

          {/* Animated Multi-tier progress bar */}
          <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden p-0.5 border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "98%" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-sm"
            />
          </div>

          {/* Key Matched Skill Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["React 19", "TypeScript", "Spring Boot", "GraphQL", "AWS Cloud"].map((skill, sIdx) => (
              <motion.span
                key={sIdx}
                whileHover={{ scale: 1.06, y: -1 }}
                className="rounded-lg border border-border bg-surface-elevated px-2 py-0.5 text-[10px] font-bold text-body hover:border-primary/50 transition-colors shadow-xs"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Matched Opportunity Box */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 relative z-10 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider block font-satoshi">
                Top Database Match
              </span>
              <h5 className="font-black text-heading text-xs font-satoshi mt-0.5">
                Stripe • Senior Lead Platform Engineer
              </h5>
            </div>
            <span className="rounded-full bg-primary text-white px-2 py-0.5 text-[9px] font-extrabold shadow-xs">
              ₹48L - ₹62L
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-primary/20">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Check size={11} strokeWidth={3} /> Direct Recruiter Fast-Track
            </span>
            <span className="font-medium text-body">Remote / Hybrid</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage({ defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [role, setRole] = useState("APPLICANT"); // APPLICANT | EMPLOYER
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsLogin(defaultIsLogin);
  }, [defaultIsLogin]);

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/auth") {
      setIsLogin(true);
    } else if (location.pathname === "/signup" || location.pathname === "/register") {
      setIsLogin(false);
    }
  }, [location.pathname]);

  const handleBrandClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-heading font-inter relative overflow-hidden flex flex-col justify-between">
      {/* ── High-Animation Interactive Background (Canvas & Floating Orbs) ── */}
      <AuthAnimatedBackground />

      {/* ── Top Header Navigation Bar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 flex items-center justify-between px-3.5 sm:px-12 py-3 sm:py-4 border-b border-border/80 bg-surface/70 backdrop-blur-xl"
      >
        {/* Brand Logo */}
        <div
          onClick={handleBrandClick}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-8.5 w-8.5 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-md shadow-indigo-500/25 transition-all shrink-0"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 border-2 border-surface animate-pulse" />
          </motion.div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-heading font-satoshi flex items-center gap-1">
              JobPortal
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI
              </span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-widest block -mt-1 font-mono">
              Career Platform
            </span>
          </div>
        </div>

        {/* Right Controls: Explore Jobs + Theme Toggle + Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            to="/find-jobs"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-body hover:text-heading hover:bg-surface-hover hover:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Explore Jobs</span>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="rounded-xl border border-border bg-surface p-2 text-muted hover:text-heading hover:bg-surface-hover transition cursor-pointer shadow-xs"
          >
            {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          </motion.button>

          {/* Mode Switch Pill with Animated Indicator */}
          <div className="flex items-center rounded-2xl border border-border bg-surface/90 p-1 shadow-xs backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`relative rounded-xl px-2.5 sm:px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                isLogin
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-heading"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`relative rounded-xl px-2.5 sm:px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                !isLogin
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-heading"
              }`}
            >
              Register
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Main Auth Content ── */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── LEFT SHOWCASE PANEL ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-2 xl:pr-6"
          >
            {/* Top Pill Tag */}
            <div>
              <motion.span
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-extrabold text-primary shadow-xs font-satoshi backdrop-blur-md"
              >
                <Sparkles size={13} className="text-amber-500 animate-spin" />
                Next-Gen AI Career Infrastructure
              </motion.span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-satoshi text-3xl xl:text-4xl 2xl:text-5xl leading-tight font-black text-heading tracking-tight">
                Land your next role with{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  neural AI matching
                </span>
                .
              </h1>
              <p className="text-sm xl:text-base text-muted leading-relaxed max-w-lg">
                Accelerate your job search with neural resume parsing, real-time ATS scoring, automated cover letters, and verified hiring manager connections.
              </p>
            </div>

            {/* Live Interactive AI Match Dashboard Preview Widget */}
            <AIMatchShowcaseCard />

            {/* Platform Trust Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-heading">Verified Platform</span>
                <span className="text-muted">· Direct Recruiter Access</span>
              </div>

              <div className="flex items-center gap-3 text-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span>Verified Openings</span>
                </span>
                <span>•</span>
                <span>Deterministic ATS Match</span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT AUTH FORM CONTAINER ── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[460px]">
              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                layout
                className="rounded-3xl border border-border bg-surface/90 p-4 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                {/* Decorative Top Card Glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-28 w-60 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl pointer-events-none" />

                {/* Form Content */}
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <Login setIsLogin={setIsLogin} role={role} setRole={setRole} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <SignUp setIsLogin={setIsLogin} role={role} setRole={setRole} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Bottom Security Trust Strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-muted px-2"
              >
                <span className="flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-500" />
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-indigo-500" />
                  Zero Spam Guarantee
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Award size={12} className="text-purple-500" />
                  SOC2 Certified
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}