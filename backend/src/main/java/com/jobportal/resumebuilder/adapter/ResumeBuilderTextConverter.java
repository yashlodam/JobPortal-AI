package com.jobportal.resumebuilder.adapter;

import org.springframework.stereotype.Component;

import com.jobportal.resumebuilder.entity.ResumeAchievement;
import com.jobportal.resumebuilder.entity.ResumeCertification;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeEducation;
import com.jobportal.resumebuilder.entity.ResumeExperience;
import com.jobportal.resumebuilder.entity.ResumeProject;

/**
 * Adapter component that converts a structured {@link ResumeDocument} into a clean plain-text
 * representation suitable for passing into the existing AI Resume Analyzer module.
 */
@Component
public class ResumeBuilderTextConverter {

    public String toPlainText(ResumeDocument doc) {
        if (doc == null) return "";

        StringBuilder sb = new StringBuilder();

        // Contact / Personal Info
        if (doc.getFullName() != null) sb.append(doc.getFullName()).append("\n");
        if (doc.getProfessionalTitle() != null) sb.append(doc.getProfessionalTitle()).append("\n");
        if (doc.getEmail() != null) sb.append("Email: ").append(doc.getEmail()).append(" | ");
        if (doc.getPhone() != null) sb.append("Phone: ").append(doc.getPhone()).append(" | ");
        if (doc.getLocation() != null) sb.append("Location: ").append(doc.getLocation());
        sb.append("\n");

        if (doc.getLinkedinUrl() != null) sb.append("LinkedIn: ").append(doc.getLinkedinUrl()).append("\n");
        if (doc.getGithubUrl() != null) sb.append("GitHub: ").append(doc.getGithubUrl()).append("\n");
        sb.append("\n");

        // Professional Summary
        if (doc.getProfessionalSummary() != null && !doc.getProfessionalSummary().isBlank()) {
            sb.append("PROFESSIONAL SUMMARY\n");
            sb.append(doc.getProfessionalSummary()).append("\n\n");
        }

        // Skills
        if (doc.getSkills() != null && !doc.getSkills().isEmpty()) {
            sb.append("SKILLS\n");
            sb.append(String.join(", ", doc.getSkills())).append("\n\n");
        }

        // Experience
        if (doc.getExperienceList() != null && !doc.getExperienceList().isEmpty()) {
            sb.append("PROFESSIONAL EXPERIENCE\n");
            for (ResumeExperience exp : doc.getExperienceList()) {
                sb.append(exp.getPosition()).append(" — ").append(exp.getCompany());
                if (exp.getLocation() != null) sb.append(" (").append(exp.getLocation()).append(")");
                sb.append("\n");
                sb.append(exp.getStartDate() != null ? exp.getStartDate() : "").append(" - ")
                  .append(exp.isCurrentlyWorking() ? "Present" : (exp.getEndDate() != null ? exp.getEndDate() : "")).append("\n");
                if (exp.getDescription() != null) sb.append(exp.getDescription()).append("\n");
                sb.append("\n");
            }
        }

        // Projects
        if (doc.getProjectList() != null && !doc.getProjectList().isEmpty()) {
            sb.append("PROJECTS\n");
            for (ResumeProject proj : doc.getProjectList()) {
                sb.append(proj.getProjectName());
                if (proj.getTechnologies() != null) sb.append(" [").append(proj.getTechnologies()).append("]");
                sb.append("\n");
                if (proj.getDescription() != null) sb.append(proj.getDescription()).append("\n");
                sb.append("\n");
            }
        }

        // Education
        if (doc.getEducationList() != null && !doc.getEducationList().isEmpty()) {
            sb.append("EDUCATION\n");
            for (ResumeEducation edu : doc.getEducationList()) {
                sb.append(edu.getDegree());
                if (edu.getFieldOfStudy() != null) sb.append(" in ").append(edu.getFieldOfStudy());
                sb.append(" — ").append(edu.getInstitution()).append("\n");
                if (edu.getStartDate() != null) sb.append(edu.getStartDate()).append(" - ").append(edu.getEndDate() != null ? edu.getEndDate() : "Present").append("\n");
                sb.append("\n");
            }
        }

        // Certifications
        if (doc.getCertificationList() != null && !doc.getCertificationList().isEmpty()) {
            sb.append("CERTIFICATIONS\n");
            for (ResumeCertification cert : doc.getCertificationList()) {
                sb.append(cert.getName()).append(" (").append(cert.getIssuingOrganization() != null ? cert.getIssuingOrganization() : "").append(")\n");
            }
            sb.append("\n");
        }

        // Achievements
        if (doc.getAchievementList() != null && !doc.getAchievementList().isEmpty()) {
            sb.append("ACHIEVEMENTS & AWARDS\n");
            for (ResumeAchievement ach : doc.getAchievementList()) {
                sb.append("- ").append(ach.getTitle());
                if (ach.getDescription() != null) sb.append(": ").append(ach.getDescription());
                sb.append("\n");
            }
        }

        return sb.toString();
    }
}
