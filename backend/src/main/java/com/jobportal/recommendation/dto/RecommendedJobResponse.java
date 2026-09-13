package com.jobportal.recommendation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;

/**
 * Response DTO for a single recommended job, enriched with match metadata.
 * Extends the standard job summary with recommendation-specific fields.
 */
public class RecommendedJobResponse {

    // ── Standard Job Fields ───────────────────────────────────────────────────

    private Long id;
    private String jobTitle;
    private String category;
    private String city;
    private String state;
    private String country;
    private WorkingMode workingMode;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private Long minimumSalary;
    private Long maximumSalary;
    private String currency;
    private Integer vacancies;
    private Boolean featured;
    private Boolean urgentHiring;
    private Boolean easyApply;
    private LocalDate applicationDeadline;
    private LocalDateTime postedAt;

    // Company info (flattened)
    private Long companyId;
    private String companyName;
    private String companyLogo;

    // ── Recommendation-Specific Fields ───────────────────────────────────────

    /**
     * Composite match percentage (0-100).
     * Computed by the deterministic scoring engine.
     */
    private int matchPercentage;

    /**
     * Human-readable grade based on matchPercentage.
     * EXCELLENT (>=85), GREAT (>=70), GOOD (>=55), FAIR (>=40), LOW (<40)
     */
    private String matchGrade;

    /**
     * Candidate skills that matched job's required skills.
     */
    private List<String> matchedSkills;

    /**
     * Job's required skills the candidate is missing.
     */
    private List<String> missingSkills;

    /**
     * Score breakdown for transparency — helps user understand why this job was recommended.
     */
    private int skillMatchScore;
    private int experienceMatchScore;
    private int locationMatchScore;
    private int freshnessScore;

    /**
     * Preferred skills the candidate already has (bonus match).
     */
    private List<String> matchedPreferredSkills;

    /**
     * One-line human-readable reason why this job was recommended.
     * E.g.: "Strong Java & React match · Remote work available"
     */
    private String matchReason;

    /**
     * Whether the applicant has already saved this job.
     */
    private boolean isSaved;

    // ── Constructors ─────────────────────────────────────────────────────────

    public RecommendedJobResponse() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public WorkingMode getWorkingMode() { return workingMode; }
    public void setWorkingMode(WorkingMode workingMode) { this.workingMode = workingMode; }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public Long getMinimumSalary() { return minimumSalary; }
    public void setMinimumSalary(Long minimumSalary) { this.minimumSalary = minimumSalary; }

    public Long getMaximumSalary() { return maximumSalary; }
    public void setMaximumSalary(Long maximumSalary) { this.maximumSalary = maximumSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getVacancies() { return vacancies; }
    public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getUrgentHiring() { return urgentHiring; }
    public void setUrgentHiring(Boolean urgentHiring) { this.urgentHiring = urgentHiring; }

    public Boolean getEasyApply() { return easyApply; }
    public void setEasyApply(Boolean easyApply) { this.easyApply = easyApply; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getMatchGrade() { return matchGrade; }
    public void setMatchGrade(String matchGrade) { this.matchGrade = matchGrade; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public int getSkillMatchScore() { return skillMatchScore; }
    public void setSkillMatchScore(int skillMatchScore) { this.skillMatchScore = skillMatchScore; }

    public int getExperienceMatchScore() { return experienceMatchScore; }
    public void setExperienceMatchScore(int experienceMatchScore) { this.experienceMatchScore = experienceMatchScore; }

    public int getLocationMatchScore() { return locationMatchScore; }
    public void setLocationMatchScore(int locationMatchScore) { this.locationMatchScore = locationMatchScore; }

    public int getFreshnessScore() { return freshnessScore; }
    public void setFreshnessScore(int freshnessScore) { this.freshnessScore = freshnessScore; }

    public List<String> getMatchedPreferredSkills() { return matchedPreferredSkills; }
    public void setMatchedPreferredSkills(List<String> matchedPreferredSkills) { this.matchedPreferredSkills = matchedPreferredSkills; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
}
