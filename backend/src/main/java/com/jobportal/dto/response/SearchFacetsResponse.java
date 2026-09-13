package com.jobportal.dto.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SearchFacetsResponse {

    private Map<String, Long> workingModes = new HashMap<>();
    private Map<String, Long> jobTypes = new HashMap<>();
    private Map<String, Long> experienceLevels = new HashMap<>();
    private Map<String, Long> salaryRanges = new HashMap<>();
    private List<CategoryResponse> categories;
    private Map<String, Long> cities = new HashMap<>();

    public SearchFacetsResponse() {
    }

    public Map<String, Long> getWorkingModes() {
        return workingModes;
    }

    public void setWorkingModes(Map<String, Long> workingModes) {
        this.workingModes = workingModes;
    }

    public Map<String, Long> getJobTypes() {
        return jobTypes;
    }

    public void setJobTypes(Map<String, Long> jobTypes) {
        this.jobTypes = jobTypes;
    }

    public Map<String, Long> getExperienceLevels() {
        return experienceLevels;
    }

    public void setExperienceLevels(Map<String, Long> experienceLevels) {
        this.experienceLevels = experienceLevels;
    }

    public Map<String, Long> getSalaryRanges() {
        return salaryRanges;
    }

    public void setSalaryRanges(Map<String, Long> salaryRanges) {
        this.salaryRanges = salaryRanges;
    }

    public List<CategoryResponse> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryResponse> categories) {
        this.categories = categories;
    }

    public Map<String, Long> getCities() {
        return cities;
    }

    public void setCities(Map<String, Long> cities) {
        this.cities = cities;
    }
}
