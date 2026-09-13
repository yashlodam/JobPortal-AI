package com.jobportal.dto.request;

import java.time.LocalDate;
import java.util.List;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;
import com.jobportal.validation.ValidSalaryRange;
import com.jobportal.validation.ValidExperienceRange;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating a Job.
 *
 * <h3>Validation</h3>
 * <ul>
 *   <li>Field-level constraints: {@code @NotBlank}, {@code @Size}, {@code @Min}</li>
 *   <li>Cross-field constraints: {@code @ValidSalaryRange} ensures
 *       minimumSalary &le; maximumSalary; {@code @ValidExperienceRange} ensures
 *       minimumExperience &le; maximumExperience.</li>
 *   <li>{@code applicationDeadline}: must not be in the past.</li>
 * </ul>
 */
@ValidSalaryRange
@ValidExperienceRange
public class JobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title must not exceed 150 characters")
    private String jobTitle;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 3000)
    private String responsibilities;

    @Size(max = 3000)
    private String requirements;

    @Size(max = 3000)
    private String aboutRole;

    @Size(max = 3000)
    private String benefits;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100)
    private String state;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @NotNull(message = "Working mode is required")
    private WorkingMode workingMode;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @Min(value = 0, message = "Minimum experience cannot be negative")
    private Integer minimumExperience;

    @Min(value = 0, message = "Maximum experience cannot be negative")
    private Integer maximumExperience;

    @Min(value = 0, message = "Minimum salary cannot be negative")
    private Long minimumSalary;

    @Min(value = 0, message = "Maximum salary cannot be negative")
    private Long maximumSalary;

    @NotBlank(message = "Currency is required")
    @Size(max = 10)
    private String currency;

    @Min(value = 1, message = "Vacancies must be at least 1")
    private Integer vacancies;

    @NotNull(message = "At least one required skill must be specified")
    @Size(min = 1, message = "At least one required skill must be specified")
    private List<String> skillsRequired;

    private List<String> preferredSkills;

    @Size(max = 200)
    private String qualification;

    @FutureOrPresent(message = "Application deadline must be today or in the future")
    private LocalDate applicationDeadline;

    @Min(value = 1, message = "Number of interview rounds must be at least 1")
    private Integer numberOfInterviewRounds;

    private Boolean featured = false;
    private Boolean urgentHiring = false;
    private Boolean easyApply = true;

    public JobRequest() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

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

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getUrgentHiring() { return urgentHiring; }
    public void setUrgentHiring(Boolean urgentHiring) { this.urgentHiring = urgentHiring; }

    public Boolean getEasyApply() { return easyApply; }
    public void setEasyApply(Boolean easyApply) { this.easyApply = easyApply; }
}
