/**
 * src/features/resume-analyzer/components/SkillChips.jsx
 * Reusable component displaying chips for detected and missing skills.
 */

import React from "react";
import SkillChip from "./SkillChip";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

export default function SkillChips({ detectedSkills = [], missingSkills = [] }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="space-y-6 font-satoshi">
      {/* Detected Skills */}
      {detectedSkills.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface border border-emerald-500/20 space-y-4 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> Skills Found ({detectedSkills.length})
            </h3>
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border"
              style={{
                color: isLight ? "#022c22" : "#6ee7b7",
                backgroundColor: isLight ? "#d1fae5" : "rgba(16, 185, 129, 0.15)",
                borderColor: isLight ? "#6ee7b7" : "rgba(16, 185, 129, 0.3)",
              }}
            >
              Verified Stack
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {detectedSkills.map((skill) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return <SkillChip key={name} name={name} type="detected" />;
            })}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface border border-rose-500/20 space-y-4 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-base font-black text-heading flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" /> Missing Skills ({missingSkills.length})
            </h3>
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full border"
              style={{
                color: isLight ? "#4c0519" : "#fca5a5",
                backgroundColor: isLight ? "#ffe4e6" : "rgba(239, 68, 68, 0.15)",
                borderColor: isLight ? "#fca5a5" : "rgba(239, 68, 68, 0.3)",
              }}
            >
              Recommended Additions
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {missingSkills.map((skill) => {
              const name = typeof skill === "string" ? skill : skill.name;
              return <SkillChip key={name} name={name} type="missing" />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
