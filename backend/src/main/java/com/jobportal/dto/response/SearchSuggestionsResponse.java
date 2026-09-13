package com.jobportal.dto.response;

import java.util.ArrayList;
import java.util.List;

public class SearchSuggestionsResponse {

    private List<String> jobTitles = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<String> companies = new ArrayList<>();
    private List<String> locations = new ArrayList<>();

    public SearchSuggestionsResponse() {
    }

    public SearchSuggestionsResponse(List<String> jobTitles, List<String> skills, List<String> companies, List<String> locations) {
        this.jobTitles = jobTitles != null ? jobTitles : new ArrayList<>();
        this.skills = skills != null ? skills : new ArrayList<>();
        this.companies = companies != null ? companies : new ArrayList<>();
        this.locations = locations != null ? locations : new ArrayList<>();
    }

    public List<String> getJobTitles() {
        return jobTitles;
    }

    public void setJobTitles(List<String> jobTitles) {
        this.jobTitles = jobTitles;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getCompanies() {
        return companies;
    }

    public void setCompanies(List<String> companies) {
        this.companies = companies;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }
}
