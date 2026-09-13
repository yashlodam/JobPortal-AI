/**
 * src/features/resume-builder/components/Templates/CreativeTemplate.jsx
 * 6. Creative: Modern layout with purple accent for UI/UX, Product Design, Marketing.
 * 100% inline styles — zero Tailwind / oklch — perfect html2canvas PDF output.
 */

import React from "react";

export default function CreativeTemplate({ resume }) {
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
        <ul style={{ margin: "3px 0 0 0", padding: "0 0 0 14px", listStyleType: "disc" }}>
          {lines.map((b, i) => (
            <li key={i} style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.5", marginBottom: "2px" }}>{b}</li>
          ))}
        </ul>
      );
    }
    return <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.5", marginTop: "2px", whiteSpace: "pre-wrap" }}>{text}</p>;
  };

  const skillsArr = getSkillsList();

  const purple = "#7c3aed";
  const purpleLight = "#f5f3ff";
  const purpleBorder = "#ddd6fe";
  const dark = "#1e1b4b";

  const sectionTitle = {
    fontSize: "9.5px",
    fontWeight: "900",
    color: dark,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    borderBottom: `1.5px solid ${purpleBorder}`,
    paddingBottom: "3px",
    marginBottom: "8px",
    marginTop: "14px",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#1f2937",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.45",
        padding: "28px 32px 24px 32px",
        boxSizing: "border-box",
        width: "794px",
        minHeight: "auto",
      }}
    >
      {/* Header — Accent left bar */}
      <div
        style={{
          borderLeft: `4px solid ${purple}`,
          paddingLeft: "14px",
          paddingBottom: "8px",
          marginBottom: "14px",
        }}
      >
        <h1 style={{ fontSize: "21px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "-0.3px", margin: 0 }}>
          {personalInfo.fullName || resume.fullName || "Creative Leader"}
        </h1>
        <p style={{ fontSize: "10px", fontWeight: "800", color: purple, textTransform: "uppercase", letterSpacing: "1px", margin: "3px 0 6px 0" }}>
          {personalInfo.professionalTitle || resume.professionalTitle}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 10px", fontSize: "10px", color: "#374151", fontWeight: "600" }}>
          {(personalInfo.email || resume.email) && <span>{personalInfo.email || resume.email}</span>}
          {(personalInfo.phone || resume.phone) && <span>• {personalInfo.phone || resume.phone}</span>}
          {(personalInfo.location || resume.location) && <span>• {personalInfo.location || resume.location}</span>}
          {(personalInfo.portfolio || resume.portfolioUrl) && (
            <span style={{ color: purple, fontWeight: "700" }}>• {personalInfo.portfolio || resume.portfolioUrl}</span>
          )}
          {(personalInfo.linkedIn || resume.linkedinUrl) && (
            <span style={{ color: purple, fontWeight: "700" }}>• {personalInfo.linkedIn || resume.linkedinUrl}</span>
          )}
        </div>
      </div>

      {/* About & Professional Bio */}
      {(summary || resume.professionalSummary) && (
        <div>
          <div style={sectionTitle}>About & Professional Bio</div>
          <div
            style={{
              background: purpleLight,
              border: `1px solid ${purpleBorder}`,
              borderRadius: "6px",
              padding: "10px 14px",
              marginBottom: "4px",
            }}
          >
            <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>
              {summary || resume.professionalSummary}
            </p>
          </div>
        </div>
      )}

      {/* Experience & Design Work */}
      {experience.length > 0 && (
        <div>
          <div style={sectionTitle}>Experience & Design Work</div>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#111827" }}>
                  {exp.position} — <span style={{ color: purple, fontWeight: "700" }}>{exp.company}</span>
                </span>
                <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600" }}>
                  {exp.startDate} – {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {renderBullets(exp.description)}
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Highlights */}
      {projects.length > 0 && (
        <div>
          <div style={sectionTitle}>Portfolio Highlights & Applications</div>
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#111827" }}>{proj.projectName || proj.name}</span>
                {proj.technologies && (
                  <span style={{ fontSize: "9.5px", color: purple, fontWeight: "600" }}>[{formatTech(proj.technologies)}]</span>
                )}
              </div>
              {(proj.liveUrl || proj.githubUrl) && (
                <p style={{ fontSize: "9.5px", color: purple, fontWeight: "600", margin: "1px 0" }}>
                  {proj.liveUrl && `Live: ${proj.liveUrl}`}
                  {proj.liveUrl && proj.githubUrl && " | "}
                  {proj.githubUrl && `GitHub: ${proj.githubUrl}`}
                </p>
              )}
              {renderBullets(proj.description)}
            </div>
          ))}
        </div>
      )}

      {/* Core Tech & Tools */}
      {skillsArr.length > 0 && (
        <div>
          <div style={sectionTitle}>Core Tech & Tools</div>
          <div>
            {skillsArr.map((sk, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: purpleLight,
                  color: purple,
                  border: `1px solid ${purpleBorder}`,
                  borderRadius: "20px",
                  padding: "1px 8px",
                  fontSize: "9px",
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

      {/* Education */}
      {education.length > 0 && (
        <div>
          <div style={sectionTitle}>Education</div>
          {education.map((edu, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#111827" }}>
                {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} — {edu.institution}
                {edu.grade ? <span style={{ fontWeight: "600", color: purple }}> ({edu.grade})</span> : ""}
              </span>
              <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600" }}>{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <div style={sectionTitle}>Certifications</div>
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
          <div style={sectionTitle}>Achievements & Recognition</div>
          {achievements.map((ach, idx) => (
            <div key={idx} style={{ marginBottom: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#111827" }}>{ach.title || ach.achievementTitle}</span>
                {ach.date && <span style={{ fontSize: "9.5px", color: "#6B7280" }}>{ach.date}</span>}
              </div>
              {ach.description && <p style={{ fontSize: "10px", color: "#374151", margin: "2px 0 0 0" }}>{ach.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div>
          <div style={sectionTitle}>Languages</div>
          <p style={{ fontSize: "10.5px", color: "#374151", fontWeight: "600", margin: 0 }}>
            {languages.map((l) => (typeof l === "string" ? l : `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`)).join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
