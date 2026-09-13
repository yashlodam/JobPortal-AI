/**
 * src/features/resume-builder/components/Templates/MinimalTemplate.jsx
 * 3. Minimal: Extremely ATS-friendly, Black and white, no graphics/icons, ideal for campus placements & freshers.
 * Fully compatible with Spring Boot ResumeDocumentResponse DTO schema.
 */

import React from "react";

export default function MinimalTemplate({ resume }) {
  if (!resume) return null;

  const {
    personalInfo = {},
    summary = "",
    experience = [],
    education = [],
    projects = [],
    skills = {},
    certifications = [],
    achievements = [],
    languages = [],
  } = resume;

  const formatTech = (tech) => {
    if (Array.isArray(tech)) return tech.join(", ");
    if (typeof tech === "string") return tech;
    return "";
  };

  const getSkillsList = () => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === "object") {
      return [
        ...(skills.technical || []),
        ...(skills.frameworks || []),
        ...(skills.tools || []),
        ...(skills.soft || []),
      ];
    }
    return [];
  };

  const skillsArr = getSkillsList();

  return (
    <div className="bg-white text-black font-mono p-8 sm:p-10 text-left space-y-5 text-xs shadow-2xl border border-slate-300 leading-tight">
      {/* Header */}
      <div className="border-b border-black pb-3 space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight">
          {personalInfo.fullName || resume.fullName || "FULL NAME"}
        </h1>
        <p className="text-xs font-bold text-slate-800 uppercase">
          {personalInfo.professionalTitle || resume.professionalTitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-700 font-bold pt-1">
          {(personalInfo.email || resume.email) && <span>{personalInfo.email || resume.email}</span>}
          {(personalInfo.phone || resume.phone) && <span>| {personalInfo.phone || resume.phone}</span>}
          {(personalInfo.location || resume.location) && <span>| {personalInfo.location || resume.location}</span>}
          {(personalInfo.linkedIn || resume.linkedinUrl) && <span>| {personalInfo.linkedIn || resume.linkedinUrl}</span>}
          {(personalInfo.gitHub || resume.githubUrl) && <span>| {personalInfo.gitHub || resume.githubUrl}</span>}
        </div>
      </div>

      {/* Summary */}
      {(summary || resume.professionalSummary) && (
        <div className="space-y-1">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">OBJECTIVE / SUMMARY</h2>
          <p className="text-[11px] leading-relaxed text-slate-900">{summary || resume.professionalSummary}</p>
        </div>
      )}

      {/* Education First for Freshers */}
      {education.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">EDUCATION</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between font-bold text-black text-[11px]">
              <span>{edu.degree} in {edu.fieldOfStudy} - {edu.institution} ({edu.grade || "N/A"})</span>
              <span className="text-slate-700">{edu.startDate} - {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">EXPERIENCE</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between font-bold text-black text-xs">
                <span>{exp.position} // {exp.company}</span>
                <span className="text-slate-700">{exp.startDate} - {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.description && <p className="text-[10px] text-slate-800 leading-normal whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">PROJECTS</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="space-y-0.5 text-[11px]">
              <span className="font-bold text-black">{proj.projectName || proj.name}</span>
              {proj.technologies && <span className="text-[10px] text-slate-700"> [{formatTech(proj.technologies)}]</span>}
              {proj.description && <p className="text-[10px] text-slate-800 leading-normal">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skillsArr.length > 0 && (
        <div className="space-y-1">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">SKILLS</h2>
          <p className="text-[10px] font-bold text-slate-900">
            {skillsArr.join(", ")}
          </p>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-1">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">CERTIFICATIONS</h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between text-[11px] font-bold text-black">
              <span>{cert.name || cert.certificationName} ({cert.issuingOrganization || cert.issuer})</span>
              <span className="text-slate-700">{cert.issueDate || cert.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-1">
          <h2 className="font-black text-xs text-black uppercase tracking-wider border-b border-black pb-0.5">ACHIEVEMENTS</h2>
          {achievements.map((ach, idx) => (
            <div key={idx} className="text-[11px] font-bold text-black">
              <span>{ach.title || ach.achievementTitle}: </span>
              <span className="font-normal text-slate-800">{ach.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
