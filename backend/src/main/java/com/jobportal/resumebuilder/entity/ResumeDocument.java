package com.jobportal.resumebuilder.entity;

import java.util.ArrayList;

import java.util.List;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.jobportal.entity.Auditable;
import com.jobportal.entity.User;
import com.jobportal.resumeanalysis.converter.StringListConverter;
import com.jobportal.resumebuilder.enums.ResumeTemplate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * Main entity for a structured resume document created via Resume Builder.
 */
@Entity
@Table(name = "resume_documents")
public class ResumeDocument extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_name", nullable = false)
    private String resumeName;

    @Column(name = "professional_title")
    private String professionalTitle;

    @Column(name = "full_name")
    private String fullName;

    private String email;
    private String phone;
    private String location;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "professional_summary", columnDefinition = "TEXT")
    private String professionalSummary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResumeTemplate template = ResumeTemplate.MODERN;

    @Column(name = "completion_percentage", nullable = false)
    private int completionPercentage = 0;

    @Version
    private Long version;

    // ── Child Sections ───────────────────────────────────────────────────────

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<ResumeEducation> educationList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<ResumeExperience> experienceList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<ResumeProject> projectList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<ResumeCertification> certificationList = new ArrayList<>();

    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    private List<ResumeAchievement> achievementList = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "skills", columnDefinition = "TEXT")
    private List<String> skills = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "languages", columnDefinition = "TEXT")
    private List<String> languages = new ArrayList<>();

    public ResumeDocument() {}

    // ── Helper methods to manage bi-directional relationships ────────────────

    public void addEducation(ResumeEducation edu) {
        educationList.add(edu);
        edu.setResume(this);
    }

    public void addExperience(ResumeExperience exp) {
        experienceList.add(exp);
        exp.setResume(this);
    }

    public void addProject(ResumeProject proj) {
        projectList.add(proj);
        proj.setResume(this);
    }

    public void addCertification(ResumeCertification cert) {
        certificationList.add(cert);
        cert.setResume(this);
    }

    public void addAchievement(ResumeAchievement ach) {
        achievementList.add(ach);
        ach.setResume(this);
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public List<ResumeEducation> getEducationList() { return educationList; }
    public void setEducationList(List<ResumeEducation> educationList) { this.educationList = educationList; }

    public List<ResumeExperience> getExperienceList() { return experienceList; }
    public void setExperienceList(List<ResumeExperience> experienceList) { this.experienceList = experienceList; }

    public List<ResumeProject> getProjectList() { return projectList; }
    public void setProjectList(List<ResumeProject> projectList) { this.projectList = projectList; }

    public List<ResumeCertification> getCertificationList() { return certificationList; }
    public void setCertificationList(List<ResumeCertification> certificationList) { this.certificationList = certificationList; }

    public List<ResumeAchievement> getAchievementList() { return achievementList; }
    public void setAchievementList(List<ResumeAchievement> achievementList) { this.achievementList = achievementList; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
}
