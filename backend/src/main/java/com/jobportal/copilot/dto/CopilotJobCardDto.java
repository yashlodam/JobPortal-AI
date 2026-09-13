package com.jobportal.copilot.dto;

import java.util.ArrayList;
import java.util.List;

public class CopilotJobCardDto {

    private Long id;
    private String title;
    private String companyName;
    private String location;
    private String salary;
    private String jobType;
    private String workMode;
    private List<String> skills = new ArrayList<>();
    private Integer matchScore;
    private Long companyId;

    public CopilotJobCardDto() {}

    public CopilotJobCardDto(Long id, String title, String companyName, String location, String salary, String jobType, String workMode) {
        this(id, title, companyName, location, salary, jobType, workMode, new ArrayList<>(), null, null);
    }

    public CopilotJobCardDto(Long id, String title, String companyName, String location, String salary, String jobType, String workMode, List<String> skills, Integer matchScore, Long companyId) {
        this.id = id;
        this.title = title;
        this.companyName = companyName;
        this.location = location;
        this.salary = salary;
        this.jobType = jobType;
        this.workMode = workMode;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.matchScore = matchScore;
        this.companyId = companyId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills != null ? skills : new ArrayList<>(); }

    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
}
