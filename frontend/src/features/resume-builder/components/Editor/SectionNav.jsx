/**
 * src/features/resume-builder/components/Editor/SectionNav.jsx
 * Left panel section navigation with completion indicators & status pills.
 */

import React from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Cpu,
  Award,
  Trophy,
  Globe,
  Layers,
} from "lucide-react";

export const SECTIONS_CONFIG = [
  { id: "personalInfo", label: "Personal Information", icon: User, required: true },
  { id: "summary", label: "Professional Summary", icon: FileText, required: true },
  { id: "experience", label: "Work Experience", icon: Briefcase, required: true },
  { id: "education", label: "Education History", icon: GraduationCap, required: true },
  { id: "projects", label: "Technical Projects", icon: FolderGit2, required: true },
  { id: "skills", label: "Skills & Stack", icon: Cpu, required: true },
  { id: "certifications", label: "Certifications", icon: Award, required: false },
  { id: "achievements", label: "Honors & Achievements", icon: Trophy, required: false },
  { id: "languages", label: "Languages", icon: Globe, required: false },
  { id: "customSections", label: "Custom Sections", icon: Layers, required: false },
];

export default function SectionNav({ activeSection, onSelectSection, resume }) {
  const getSectionStatus = (secId) => {
    if (!resume) return false;
    if (secId === "personalInfo") return Boolean(resume.personalInfo?.fullName && resume.personalInfo?.email);
    if (secId === "summary") return Boolean(resume.summary && resume.summary.length > 20);
    if (secId === "experience") return Array.isArray(resume.experience) && resume.experience.length > 0;
    if (secId === "education") return Array.isArray(resume.education) && resume.education.length > 0;
    if (secId === "projects") return Array.isArray(resume.projects) && resume.projects.length > 0;
    if (secId === "skills") return Boolean(resume.skills?.technical && resume.skills.technical.length > 0);
    if (secId === "certifications") return Array.isArray(resume.certifications) && resume.certifications.length > 0;
    if (secId === "achievements") return Array.isArray(resume.achievements) && resume.achievements.length > 0;
    if (secId === "languages") return Array.isArray(resume.languages) && resume.languages.length > 0;
    if (secId === "customSections") return Array.isArray(resume.customSections) && resume.customSections.length > 0;
    return false;
  };

  return (
    <div className="space-y-1.5 font-satoshi">
      <span className="text-[10px] font-black uppercase tracking-wider text-muted block px-3 mb-2">
        Resume Sections
      </span>

      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        const isComplete = getSectionStatus(sec.id);

        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400"
                : "bg-surface-hover border border-border text-body hover:bg-surface-elevated hover:text-heading"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon size={16} className={isActive ? "text-white" : "text-indigo-500 dark:text-indigo-400"} />
              <span className="line-clamp-1">{sec.label}</span>
            </div>

            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isComplete
                  ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : sec.required
                  ? "bg-amber-500 dark:bg-amber-400"
                  : "bg-muted/40"
              }`}
              title={isComplete ? "Completed" : sec.required ? "Required Field" : "Optional Section"}
            />
          </button>
        );
      })}
    </div>
  );
}
