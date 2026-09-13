package com.jobportal.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating resume metadata (e.g. title or default flag).
 */
public class ResumeUpdateRequest {

    @Size(max = 100, message = "Resume name must not exceed 100 characters")
    private String resumeName;

    private Boolean isDefault;

    public ResumeUpdateRequest() {
    }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}
