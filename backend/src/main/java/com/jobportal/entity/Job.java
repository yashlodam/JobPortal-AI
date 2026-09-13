package com.jobportal.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobStatus;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/**
 * Job aggregate root.
 *
 * <h3>Fetch strategy</h3>
 * <ul>
 *   <li>{@code company} and {@code recruiter} are {@code @ManyToOne LAZY} —
 *       loaded eagerly only when explicitly joined via EntityGraph in the
 *       repository. Never globally EAGER to avoid fetching them on every
 *       path that doesn't need them.</li>
 *   <li>{@code skillsRequired} and {@code preferredSkills} are
 *       {@code @ElementCollection LAZY} with {@code @BatchSize(25)}.
 *       They are loaded in a single IN-clause query when accessed within
 *       a live Hibernate session.</li>
 *   <li>{@code applications} is {@code LAZY} with {@code @BatchSize(25)}.
 *       It has {@code CascadeType.ALL + orphanRemoval} so deleting a Job
 *       also removes all associated applications cleanly.</li>
 * </ul>
 *
 * <h3>Indexes</h3>
 * Every column used in WHERE / ORDER BY clauses in JobRepository and
 * JobSpecification has a dedicated index to prevent full-table scans.
 */
@Entity
@Table(
    name = "jobs",
    indexes = {
        @Index(name = "idx_job_status",      columnList = "status"),
        @Index(name = "idx_job_company",     columnList = "company_id"),
        @Index(name = "idx_job_recruiter",   columnList = "recruiter_id"),
        @Index(name = "idx_job_category",    columnList = "category"),
        @Index(name = "idx_job_city",        columnList = "city"),
        @Index(name = "idx_job_featured",    columnList = "featured, status"),
        @Index(name = "idx_job_created_at",  columnList = "created_at")
    }
)
public class Job extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic Information ────────────────────────────────────────────────────

    @Column(nullable = false, length = 150)
    private String jobTitle;

    @Column(length = 100)
    private String category;

    @Column(length = 5000)
    private String description;

    @Column(length = 3000)
    private String responsibilities;

    @Column(length = 3000)
    private String requirements;

    @Column(length = 3000)
    private String aboutRole;

    @Column(length = 3000)
    private String benefits;

    // ── Company & Recruiter ──────────────────────────────────────────────────

    /**
     * LAZY — only joined when required (via EntityGraph in repository).
     * Never globally EAGER; doing so would load company on every Job load
     * across the entire application, including paths that don't need it.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    // ── Location ─────────────────────────────────────────────────────────────

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private WorkingMode workingMode;

    // ── Employment ───────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ExperienceLevel experienceLevel;

    @Column(name = "minimum_experience")
    private Integer minimumExperience;

    @Column(name = "maximum_experience")
    private Integer maximumExperience;

    // ── Salary ───────────────────────────────────────────────────────────────

    private Long minimumSalary;
    private Long maximumSalary;

    @Column(length = 10)
    private String currency;

    // ── Vacancy ──────────────────────────────────────────────────────────────

    private Integer vacancies;

    // ── Skills ───────────────────────────────────────────────────────────────

    /**
     * @CollectionTable: explicit table/column naming prevents Hibernate
     *   from generating unpredictable DDL names.
     * @OrderColumn: preserves insertion order without needing a sorted Set.
     * @BatchSize(25): when this collection is accessed, Hibernate loads it
     *   for up to 25 job IDs in one IN-clause query — no N+1.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "job_skills_required",
        joinColumns = @JoinColumn(name = "job_id")
    )
    @Column(name = "skill", length = 100)
    @OrderColumn(name = "skill_order")
    @BatchSize(size = 25)
    private List<String> skillsRequired = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
        name = "job_preferred_skills",
        joinColumns = @JoinColumn(name = "job_id")
    )
    @Column(name = "skill", length = 100)
    @OrderColumn(name = "skill_order")
    @BatchSize(size = 25)
    private List<String> preferredSkills = new ArrayList<>();

    // ── Education / Hiring ───────────────────────────────────────────────────

    @Column(length = 200)
    private String qualification;

    private LocalDate applicationDeadline;

    private Integer numberOfInterviewRounds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.OPEN;

    // ── Metadata counters ────────────────────────────────────────────────────

    @Column(nullable = false)
    private Integer totalApplicants = 0;

    @Column(nullable = false)
    private Integer totalViews = 0;

    @Column(nullable = false)
    private Integer totalBookmarks = 0;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false)
    private Boolean urgentHiring = false;

    @Column(nullable = false)
    private Boolean easyApply = true;

    // ── Applications ─────────────────────────────────────────────────────────

    /**
     * CascadeType.ALL + orphanRemoval: deleting a Job cascades to all its
     *   JobApplications so no orphan rows are left in the DB.
     * @BatchSize(25): prevents N+1 when applications are accessed in a loop.
     */
    @OneToMany(
        mappedBy = "job",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @BatchSize(size = 25)
    private List<JobApplication> applications = new ArrayList<>();

    // ── Saved Jobs ───────────────────────────────────────────────────────────

    /**
     * CascadeType.ALL + orphanRemoval: deleting a Job also deletes all bookmarks.
     */
    @OneToMany(
        mappedBy = "job",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<SavedJob> savedJobs = new ArrayList<>();

    public Job() {}

    // ── Getters & Setters ────────────────────────────────────────────────────

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

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Recruiter getRecruiter() { return recruiter; }
    public void setRecruiter(Recruiter recruiter) { this.recruiter = recruiter; }

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

    public Integer getTotalApplicants() { return totalApplicants; }
    public void setTotalApplicants(Integer totalApplicants) { this.totalApplicants = totalApplicants; }

    public Integer getTotalViews() { return totalViews; }
    public void setTotalViews(Integer totalViews) { this.totalViews = totalViews; }

    public Integer getTotalBookmarks() { return totalBookmarks; }
    public void setTotalBookmarks(Integer totalBookmarks) { this.totalBookmarks = totalBookmarks; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getUrgentHiring() { return urgentHiring; }
    public void setUrgentHiring(Boolean urgentHiring) { this.urgentHiring = urgentHiring; }

    public Boolean getEasyApply() { return easyApply; }
    public void setEasyApply(Boolean easyApply) { this.easyApply = easyApply; }

    public List<JobApplication> getApplications() { return applications; }
    public void setApplications(List<JobApplication> applications) { this.applications = applications; }

    public List<SavedJob> getSavedJobs() { return savedJobs; }
    public void setSavedJobs(List<SavedJob> savedJobs) { this.savedJobs = savedJobs; }
}