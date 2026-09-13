/**
 * src/features/resume-builder/components/Templates/ProfessionalTemplate.jsx
 * 1. Professional (Default): Clean single-column ATS-grade layout.
 * 100% inline styles — zero Tailwind / oklch — perfect html2canvas PDF output.
 * Tuned for FlowCV / Resume.io density standards.
 */

import React from "react";

export default function ProfessionalTemplate({ resume }) {
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

  const s = {
    root: {
      background: "#ffffff",
      color: "#111827",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: "11px",
      lineHeight: "1.45",
      padding: "32px 36px 28px 36px",
      boxSizing: "border-box",
      width: "794px",
      minHeight: "auto",
    },
    header: {
      textAlign: "center",
      borderBottom: "2px solid #111827",
      paddingBottom: "12px",
      marginBottom: "14px",
    },
    name: {
      fontSize: "22px",
      fontWeight: "900",
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: "-0.5px",
      margin: "0 0 3px 0",
    },
    title: {
      fontSize: "10px",
      fontWeight: "700",
      color: "#4B5563",
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      margin: "0 0 6px 0",
    },
    contactRow: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "0 12px",
      fontSize: "10px",
      color: "#374151",
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: "9.5px",
      fontWeight: "900",
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: "1.5px",
      borderBottom: "1px solid #D1D5DB",
      paddingBottom: "3px",
      marginBottom: "8px",
      marginTop: "14px",
    },
    chip: {
      display: "inline-block",
      background: "#F3F4F6",
      color: "#1F2937",
      border: "1px solid #E5E7EB",
      borderRadius: "3px",
      padding: "1px 6px",
      fontSize: "9.5px",
      fontWeight: "700",
      marginRight: "4px",
      marginBottom: "4px",
    },
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.name}>{personalInfo.fullName || resume.fullName || "Your Full Name"}</h1>
        <p style={s.title}>{personalInfo.professionalTitle || resume.professionalTitle || "Professional Title"}</p>
        <div style={s.contactRow}>
          {(personalInfo.email || resume.email) && <span>{personalInfo.email || resume.email}</span>}
          {(personalInfo.phone || resume.phone) && <span>• {personalInfo.phone || resume.phone}</span>}
          {(personalInfo.location || resume.location) && <span>• {personalInfo.location || resume.location}</span>}
          {(personalInfo.linkedIn || resume.linkedinUrl) && <span>• {personalInfo.linkedIn || resume.linkedinUrl}</span>}
          {(personalInfo.gitHub || resume.githubUrl) && <span>• {personalInfo.gitHub || resume.githubUrl}</span>}
          {(personalInfo.portfolio || resume.portfolioUrl) && <span>• {personalInfo.portfolio || resume.portfolioUrl}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {(summary || resume.professionalSummary) && (
        <div>
          <div style={s.sectionTitle}>Professional Summary</div>
          <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.6", margin: 0 }}>
            {summary || resume.professionalSummary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Work Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#111827" }}>{exp.position}</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "#6B7280", whiteSpace: "nowrap" }}>
                  {exp.startDate} – {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p style={{ fontSize: "10.5px", fontWeight: "700", color: "#374151", margin: "1px 0" }}>
                {exp.company}{exp.location ? ` • ${exp.location}` : ""}
              </p>
              {renderBullets(exp.description)}
            </div>
          ))}
        </div>
      )}

      {/* Technical Projects */}
      {projects.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Technical Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#111827" }}>
                  {proj.projectName || proj.name}
                </span>
                {proj.technologies && (
                  <span style={{ fontSize: "9.5px", fontWeight: "600", color: "#6B7280" }}>
                    [{formatTech(proj.technologies)}]
                  </span>
                )}
              </div>
              {(proj.githubUrl || proj.liveUrl) && (
                <p style={{ fontSize: "9.5px", color: "#2563EB", fontWeight: "600", margin: "1px 0" }}>
                  {proj.githubUrl && `GitHub: ${proj.githubUrl}`}
                  {proj.githubUrl && proj.liveUrl && " | "}
                  {proj.liveUrl && `Live: ${proj.liveUrl}`}
                </p>
              )}
              {renderBullets(proj.description)}
            </div>
          ))}
        </div>
      )}

      {/* Core Competencies */}
      {skillsArr.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Core Competencies & Skills</div>
          <div>
            {skillsArr.map((sk, idx) => (
              <span key={idx} style={s.chip}>{sk}</span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Education</div>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: "7px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#111827" }}>{edu.degree}</span>
                {edu.fieldOfStudy && <span style={{ fontSize: "10.5px", color: "#374151" }}> in {edu.fieldOfStudy}</span>}
                <span style={{ fontSize: "10.5px", color: "#374151" }}> — {edu.institution}</span>
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
          <div style={s.sectionTitle}>Certifications</div>
          {certifications.map((cert, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <div>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#111827" }}>{cert.name || cert.certificationName}</span>
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
          <div style={s.sectionTitle}>Achievements</div>
          {achievements.map((ach, idx) => (
            <div key={idx} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#111827" }}>{ach.title || ach.achievementTitle}</span>
                {ach.date && <span style={{ fontSize: "9.5px", color: "#6B7280" }}>{ach.date}</span>}
              </div>
              {ach.description && <p style={{ fontSize: "10px", color: "#374151", margin: "2px 0 0 0", lineHeight: "1.4" }}>{ach.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Languages</div>
          <p style={{ fontSize: "10.5px", color: "#374151", fontWeight: "600", margin: 0 }}>
            {languages.map((l) => (typeof l === "string" ? l : `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`)).join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
