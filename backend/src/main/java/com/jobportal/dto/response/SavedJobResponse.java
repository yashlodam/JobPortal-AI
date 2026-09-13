package com.jobportal.dto.response;

import java.time.LocalDateTime;

/**
 * Response DTO for saved/bookmarked jobs.
 */
public class SavedJobResponse {

    private Long savedJobId;
    private LocalDateTime savedAt;
    private JobSummaryResponse job;

    public Long getSavedJobId() { return savedJobId; }
    public void setSavedJobId(Long savedJobId) { this.savedJobId = savedJobId; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }

    public JobSummaryResponse getJob() { return job; }
    public void setJob(JobSummaryResponse job) { this.job = job; }
}
