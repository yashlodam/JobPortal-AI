package com.jobportal.resumebuilder.dto;

import java.util.List;

import com.jobportal.resumebuilder.enums.ResumeTemplate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for full resume update / frontend debounced autosave.
 */
public class ResumeUpdateRequest {

    @NotBlank(message = "Resume name is required")
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
    private Long version;

    private List<@Valid EducationDTO> educationList;
    private List<@Valid ExperienceDTO> experienceList;
    private List<@Valid ProjectDTO> projectList;
    private List<@Valid CertificationDTO> certificationList;
    private List<@Valid AchievementDTO> achievementList;

    private List<String> skills;
    private List<String> languages;

    public ResumeUpdateRequest() {}

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
}
