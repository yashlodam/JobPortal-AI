package com.jobportal.resumebuilder.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.resumebuilder.enums.ResumeTemplate;

/**
 * Complete response DTO representing a structured resume document.
 */
public class ResumeDocumentResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String resumeName;
    private String professionalTitle;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String professionalSummary;
    private ResumeTemplate template;
    private int completionPercentage;
    private Long version;

    private List<EducationDTO> educationList;
    private List<ExperienceDTO> experienceList;
    private List<ProjectDTO> projectList;
    private List<CertificationDTO> certificationList;
    private List<AchievementDTO> achievementList;
    private List<String> skills;
    private List<String> languages;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResumeDocumentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public String getProfessionalTitle() { return professionalTitle; }
    public void setProfessionalTitle(String professionalTitle) { this.professionalTitle = professionalTitle; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String professionalSummary) { this.professionalSummary = professionalSummary; }

    public ResumeTemplate getTemplate() { return template; }
    public void setTemplate(ResumeTemplate template) { this.template = template; }

    public int getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(int completionPercentage) { this.completionPercentage = completionPercentage; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public List<EducationDTO> getEducationList() { return educationList; }
    public void setEducationList(List<EducationDTO> educationList) { this.educationList = educationList; }

    public List<ExperienceDTO> getExperienceList() { return experienceList; }
    public void setExperienceList(List<ExperienceDTO> experienceList) { this.experienceList = experienceList; }

    public List<ProjectDTO> getProjectList() { return projectList; }
    public void setProjectList(List<ProjectDTO> projectList) { this.projectList = projectList; }

    public List<CertificationDTO> getCertificationList() { return certificationList; }
    public void setCertificationList(List<CertificationDTO> certificationList) { this.certificationList = certificationList; }

    public List<AchievementDTO> getAchievementList() { return achievementList; }
    public void setAchievementList(List<AchievementDTO> achievementList) { this.achievementList = achievementList; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
