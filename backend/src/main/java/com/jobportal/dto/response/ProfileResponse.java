package com.jobportal.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.domain.Availability;
import com.jobportal.domain.ExperienceLevel;

/**
 * Full profile response DTO — replaces ProfileDTO, TopHeaderProfile, and all the scattered DTOs.
 * Never exposes the Profile entity directly.
 */
public class ProfileResponse {

    private Long id;

    // User info
    private Long userId;
    private String name;
    private String email;

    // Header
    private String headline;
    private String currentCompany;
    private String location;
    private Availability availability;
    private ExperienceLevel experienceLevel;

    // About
    private String about;

    // Images
    private String profileImage;
    private String bannerImage;

    // Links
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    // Collections
    private List<String> skills;
    private List<String> languages;
    private List<ExperienceResponse> experiences;
    private List<EducationResponse> educations;
    private List<CertificationResponse> certifications;

    // Resume
    private String resumeUrl;
    private String resumeName;
    private List<ResumeResponse> resumes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public List<ExperienceResponse> getExperiences() { return experiences; }
    public void setExperiences(List<ExperienceResponse> experiences) { this.experiences = experiences; }

    public List<EducationResponse> getEducations() { return educations; }
    public void setEducations(List<EducationResponse> educations) { this.educations = educations; }

    public List<CertificationResponse> getCertifications() { return certifications; }
    public void setCertifications(List<CertificationResponse> certifications) { this.certifications = certifications; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public List<ResumeResponse> getResumes() { return resumes; }
    public void setResumes(List<ResumeResponse> resumes) { this.resumes = resumes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
