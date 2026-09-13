package com.jobportal.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Project section entry.
 */
public class ProjectDTO {

    private Long id;

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;
    private String technologies;
    private String githubUrl;
    private String liveUrl;
    private int displayOrder;

    public ProjectDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTechnologies() { return technologies; }
    public void setTechnologies(String technologies) { this.technologies = technologies; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLiveUrl() { return liveUrl; }
    public void setLiveUrl(String liveUrl) { this.liveUrl = liveUrl; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
