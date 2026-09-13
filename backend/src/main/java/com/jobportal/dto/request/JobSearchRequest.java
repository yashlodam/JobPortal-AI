package com.jobportal.dto.request;

import java.util.List;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;

/**
 * Full-featured job search/filter request using JPA Specifications.
 * Supports pagination and sorting.
 */
public class JobSearchRequest {

    // Text search
    private String keyword;

    // Location filters
    private String city;
    private String state;
    private String country;

    // Employment filters
    private JobType jobType;
    private WorkingMode workingMode;
    private ExperienceLevel experienceLevel;

    // Salary range
    private Long minimumSalary;
    private Long maximumSalary;

    // Skills / Category
    private List<String> skills;
    private String category;
    private String qualification;

    // Metadata flags
    private Boolean featured;
    private Boolean urgentHiring;
    private Boolean easyApply;

    // Pagination
    private int page = 0;
    private int size = 10;
    private String sortBy = "createdAt";
    private String sortDir = "desc";

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }

    public WorkingMode getWorkingMode() { return workingMode; }
    public void setWorkingMode(WorkingMode workingMode) { this.workingMode = workingMode; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public Long getMinimumSalary() { return minimumSalary; }
    public void setMinimumSalary(Long minimumSalary) { this.minimumSalary = minimumSalary; }

    public Long getMaximumSalary() { return maximumSalary; }
    public void setMaximumSalary(Long maximumSalary) { this.maximumSalary = maximumSalary; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getUrgentHiring() { return urgentHiring; }
    public void setUrgentHiring(Boolean urgentHiring) { this.urgentHiring = urgentHiring; }

    public Boolean getEasyApply() { return easyApply; }
    public void setEasyApply(Boolean easyApply) { this.easyApply = easyApply; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }
}
