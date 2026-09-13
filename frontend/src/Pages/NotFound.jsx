import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Briefcase, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@mantine/core";

/* ===========================
    Floating Dot
=========================== */

function FloatingDot({ size, x, y, delay, duration, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        scale: [0, 1, 0.8, 1, 0],
        y: [0, -20, 10, -15, 0],
        x: [0, 10, -8, 12, 0],
      }}
      transition={{
        duration: duration || 6,
        delay: delay || 0,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
      }}
    />
  );
}

/* ===========================
    Main Page
=========================== */

function NotFound() {
  const dots = [
    { size: 6, x: "10%", y: "20%", delay: 0, duration: 5, color: "#6366F1" },
    { size: 4, x: "85%", y: "15%", delay: 0.5, duration: 7, color: "#8B5CF6" },
    { size: 8, x: "75%", y: "70%", delay: 1, duration: 6, color: "#06B6D4" },
    { size: 5, x: "15%", y: "75%", delay: 1.5, duration: 8, color: "#F59E0B" },
    { size: 7, x: "50%", y: "10%", delay: 0.8, duration: 5.5, color: "#EC4899" },
    { size: 4, x: "90%", y: "45%", delay: 2, duration: 7, color: "#10B981" },
    { size: 6, x: "5%", y: "50%", delay: 0.3, duration: 6.5, color: "#6366F1" },
    { size: 5, x: "40%", y: "85%", delay: 1.2, duration: 5, color: "#8B5CF6" },
    { size: 3, x: "65%", y: "35%", delay: 1.8, duration: 7.5, color: "#06B6D4" },
    { size: 6, x: "25%", y: "40%", delay: 0.6, duration: 6, color: "#F59E0B" },
    { size: 4, x: "55%", y: "60%", delay: 2.2, duration: 5.5, color: "#EC4899" },
    { size: 5, x: "80%", y: "85%", delay: 0.9, duration: 6.5, color: "#10B981" },
  ];

  return (
    <section className="relative flex min-h-[calc(100dvh-72px)] items-center justify-center overflow-x-hidden">
      {/* ── Background Gradient Orbs ── */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full" style={{ background: 'rgba(99,102,241,0.09)', filter: 'blur(200px)' }} />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-[500px] w-[500px] rounded-full" style={{ background: 'rgba(139,92,246,0.07)', filter: 'blur(180px)' }} />
      <div className="pointer-events-none absolute top-1/3 right-10 h-[400px] w-[400px] rounded-full" style={{ background: 'rgba(6,182,212,0.05)', filter: 'blur(160px)' }} />
      <div className="pointer-events-none absolute bottom-1/4 left-10 h-[350px] w-[350px] rounded-full" style={{ background: 'rgba(99,102,241,0.04)', filter: 'blur(140px)' }} />

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Floating Dots ── */}
      {dots.map((dot, i) => (
        <FloatingDot key={i} {...dot} />
      ))}

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="relative z-10 px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-lg">
          {/* 404 — decorative display text, not a heading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 150,
              duration: 0.8,
            }}
            className="animate-float"
          >
            <p
              aria-hidden="true"
              className="gradient-text text-[8rem] font-extrabold leading-none font-satoshi sm:text-[10rem] md:text-[12rem]"
            >
              404
            </p>
          </motion.div>

          {/* Decorative separator */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto my-6 flex items-center justify-center gap-3"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </motion.div>

          {/* Heading — true h1 for screen readers */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-2xl font-extrabold text-heading font-satoshi sm:text-3xl"
          >
            Page not found
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 text-body leading-relaxed"
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {/* Go Home — gradient */}
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 gradient-bg-signature rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-button transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              <Home size={16} />
              Go Home
            </Link>

            {/* Browse Jobs — outlined */}
            <Link
              to="/find-jobs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-heading transition-all hover:border-primary/30 hover:shadow-glow-primary sm:w-auto"
            >
              <Briefcase size={16} />
              Browse Jobs
            </Link>
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            >
              <ArrowLeft size={14} />
              Go back to previous page
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


