import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IconArrowLeft,
  IconShield,
  IconClock,
  IconCircleCheck,
  IconSparkles,
} from "@tabler/icons-react";
import ApplyJobComp from "../ApplyJob/ApplyJobComp";

/* ─── Trust Badges ─── */
const trustBadges = [
  { icon: IconShield, label: "Secure & Private", desc: "Your data is encrypted" },
  { icon: IconClock, label: "Quick Apply", desc: "Takes under 5 minutes" },
  { icon: IconCircleCheck, label: "Instant Confirmation", desc: "You'll hear back soon" },
];

function ApplyJobPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface font-inter text-body">
      {/* ── Page Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24">

        {/* ── Back Button ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-4 py-2.5 text-xs font-bold text-body hover:border-primary/40 hover:bg-surface-hover hover:text-heading transition-all duration-200 cursor-pointer mb-8 shadow-sm"
          >
            <IconArrowLeft
              size={15}
              className="text-muted group-hover:text-primary transition-all duration-200 group-hover:-translate-x-0.5"
            />
            Back to Job Details
          </button>
        </motion.div>

        {/* ── Page Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-3 shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-extrabold text-primary tracking-wider uppercase font-satoshi">Fast-Track Application</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-heading font-satoshi leading-tight">
            Apply for this <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Position</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted max-w-xl">
            Review your candidate details and submit your application directly to the hiring team.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Main Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="flex-1 min-w-0 w-full"
          >
            <ApplyJobComp />
          </motion.div>

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="w-full lg:w-80 shrink-0 space-y-5"
          >
            {/* Trust badges */}
            <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-bold text-heading font-satoshi uppercase tracking-wider">Why apply here?</h3>
              {trustBadges.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-heading">{label}</p>
                    <p className="text-[11px] text-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-bold text-heading font-satoshi uppercase tracking-wider mb-4">Tips for success</h3>
              <ul className="space-y-3">
                {[
                  "Choose a clear, ATS-friendly PDF resume",
                  "Highlight measurable achievements",
                  "Use AI to generate a tailored cover letter note",
                  "Ensure your phone and email are up to date",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-body">
                    <IconCircleCheck size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="rounded-3xl border border-border bg-surface p-5 text-center shadow-sm backdrop-blur-xl">
              <p className="text-xs text-muted">Need help with your application?</p>
              <a
                href="mailto:support@jobportal.com"
                className="mt-1.5 inline-block text-xs font-bold text-primary hover:underline transition"
              >
                Contact Support →
              </a>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

export default ApplyJobPage;