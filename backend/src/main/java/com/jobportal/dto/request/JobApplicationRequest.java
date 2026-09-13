package com.jobportal.dto.request;


import jakarta.validation.constraints.Size;

public class JobApplicationRequest {

    @Size(max = 2000, message = "Cover letter must not exceed 2000 characters")
    private String coverLetter;

    // Resume ID is optional — if provided, uses existing resume; otherwise uses profile's default resume
    private Long resumeId;

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }
}
