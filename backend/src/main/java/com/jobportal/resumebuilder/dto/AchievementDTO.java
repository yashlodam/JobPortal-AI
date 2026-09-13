package com.jobportal.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Achievement section entry.
 */
public class AchievementDTO {

    private Long id;

    @NotBlank(message = "Achievement title is required")
    private String title;

    private String description;
    private String date;
    private int displayOrder;

    public AchievementDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
