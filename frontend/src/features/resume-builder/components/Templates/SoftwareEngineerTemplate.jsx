/**
 * src/features/resume-builder/components/Templates/SoftwareEngineerTemplate.jsx
 * 4. Software Engineer: Tech-first layout with GitHub links, monospace skill stack, engineering summary.
 * 100% inline styles — zero Tailwind / oklch — perfect html2canvas PDF output.
 */

import React from "react";

export default function SoftwareEngineerTemplate({ resume }) {
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
    if (Array.isArray(tech)) return tech;
    if (typeof tech === "string") return tech.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
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
            <li key={i} style={{ fontSize: "10.5px", color: "#334155", lineHeight: "1.5", marginBottom: "2px" }}>{b}</li>
          ))}
        </ul>
      );
    }
    return <p style={{ fontSize: "10.5px", color: "#334155", lineHeight: "1.5", marginTop: "2px", whiteSpace: "pre-wrap" }}>{text}</p>;
  };

  const skillsArr = getSkillsList();

  const blue = "#1e3a8a";
  const blueLight = "#dbeafe";
  const blueBorder = "#bfdbfe";
  const dark = "#0f172a";

  return (
    <div
      style={{
        background: "#ffffff",
        color: dark,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.45",
        padding: "28px 32px 24px 32px",
        boxSizing: "border-box",
        width: "794px",
        minHeight: "auto",
      }}
    >
      {/* Header — Left name / Right contact */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: `2.5px solid ${blue}`,
          paddingBottom: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "21px", fontWeight: "900", color: "#0c1a40", textTransform: "uppercase", letterSpacing: "-0.3px", margin: 0 }}>
            {personalInfo.fullName || resume.fullName || "Software Engineer"}
          </h1>
          <p style={{ fontSize: "10px", fontWeight: "800", color: blue, textTransform: "uppercase", letterSpacing: "1px", margin: "3px 0 0 0" }}>
            {personalInfo.professionalTitle || resume.professionalTitle}
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "10px", color: "#374151", lineHeight: "1.7", fontWeight: "600" }}>
          {(personalInfo.email || resume.email) && <div>{personalInfo.email || resume.email}</div>}
          {(personalInfo.phone || resume.phone) && <div>{personalInfo.phone || resume.phone}</div>}
          {(personalInfo.location || resume.location) && <div>{personalInfo.location || resume.location}</div>}
          {(personalInfo.gitHub || resume.githubUrl) && (
            <div style={{ color: blue, fontWeight: "700" }}>{personalInfo.gitHub || resume.githubUrl}</div>
          )}
          {(personalInfo.linkedIn || resume.linkedinUrl) && (
            <div style={{ color: blue, fontWeight: "700" }}>{personalInfo.linkedIn || resume.linkedinUrl}</div>
          )}
          {(personalInfo.portfolio || resume.portfolioUrl) && (
            <div style={{ color: blue, fontWeight: "700" }}>{personalInfo.portfolio || resume.portfolioUrl}</div>
          )}
        </div>
      </div>

      {/* Engineering Summary */}
      {(summary || resume.professionalSummary) && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "6px" }}>
            Engineering Summary
          </div>
          <p style={{ fontSize: "10.5px", color: "#334155", lineHeight: "1.6", margin: 0 }}>
            {summary || resume.professionalSummary}
          </p>
        </div>
      )}

      {/* Technical Stack Banner */}
      {skillsArr.length > 0 && (
        <div
          style={{
            background: blueLight,
            border: `1px solid ${blueBorder}`,
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "9.5px", fontWeight: "900", color: "#0c1a40", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "7px" }}>
            Technical Stack & Languages
          </div>
          <div>
            {skillsArr.map((sk, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  border: `1px solid ${blueBorder}`,
                  borderRadius: "4px",
                  padding: "1px 6px",
                  fontSize: "9px",
                  fontFamily: "monospace",
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

      {/* Professional Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "8px" }}>
            Professional Experience
          </div>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: dark }}>
                  {exp.position} — <span style={{ color: blue, fontWeight: "700" }}>{exp.company}</span>
                </span>
                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
                  {exp.startDate} – {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {renderBullets(exp.description)}
            </div>
          ))}
        </div>
      )}

      {/* Featured Repositories & Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "8px" }}>
            Featured Repositories & Key Projects
          </div>
          {projects.map((proj, idx) => {
            const techList = formatTech(proj.technologies);
            return (
              <div key={idx} style={{ marginBottom: "9px", paddingLeft: "10px", borderLeft: `2px solid ${blue}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: dark }}>{proj.projectName || proj.name}</span>
                  {techList.length > 0 && (
                    <span style={{ fontSize: "9px", fontFamily: "monospace", color: blue, fontWeight: "700" }}>
                      [{techList.join(", ")}]
                    </span>
                  )}
                </div>
                {proj.githubUrl && (
                  <p style={{ fontSize: "9.5px", color: blue, fontFamily: "monospace", fontWeight: "600", margin: "1px 0" }}>{proj.githubUrl}</p>
                )}
                {renderBullets(proj.description)}
              </div>
            );
          })}
        </div>
      )}

      {/* Education & Certs — 2 column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {education.length > 0 && (
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "7px" }}>
              Education
            </div>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: "7px" }}>
                <p style={{ fontSize: "10.5px", fontWeight: "800", color: dark, margin: 0 }}>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</p>
                <p style={{ fontSize: "10px", color: "#374151", margin: "1px 0" }}>{edu.institution} {edu.grade ? `(${edu.grade})` : ""}</p>
                <p style={{ fontSize: "9.5px", color: "#64748b", margin: 0 }}>{edu.startDate} – {edu.endDate}</p>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "7px" }}>
              Certifications
            </div>
            {certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: "7px" }}>
                <p style={{ fontSize: "10.5px", fontWeight: "800", color: dark, margin: 0 }}>{cert.name || cert.certificationName}</p>
                <p style={{ fontSize: "10px", color: "#374151", margin: "1px 0" }}>{cert.issuingOrganization || cert.issuer} • {cert.issueDate || cert.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: `1.5px solid ${blue}`, paddingBottom: "3px", marginBottom: "7px" }}>
            Achievements
          </div>
          {achievements.map((ach, idx) => (
            <div key={idx} style={{ marginBottom: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: dark }}>{ach.title || ach.achievementTitle}</span>
                {ach.date && <span style={{ fontSize: "9.5px", color: "#64748b" }}>{ach.date}</span>}
              </div>
              {ach.description && <p style={{ fontSize: "10px", color: "#374151", margin: "2px 0 0 0" }}>{ach.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
