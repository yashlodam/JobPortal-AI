package com.jobportal.dto.request;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;

public class JobFilterRequest {

    // Search
    private String keyword;

    // Company
    private String companyName;

    // Category
    private String category;
    private List<String> categories = new ArrayList<>();

    // Location
    private String city;
    private List<String> cities = new ArrayList<>();
    private String state;
    private String country;

    // Employment
    private JobType jobType;
    private List<JobType> jobTypes = new ArrayList<>();

    private WorkingMode workingMode;
    private List<WorkingMode> workingModes = new ArrayList<>();

    private ExperienceLevel experienceLevel;
    private List<ExperienceLevel> experienceLevels = new ArrayList<>();

    // Experience
    private Integer minimumExperience;
    private Integer maximumExperience;

    // Salary
    private Long minimumSalary;
    private Long maximumSalary;

    // Skills
    private List<String> skills;

    // Education
    private String qualification;

    // Flags
    private Boolean featured;
    private Boolean urgentHiring;
    private Boolean easyApply;

    // Freshness & Sorting
    private Integer postedWithinDays;
    private String sortBy;

    public JobFilterRequest() {
    }

    // ---------------- Search ----------------

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    // ---------------- Company ----------------

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    // ---------------- Category ----------------

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
        if (category != null && !category.trim().isEmpty()) {
            if (this.categories == null) this.categories = new ArrayList<>();
            if (!this.categories.contains(category.trim())) {
                this.categories.add(category.trim());
            }
        }
    }

    public List<String> getCategories() {
        if (categories == null) categories = new ArrayList<>();
        if (category != null && !category.trim().isEmpty() && !categories.contains(category.trim())) {
            categories.add(category.trim());
        }
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories != null ? categories : new ArrayList<>();
    }

    // ---------------- Location ----------------

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
        if (city != null && !city.trim().isEmpty()) {
            if (this.cities == null) this.cities = new ArrayList<>();
            if (!this.cities.contains(city.trim())) {
                this.cities.add(city.trim());
            }
        }
    }

    public List<String> getCities() {
        if (cities == null) cities = new ArrayList<>();
        if (city != null && !city.trim().isEmpty() && !cities.contains(city.trim())) {
            cities.add(city.trim());
        }
        return cities;
    }

    public void setCities(List<String> cities) {
        this.cities = cities != null ? cities : new ArrayList<>();
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    // ---------------- Employment ----------------

    public JobType getJobType() {
        return jobType;
    }

    public void setJobType(JobType jobType) {
        this.jobType = jobType;
        if (jobType != null) {
            if (this.jobTypes == null) this.jobTypes = new ArrayList<>();
            if (!this.jobTypes.contains(jobType)) {
                this.jobTypes.add(jobType);
            }
        }
    }

    public List<JobType> getJobTypes() {
        if (jobTypes == null) jobTypes = new ArrayList<>();
        if (jobType != null && !jobTypes.contains(jobType)) {
            jobTypes.add(jobType);
        }
        return jobTypes;
    }

    public void setJobTypes(List<JobType> jobTypes) {
        this.jobTypes = jobTypes != null ? jobTypes : new ArrayList<>();
    }

    public WorkingMode getWorkingMode() {
        return workingMode;
    }

    public void setWorkingMode(WorkingMode workingMode) {
        this.workingMode = workingMode;
        if (workingMode != null) {
            if (this.workingModes == null) this.workingModes = new ArrayList<>();
            if (!this.workingModes.contains(workingMode)) {
                this.workingModes.add(workingMode);
            }
        }
    }

    public List<WorkingMode> getWorkingModes() {
        if (workingModes == null) workingModes = new ArrayList<>();
        if (workingMode != null && !workingModes.contains(workingMode)) {
            workingModes.add(workingMode);
        }
        return workingModes;
    }

    public void setWorkingModes(List<WorkingMode> workingModes) {
        this.workingModes = workingModes != null ? workingModes : new ArrayList<>();
    }

    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
        if (experienceLevel != null) {
            if (this.experienceLevels == null) this.experienceLevels = new ArrayList<>();
            if (!this.experienceLevels.contains(experienceLevel)) {
                this.experienceLevels.add(experienceLevel);
            }
        }
    }

    public List<ExperienceLevel> getExperienceLevels() {
        if (experienceLevels == null) experienceLevels = new ArrayList<>();
        if (experienceLevel != null && !experienceLevels.contains(experienceLevel)) {
            experienceLevels.add(experienceLevel);
        }
        return experienceLevels;
    }

    public void setExperienceLevels(List<ExperienceLevel> experienceLevels) {
        this.experienceLevels = experienceLevels != null ? experienceLevels : new ArrayList<>();
    }

    // ---------------- Experience ----------------

    public Integer getMinimumExperience() {
        return minimumExperience;
    }

    public void setMinimumExperience(Integer minimumExperience) {
        this.minimumExperience = minimumExperience;
    }

    public Integer getMaximumExperience() {
        return maximumExperience;
    }

    public void setMaximumExperience(Integer maximumExperience) {
        this.maximumExperience = maximumExperience;
    }

    // ---------------- Salary ----------------

    public Long getMinimumSalary() {
        return minimumSalary;
    }

    public void setMinimumSalary(Long minimumSalary) {
        this.minimumSalary = minimumSalary;
    }

    public Long getMaximumSalary() {
        return maximumSalary;
    }

    public void setMaximumSalary(Long maximumSalary) {
        this.maximumSalary = maximumSalary;
    }

    // ---------------- Skills ----------------

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    // ---------------- Qualification ----------------

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    // ---------------- Flags ----------------

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public Boolean getUrgentHiring() {
        return urgentHiring;
    }

    public void setUrgentHiring(Boolean urgentHiring) {
        this.urgentHiring = urgentHiring;
    }

    public Boolean getEasyApply() {
        return easyApply;
    }

    public void setEasyApply(Boolean easyApply) {
        this.easyApply = easyApply;
    }

    // ---------------- Freshness & Sorting ----------------

    public Integer getPostedWithinDays() {
        return postedWithinDays;
    }

    public void setPostedWithinDays(Integer postedWithinDays) {
        this.postedWithinDays = postedWithinDays;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
}
