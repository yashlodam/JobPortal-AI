package com.jobportal.dto.response;

import java.time.LocalDateTime;

import com.jobportal.domain.RecruiterStatus;

/**
 * Admin-facing summary of a recruiter — used in paginated list responses.
 * Contains enough data for the admin to identify and triage a recruiter
 * without loading the full detail view.
 */
public class RecruiterAdminSummaryResponse {

    private Long          recruiterId;
    private Long          userId;
    private String        recruiterName;
    private String        recruiterEmail;
    private String        designation;
    private String        companyName;
    private String        companyWebsite;
    private RecruiterStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String        rejectionReason;
    private LocalDateTime createdAt;      // recruiter account creation date

    public RecruiterAdminSummaryResponse() {}

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public RecruiterStatus getStatus() { return status; }
    public void setStatus(RecruiterStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
