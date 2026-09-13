/**
 * src/features/resume-analyzer/components/JobMatchCard.jsx
 * Reusable Job Match Card displaying percentage match, matched/missing skills tags, location, salary, and apply action.
 */

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, ArrowUpRight, Check, AlertCircle } from "lucide-react";
import SkillChip from "./SkillChip";

export default function JobMatchCard({
  title,
  company,
  matchPercentage = 90,
  matchedSkills = [],
  missingSkills = [],
  location = "",
  salaryRange = "",
  onApply = null,
}) {
  const isHighMatch = matchPercentage >= 85;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 backdrop-blur-2xl shadow-sm space-y-5 font-satoshi"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h4 className="text-lg font-black text-heading">{title}</h4>
          <p className="text-xs font-bold text-primary mt-1">{company}</p>
        </div>

        {/* Match Percentage Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-4 py-2 rounded-2xl border flex items-center gap-1.5 shadow-sm ${
              isHighMatch
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
            }`}
          >
            <span className="text-xl font-black">{matchPercentage}%</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Match</span>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-body font-semibold">
        {location && (
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" /> {location}
          </span>
        )}
        {salaryRange && (
          <span className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-500" /> {salaryRange}
          </span>
        )}
      </div>

      {/* Skills Match */}
      <div className="space-y-2">
        <span className="text-xs font-black text-muted uppercase tracking-wider block">
          Matched Skills ({matchedSkills.length})
        </span>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map((skill) => (
            <SkillChip key={skill} name={skill} type="detected" />
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-black text-muted uppercase tracking-wider block">
            Missing Skills ({missingSkills.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <SkillChip key={skill} name={skill} type="missing" />
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-muted font-medium">Instant One-Click Application</span>
        <button
          onClick={onApply}
          className="flex items-center gap-2 rounded-2xl gradient-bg-signature px-6 py-2.5 text-xs font-black text-white shadow-button hover:opacity-90 hover:scale-105 transition cursor-pointer"
        >
          <span>Apply Now</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
