package com.jobportal.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobStatus;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;

/**
 * Full job detail response — used for single job GET endpoint.
 * Includes all fields including rich-text content (description, responsibilities, etc.)
 */
public class JobDetailResponse {

    private Long id;
    private String jobTitle;
    private String category;
    private String description;
    private String responsibilities;
    private String requirements;
    private String aboutRole;
    private String benefits;

    // Location
    private String city;
    private String state;
    private String country;
    private WorkingMode workingMode;

    // Employment
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private Integer minimumExperience;
    private Integer maximumExperience;

    // Salary
    private Long minimumSalary;
    private Long maximumSalary;
    private String currency;

    private Integer vacancies;
    private List<String> skillsRequired;
    private List<String> preferredSkills;
    private String qualification;

    private LocalDate applicationDeadline;
    private Integer numberOfInterviewRounds;

    private JobStatus status;
    private Boolean featured;
    private Boolean urgentHiring;
    private Boolean easyApply;

    private Integer totalApplicants;
    private Integer totalViews;
    private Integer totalBookmarks;

    // Company info
    private Long companyId;
    private String companyName;
    private String companyLogo;
    private String companyIndustry;

    // Recruiter info
    private Long recruiterId;
    private String recruiterName;

    private LocalDateTime postedAt;
    private LocalDateTime updatedAt;

    public JobDetailResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getAboutRole() { return aboutRole; }
    public void setAboutRole(String aboutRole) { this.aboutRole = aboutRole; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }

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

    public Integer getMinimumExperience() { return minimumExperience; }
    public void setMinimumExperience(Integer minimumExperience) { this.minimumExperience = minimumExperience; }

    public Integer getMaximumExperience() { return maximumExperience; }
    public void setMaximumExperience(Integer maximumExperience) { this.maximumExperience = maximumExperience; }

    public Long getMinimumSalary() { return minimumSalary; }
    public void setMinimumSalary(Long minimumSalary) { this.minimumSalary = minimumSalary; }

    public Long getMaximumSalary() { return maximumSalary; }
    public void setMaximumSalary(Long maximumSalary) { this.maximumSalary = maximumSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getVacancies() { return vacancies; }
    public void setVacancies(Integer vacancies) { this.vacancies = vacancies; }

    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }

    public List<String> getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(List<String> preferredSkills) { this.preferredSkills = preferredSkills; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public Integer getNumberOfInterviewRounds() { return numberOfInterviewRounds; }
    public void setNumberOfInterviewRounds(Integer numberOfInterviewRounds) { this.numberOfInterviewRounds = numberOfInterviewRounds; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getUrgentHiring() { return urgentHiring; }
    public void setUrgentHiring(Boolean urgentHiring) { this.urgentHiring = urgentHiring; }

    public Boolean getEasyApply() { return easyApply; }
    public void setEasyApply(Boolean easyApply) { this.easyApply = easyApply; }

    public Integer getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(Integer totalApplicants) { this.totalApplicants = totalApplicants; }

    public Integer getTotalViews() { return totalViews; }
    public void setTotalViews(Integer totalViews) { this.totalViews = totalViews; }

    public Integer getTotalBookmarks() { return totalBookmarks; }
    public void setTotalBookmarks(Integer totalBookmarks) { this.totalBookmarks = totalBookmarks; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getCompanyIndustry() { return companyIndustry; }
    public void setCompanyIndustry(String companyIndustry) { this.companyIndustry = companyIndustry; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
