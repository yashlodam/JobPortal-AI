/**
 * src/features/resume-builder/components/Templates/ModernTemplate.jsx
 * 2. Modern: Commercial-grade ATS layout — density-optimized for 1-page A4 output.
 * Engineered for tech professionals targeting Google, Microsoft, Amazon, Meta, Apple.
 * Spacing tuned to FlowCV / Resume.io / Novorésumé density standards.
 */

import React from "react";

export default function ModernTemplate({ resume }) {
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

  const renderBulletPoints = (text) => {
    if (!text) return null;
    const bullets = text
      .split("\n")
      .map((b) => b.trim().replace(/^[-•*]\s*/, ""))
      .filter(Boolean);

    if (bullets.length > 1) {
      return (
        <ul style={{ margin: "2px 0 0 0", padding: "0 0 0 14px", listStyleType: "disc" }}>
          {bullets.map((b, idx) => (
            <li key={idx} style={{ fontSize: "10.5px", color: "#475569", lineHeight: "1.45", marginBottom: "1px" }}>
              {b}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p style={{ fontSize: "10.5px", color: "#475569", lineHeight: "1.45", marginTop: "2px" }}>
        {text}
      </p>
    );
  };

  const getCategorizedSkills = () => {
    if (Array.isArray(skills)) {
      return { "Core Skills": skills };
    }
    if (typeof skills === "object" && skills !== null) {
      const categories = {};
      if (skills.technical?.length > 0) categories["Languages"] = skills.technical;
      if (skills.frameworks?.length > 0) categories["Frameworks"] = skills.frameworks;
      if (skills.tools?.length > 0) categories["Tools"] = skills.tools;
      if (skills.soft?.length > 0) categories["Soft Skills"] = skills.soft;
      return Object.keys(categories).length > 0 ? categories : {};
    }
    return {};
  };

  const categorizedSkills = getCategorizedSkills();

  // Inline styles chosen specifically to produce identical PDF output:
  // No Tailwind class → no oklch → no html2canvas color parse errors.
  const s = {
    root: {
      background: "#ffffff",
      color: "#0f172a",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: "11px",
      lineHeight: "1.4",
      display: "grid",
      gridTemplateColumns: "2fr 3fr",
      gap: "0",
      padding: "28px 28px 24px 28px",
      boxSizing: "border-box",
      width: "794px",
      minHeight: "auto",
    },
    sidebar: {
      paddingRight: "18px",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    main: {
      paddingLeft: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    name: {
      fontSize: "19px",
      fontWeight: "900",
      color: "#0f172a",
      textTransform: "uppercase",
      letterSpacing: "-0.5px",
      lineHeight: "1.1",
      margin: 0,
    },
    title: {
      fontSize: "10px",
      fontWeight: "800",
      color: "#1e3a8a",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginTop: "3px",
    },
    sectionTitle: {
      fontSize: "9.5px",
      fontWeight: "900",
      color: "#0f172a",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: "1.5px solid #cbd5e1",
      paddingBottom: "3px",
      marginBottom: "6px",
    },
    sectionTitleMain: {
      fontSize: "9.5px",
      fontWeight: "900",
      color: "#0f172a",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: "1.5px solid #0f172a",
      paddingBottom: "3px",
      marginBottom: "6px",
    },
    contactText: {
      fontSize: "10px",
      color: "#334155",
      fontWeight: "500",
      lineHeight: "1.5",
      wordBreak: "break-all",
      margin: "1px 0",
    },
    contactLink: {
      fontSize: "10px",
      color: "#1e40af",
      fontWeight: "600",
      wordBreak: "break-all",
      margin: "1px 0",
    },
    chip: {
      display: "inline-block",
      background: "#f1f5f9",
      color: "#1e293b",
      border: "1px solid #e2e8f0",
      borderRadius: "3px",
      padding: "1px 5px",
      fontSize: "9px",
      fontWeight: "700",
      marginRight: "3px",
      marginBottom: "3px",
    },
    chipMono: {
      display: "inline-block",
      background: "#f1f5f9",
      color: "#1e293b",
      border: "1px solid #e2e8f0",
      borderRadius: "3px",
      padding: "1px 4px",
      fontSize: "8.5px",
      fontFamily: "monospace",
      fontWeight: "700",
      marginRight: "2px",
      marginBottom: "2px",
    },
    catLabel: {
      fontSize: "9px",
      fontWeight: "800",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      marginBottom: "3px",
    },
    expPosition: {
      fontSize: "11px",
      fontWeight: "800",
      color: "#0f172a",
    },
    expDate: {
      fontSize: "10px",
      fontWeight: "600",
      color: "#64748b",
    },
    expCompany: {
      fontSize: "10.5px",
      fontWeight: "700",
      color: "#1e3a8a",
      marginTop: "1px",
    },
    projName: {
      fontSize: "11px",
      fontWeight: "800",
      color: "#0f172a",
    },
    projLink: {
      fontSize: "9px",
      fontWeight: "700",
      color: "#1e40af",
    },
    achTitle: {
      fontSize: "10.5px",
      fontWeight: "700",
      color: "#0f172a",
    },
    achDesc: {
      fontSize: "10px",
      color: "#475569",
      lineHeight: "1.4",
      marginTop: "1px",
    },
    eduDegree: {
      fontSize: "10.5px",
      fontWeight: "800",
      color: "#0f172a",
    },
    eduInst: {
      fontSize: "10px",
      fontWeight: "500",
      color: "#475569",
    },
    eduDate: {
      fontSize: "9.5px",
      fontWeight: "600",
      color: "#94a3b8",
    },
  };

  return (
    <div id="printable-resume-sheet" style={s.root}>
      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <div style={s.sidebar}>
        {/* Name & Title */}
        <div>
          <h1 style={s.name}>{personalInfo.fullName || resume.fullName || "Your Name"}</h1>
          <p style={s.title}>{personalInfo.professionalTitle || resume.professionalTitle}</p>
        </div>

        {/* Contact Details */}
        <div>
          <div style={s.sectionTitle}>Contact</div>
          {(personalInfo.email || resume.email) && (
            <p style={s.contactText}>{personalInfo.email || resume.email}</p>
          )}
          {(personalInfo.phone || resume.phone) && (
            <p style={s.contactText}>{personalInfo.phone || resume.phone}</p>
          )}
          {(personalInfo.location || resume.location) && (
            <p style={s.contactText}>{personalInfo.location || resume.location}</p>
          )}
          {(personalInfo.linkedIn || resume.linkedinUrl) && (
            <p style={s.contactLink}>{personalInfo.linkedIn || resume.linkedinUrl}</p>
          )}
          {(personalInfo.gitHub || resume.githubUrl) && (
            <p style={s.contactLink}>{personalInfo.gitHub || resume.githubUrl}</p>
          )}
          {(personalInfo.portfolio || resume.portfolioUrl) && (
            <p style={s.contactLink}>{personalInfo.portfolio || resume.portfolioUrl}</p>
          )}
        </div>

        {/* Technical Competencies */}
        {Object.keys(categorizedSkills).length > 0 && (
          <div>
            <div style={s.sectionTitle}>Technical Skills</div>
            {Object.entries(categorizedSkills).map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: "7px" }}>
                <div style={s.catLabel}>{cat}</div>
                <div>
                  {list.map((sk, idx) => (
                    <span key={idx} style={s.chip}>{sk}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <div style={s.sectionTitle}>Languages</div>
            <p style={{ fontSize: "10px", color: "#334155", fontWeight: "600", lineHeight: "1.5" }}>
              {languages.map((l) => (typeof l === "string" ? l : l.language)).join(" • ")}
            </p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <div style={s.sectionTitle}>Education</div>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: "7px" }}>
                <p style={s.eduDegree}>{edu.degree}</p>
                <p style={s.eduInst}>{edu.institution}{edu.grade ? ` (${edu.grade})` : ""}</p>
                <p style={s.eduDate}>{edu.startDate} – {edu.endDate}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <div style={s.sectionTitle}>Certifications</div>
            {certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "10.5px", fontWeight: "700", color: "#0f172a" }}>
                  {cert.name || cert.certificationName}
                </p>
                {(cert.issuingOrganization || cert.issuer) && (
                  <p style={{ fontSize: "10px", color: "#475569" }}>
                    {cert.issuingOrganization || cert.issuer}
                  </p>
                )}
                <p style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: "600" }}>
                  {cert.issueDate || cert.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
      <div style={s.main}>
        {/* Professional Summary */}
        {(summary || resume.professionalSummary) && (
          <div>
            <div style={s.sectionTitleMain}>Professional Summary</div>
            <p style={{ fontSize: "10.5px", color: "#334155", lineHeight: "1.5", fontWeight: "400" }}>
              {summary || resume.professionalSummary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div>
            <div style={s.sectionTitleMain}>Work Experience</div>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: "9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={s.expPosition}>{exp.position}</span>
                  <span style={s.expDate}>
                    {exp.startDate} – {exp.currentlyWorking || exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p style={s.expCompany}>
                  {exp.company}{exp.location ? ` • ${exp.location}` : ""}
                </p>
                {renderBulletPoints(exp.description)}
              </div>
            ))}
          </div>
        )}

        {/* Featured Projects */}
        {projects.length > 0 && (
          <div>
            <div style={s.sectionTitleMain}>Technical Projects</div>
            {projects.map((proj, idx) => {
              const techList = formatTech(proj.technologies);
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: "9px",
                    paddingLeft: "9px",
                    borderLeft: "2px solid #0f172a",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={s.projName}>{proj.projectName || proj.name}</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {proj.githubUrl && <span style={s.projLink}>GitHub ↗</span>}
                      {proj.liveUrl && <span style={s.projLink}>Live ↗</span>}
                    </div>
                  </div>
                  {techList.length > 0 && (
                    <div style={{ margin: "3px 0" }}>
                      {techList.map((t, tIdx) => (
                        <span key={tIdx} style={s.chipMono}>{t}</span>
                      ))}
                    </div>
                  )}
                  {renderBulletPoints(proj.description)}
                </div>
              );
            })}
          </div>
        )}

        {/* Key Achievements */}
        {achievements.length > 0 && (
          <div>
            <div style={s.sectionTitleMain}>Key Achievements</div>
            {achievements.map((ach, idx) => (
              <div key={idx} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={s.achTitle}>{ach.title || ach.achievementTitle}</span>
                  {ach.date && (
                    <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "600" }}>{ach.date}</span>
                  )}
                </div>
                {ach.description && <p style={s.achDesc}>{ach.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
