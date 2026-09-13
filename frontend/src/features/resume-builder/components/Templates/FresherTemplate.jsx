/**
 * src/features/resume-builder/components/Templates/FresherTemplate.jsx
 * 3. Fresher / Graduate: Education-first layout for campus placements and new graduates.
 * 100% inline styles — zero Tailwind / oklch — perfect html2canvas PDF output.
 * Fixed: proj.projectName || proj.name (was only proj.name before).
 */

import React from "react";

export default function FresherTemplate({ resume }) {
  if (!resume) return null;

  const {
    personalInfo = {},
    summary = "",
    education = [],
    projects = [],
    skills = {},
    certifications = [],
    achievements = [],
    languages = [],
    experience = [],
  } = resume;

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

  const green = "#065f46";
  const greenMid = "#047857";
  const greenLight = "#ecfdf5";
  const greenBorder = "#a7f3d0";
  const dark = "#064e3b";

  const sectionTitle = {
    fontSize: "9.5px",
    fontWeight: "900",
    color: dark,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    borderBottom: `1.5px solid ${greenBorder}`,
    paddingBottom: "3px",
    marginBottom: "8px",
    marginTop: "14px",
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#111827",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.45",
        padding: "28px 32px 24px 32px",
        boxSizing: "border-box",
        width: "794px",
        minHeight: "auto",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: `2.5px solid ${green}`, paddingBottom: "12px", marginBottom: "14px" }}>
        <h1 style={{ fontSize: "21px", fontWeight: "900", color: dark, textTransform: "uppercase", letterSpacing: "-0.3px", margin: "0 0 3px 0" }}>
          {personalInfo.fullName || resume.fullName || "Graduate Candidate"}
        </h1>
        <p style={{ fontSize: "10px", fontWeight: "800", color: greenMid, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px 0" }}>
          {personalInfo.professionalTitle || resume.professionalTitle}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 10px", fontSize: "10px", color: "#374151", fontWeight: "600" }}>
          {(personalInfo.email || resume.email) && <span>{personalInfo.email || resume.email}</span>}
          {(personalInfo.phone || resume.phone) && <span>• {personalInfo.phone || resume.phone}</span>}
          {(personalInfo.location || resume.location) && <span>• {personalInfo.location || resume.location}</span>}
          {(personalInfo.linkedIn || resume.linkedinUrl) && (
            <span style={{ color: greenMid }}>• {personalInfo.linkedIn || resume.linkedinUrl}</span>
          )}
          {(personalInfo.gitHub || resume.githubUrl) && (
            <span style={{ color: greenMid }}>• {personalInfo.gitHub || resume.githubUrl}</span>
          )}
        </div>
      </div>

      {/* Objective / Summary */}
      {(summary || resume.professionalSummary) && (
        <div>
          <div style={sectionTitle}>Career Objective</div>
          <p style={{ fontSize: "10.5px", color: "#374151", lineHeight: "1.6", margin: 0 }}>
            {summary || resume.professionalSummary}
          </p>
        </div>
      )}

      {/* Education FIRST — key for freshers */}
      {education.length > 0 && (
        <div>
          <div style={sectionTitle}>Education & Academics</div>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: dark }}>
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                </span>
                <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600" }}>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <p style={{ fontSize: "10.5px", color: "#374151", margin: "1px 0", fontWeight: "600" }}>
                {edu.institution}
                {edu.grade && <span style={{ color: greenMid, fontWeight: "800" }}> — {edu.grade}</span>}
              </p>
              {edu.description && <p style={{ fontSize: "10px", color: "#6B7280", margin: "2px 0 0 0" }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Technical Projects */}
      {projects.length > 0 && (
        <div>
          <div style={sectionTitle}>Academic & Personal Projects</div>
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: "9px", paddingLeft: "10px", borderLeft: `2px solid ${greenBorder}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {/* FIXED: proj.projectName || proj.name */}
                <span style={{ fontSize: "11px", fontWeight: "800", color: dark }}>{proj.projectName || proj.name}</span>
                {proj.technologies && (
                  <span style={{ fontSize: "9px", fontFamily: "monospace", color: greenMid, fontWeight: "700" }}>
                    [{Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies}]
                  </span>
                )}
              </div>
              {proj.githubUrl && <p style={{ fontSize: "9.5px", color: greenMid, fontWeight: "600", margin: "1px 0" }}>{proj.githubUrl}</p>}
              {renderBullets(proj.description)}
            </div>
          ))}
        </div>
      )}

      {/* Work Experience (if any — some freshers have internships) */}
      {experience.length > 0 && (
        <div>
          <div style={sectionTitle}>Internship & Work Experience</div>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: dark }}>
                  {exp.position} — <span style={{ color: greenMid }}>{exp.company}</span>
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

      {/* Technical Skills */}
      {skillsArr.length > 0 && (
        <div>
          <div style={sectionTitle}>Technical Skills</div>
          <div>
            {skillsArr.map((sk, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: greenLight,
                  color: green,
                  border: `1px solid ${greenBorder}`,
                  borderRadius: "3px",
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <div style={sectionTitle}>Certifications & Online Courses</div>
          {certifications.map((cert, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <div>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: dark }}>{cert.name || cert.certificationName}</span>
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
          <div style={sectionTitle}>Achievements & Awards</div>
          {achievements.map((ach, idx) => (
            <div key={idx} style={{ marginBottom: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10.5px", fontWeight: "800", color: dark }}>{ach.title || ach.achievementTitle}</span>
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
