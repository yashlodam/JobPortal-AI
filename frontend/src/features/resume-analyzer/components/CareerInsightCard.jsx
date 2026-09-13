/**
 * src/features/resume-analyzer/components/CareerInsightCard.jsx
 * Reusable AI Career Insights display card.
 */

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Award, BookOpen, ArrowRight } from "lucide-react";

export default function CareerInsightCard({
  title,
  type = "strengths", // "strengths" | "weaknesses" | "suggestions" | "certifications" | "courses"
  items = [],
  icon: IconOverride,
}) {
  let config = {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    headerBg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "Key Advantage",
  };

  if (type === "weaknesses") {
    config = {
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      headerBg: "bg-amber-500/10 border-amber-500/20",
      badge: "Skill Gap",
    };
  } else if (type === "suggestions") {
    config = {
      icon: Lightbulb,
      iconColor: "text-primary",
      headerBg: "bg-primary/10 border-primary/20",
      badge: "Career Growth",
    };
  } else if (type === "certifications") {
    config = {
      icon: Award,
      iconColor: "text-purple-500",
      headerBg: "bg-purple-500/10 border-purple-500/20",
      badge: "High Value Certs",
    };
  } else if (type === "courses") {
    config = {
      icon: BookOpen,
      iconColor: "text-cyan-500",
      headerBg: "bg-cyan-500/10 border-cyan-500/20",
      badge: "Upskilling Path",
    };
  }

  const Icon = IconOverride || config.icon;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-6 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-sm space-y-4 font-satoshi flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${config.headerBg} ${config.iconColor}`}>
              <Icon size={20} />
            </div>
            <h4 className="font-extrabold text-heading text-base">{title}</h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-elevated border border-border text-muted">
            {config.badge}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isObject = typeof item === "object";
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
                {isObject ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-heading text-sm">{item.title}</span>
                      {item.impact && (
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {item.impact}
                        </span>
                      )}
                    </div>
                    {item.duration && (
                      <span className="text-xs text-muted font-medium block">
                        Estimated effort: {item.duration} {item.platform ? `• ${item.platform}` : ""}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-body font-medium leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
