/**
 * src/LandingPage/Testimonials.jsx
 *
 * Replaced fake testimonials with honest product feature highlights.
 * Shows 3 core platform capabilities with real value propositions.
 */
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Zap,
  MessageSquare,
  ArrowRight,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  {
    id: "resume",
    icon: FileText,
    color: "indigo",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-500",
    headline: "AI Resume Analysis",
    description:
      "Upload your resume and instantly see your ATS compatibility score, skill gaps, missing keywords, and section-by-section recommendations. Know exactly how to improve before you apply.",
    bullets: [
      "ATS compatibility score",
      "Missing keyword detection",
      "Section-level recommendations",
    ],
    cta: "Analyze your resume",
    href: "/resume-analyzer",
  },
  {
    id: "match",
    icon: Zap,
    color: "amber",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-500",
    headline: "Intelligent Job Matching",
    description:
      "Every job posting is scored against your profile — skills, experience level, and role fit. Browse jobs with match percentages so you can focus your energy on the right opportunities.",
    bullets: [
      "Skills alignment score",
      "Experience level match",
      "Role fit percentage",
    ],
    cta: "Find matched jobs",
    href: "/find-jobs",
  },
  {
    id: "interview",
    icon: MessageSquare,
    color: "emerald",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-500",
    headline: "AI Interview Coach",
    description:
      "Practice technical and behavioral interviews with our AI coach. Get real-time feedback on your answers, communication style, and areas for improvement — before the real interview.",
    bullets: [
      "Role-specific questions",
      "Answer quality feedback",
      "Communication analysis",
    ],
    cta: "Start practicing",
    href: "/mock-interview",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function ProductFeatures() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section
      className={`relative py-16 sm:py-20 border-b transition-colors ${
        isLight ? "border-slate-200 bg-slate-50/50" : "border-white/5 bg-transparent"
      }`}
    >
      <div className="section-container">
        <SectionHeader
          badge="Platform Capabilities"
          title="Built to get you hired"
          subtitle="Three AI-powered tools working together to strengthen your applications, sharpen your interview skills, and surface the right opportunities."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                    : "bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05]"
                }`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.iconBg} ${feature.iconColor} mb-5`}
                >
                  <Icon size={20} />
                </div>

                {/* Headline */}
                <h3
                  className={`text-lg font-bold font-satoshi mb-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {feature.headline}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed mb-5 flex-1 ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {feature.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-2 mb-6">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className={`flex items-center gap-2 text-xs font-semibold ${
                        isLight ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      <Check
                        size={13}
                        className={`shrink-0 ${
                          feature.color === "indigo"
                            ? "text-indigo-500"
                            : feature.color === "amber"
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={feature.href}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors group-hover:gap-2.5 ${
                    feature.color === "indigo"
                      ? "text-indigo-500 hover:text-indigo-600"
                      : feature.color === "amber"
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  {feature.cta}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
