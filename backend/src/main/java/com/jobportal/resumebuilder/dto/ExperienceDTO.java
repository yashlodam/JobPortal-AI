package com.jobportal.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Experience section entry.
 */
public class ExperienceDTO {

    private Long id;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Position title is required")
    private String position;

    private String location;
    private String startDate;
    private String endDate;
    private boolean currentlyWorking;
    private String description;
    private int displayOrder;

    public ExperienceDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public boolean isCurrentlyWorking() { return currentlyWorking; }
    public void setCurrentlyWorking(boolean currentlyWorking) { this.currentlyWorking = currentlyWorking; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
