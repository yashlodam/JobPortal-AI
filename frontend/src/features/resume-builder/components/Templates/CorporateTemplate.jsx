/**
 * src/features/resume-builder/components/Templates/CorporateTemplate.jsx
 * 5. Corporate / Executive: Dark header banner, serif-inspired professional layout for leaders & architects.
 * 100% inline styles — zero Tailwind / oklch — perfect html2canvas PDF output.
 */

import React from "react";

export default function CorporateTemplate({ resume }) {
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
    if (typeof skills === "object" && skills !== null) {
      return [
        ...(skills.technical || []),
        ...(skills.frameworks || []),
        ...(skills.tools || []),
        ...(skills.soft || []),
      ];
    }
    return [];
  };

  const renderBullets = (text) => {
    if (!text) return null;
    const lines = text.split("\n").map((b) => b.trim().replace(/^[-•*]\s*/, "")).filter(Boolean);
    if (lines.length > 1) {
      return (
        <ul style={{ margin: "3px 0 0 0", padding: "0 0 0 16px", listStyleType: "disc" }}>
          {lines.map((b, i) => (
            <li key={i} style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.5", marginBottom: "2px" }}>{b}</li>
          ))}
        </ul>
      );
    }
    return <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.5", marginTop: "2px", whiteSpace: "pre-wrap" }}>{text}</p>;
  };

  const skillsArr = getSkillsList();

  const amber = "#b45309";
  const amberLight = "#fef3c7";
  const amberBorder = "#fde68a";

  const sectionTitle = {
    fontSize: "9.5px",
    fontWeight: "900",
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: "2px",
    borderBottom: "2px solid #1a1a1a",
    paddingBottom: "4px",
    marginBottom: "9px",
    marginTop: "14px",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#1a1a1a",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11px",
        lineHeight: "1.5",
        boxSizing: "border-box",
        width: "794px",
        minHeight: "auto",
        overflow: "hidden",
      }}
    >
      {/* Executive Dark Header Banner */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#ffffff",
          padding: "22px 36px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "2px",
            margin: "0 0 4px 0",
            fontFamily: "'Segoe UI', Arial, sans-serif",
          }}
        >
          {personalInfo.fullName || resume.fullName || "Executive Name"}
        </h1>
        <p style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 8px 0", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          {personalInfo.professionalTitle || resume.professionalTitle}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", fontSize: "10px", color: "#d1d5db", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
          {(personalInfo.email || resume.email) && <span>{personalInfo.email || resume.email}</span>}
          {(personalInfo.phone || resume.phone) && <span>• {personalInfo.phone || resume.phone}</span>}
          {(personalInfo.location || resume.location) && <span>• {personalInfo.location || resume.location}</span>}
          {(personalInfo.linkedIn || resume.linkedinUrl) && <span>• {personalInfo.linkedIn || resume.linkedinUrl}</span>}
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: "20px 36px 28px 36px" }}>

        {/* Executive Summary */}
        {(summary || resume.professionalSummary) && (
          <div>
            <div style={sectionTitle}>Executive Summary & Vision</div>
            <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>
              {summary || resume.professionalSummary}
            </p>
          </div>
        )}

        {/* Professional & Leadership Experience */}
        {experience.length > 0 && (
          <div>
            <div style={sectionTitle}>Professional & Leadership Experience</div>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#1a1a1a", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                    {exp.position} — <span style={{ color: amber }}>{exp.company}</span>
                  </span>
                  <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", fontFamily: "'Segoe UI', Arial, sans-serif", whiteSpace: "nowrap" }}>
                    {exp.startDate} – {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        )}

        {/* Enterprise Projects */}
        {projects.length > 0 && (
          <div>
            <div style={sectionTitle}>Enterprise Projects & Initiatives</div>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: "9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#1a1a1a", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{proj.projectName || proj.name}</span>
                  {proj.technologies && (
                    <span style={{ fontSize: "9.5px", color: "#6B7280", fontFamily: "'Segoe UI', Arial, sans-serif" }}>[{formatTech(proj.technologies)}]</span>
                  )}
                </div>
                {renderBullets(proj.description)}
              </div>
            ))}
          </div>
        )}

        {/* Strategic Competencies */}
        {skillsArr.length > 0 && (
          <div>
            <div style={sectionTitle}>Strategic Competencies & Skills</div>
            <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
              {skillsArr.map((sk, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    background: "#f3f4f6",
                    color: "#1a1a1a",
                    border: "1px solid #d1d5db",
                    borderRadius: "2px",
                    padding: "1px 6px",
                    fontSize: "9.5px",
                    fontWeight: "700",
                    marginRight: "4px",
                    marginBottom: "4px",
                  }}
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education & Credentials */}
        {education.length > 0 && (
          <div>
            <div style={sectionTitle}>Education & Academic Credentials</div>
            {education.map((edu, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#1a1a1a" }}>
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution}
                  </span>
                  {edu.grade && <span style={{ fontSize: "10px", color: "#6B7280" }}> ({edu.grade})</span>}
                </div>
                <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", whiteSpace: "nowrap" }}>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <div style={sectionTitle}>Professional Certifications</div>
            {certifications.map((cert, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#1a1a1a" }}>{cert.name || cert.certificationName}</span>
                  {(cert.issuingOrganization || cert.issuer) && (
                    <span style={{ fontSize: "10px", color: "#374151" }}> — {cert.issuingOrganization || cert.issuer}</span>
                  )}
                </div>
                <span style={{ fontSize: "9.5px", color: "#6B7280", fontWeight: "600" }}>{cert.issueDate || cert.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <div style={sectionTitle}>Awards & Recognition</div>
            {achievements.map((ach, idx) => (
              <div key={idx} style={{ marginBottom: "6px", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#1a1a1a" }}>{ach.title || ach.achievementTitle}</span>
                  {ach.date && <span style={{ fontSize: "9.5px", color: "#6B7280" }}>{ach.date}</span>}
                </div>
                {ach.description && <p style={{ fontSize: "10px", color: "#374151", margin: "2px 0 0 0" }}>{ach.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
