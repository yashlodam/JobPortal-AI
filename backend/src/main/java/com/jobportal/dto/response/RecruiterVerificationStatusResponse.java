package com.jobportal.dto.response;

import java.time.LocalDateTime;

import com.jobportal.domain.RecruiterStatus;

/**
 * Response DTO for the recruiter self-service verification status endpoint.
 *
 * <p>Now includes company fields so the frontend verification dashboard can
 * display the submitted company information without a separate API call.
 * Fields are null when the recruiter has not yet submitted company data.</p>
 */
public class RecruiterVerificationStatusResponse {

    private RecruiterStatus status;
    private String message;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private boolean canSubmit;

    // Company info (populated from linked Company entity)
    private String companyName;
    private String companyWebsite;
    private String companyLocation;
    private String companyDescription;
    private String designation;

    public RecruiterVerificationStatusResponse() {}

    public RecruiterVerificationStatusResponse(
            RecruiterStatus status,
            String message,
            LocalDateTime submittedAt,
            LocalDateTime reviewedAt,
            String rejectionReason,
            boolean canSubmit) {
        this.status          = status;
        this.message         = message;
        this.submittedAt     = submittedAt;
        this.reviewedAt      = reviewedAt;
        this.rejectionReason = rejectionReason;
        this.canSubmit       = canSubmit;
    }

    public RecruiterStatus getStatus() { return status; }
    public void setStatus(RecruiterStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public boolean isCanSubmit() { return canSubmit; }
    public void setCanSubmit(boolean canSubmit) { this.canSubmit = canSubmit; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public String getCompanyLocation() { return companyLocation; }
    public void setCompanyLocation(String companyLocation) { this.companyLocation = companyLocation; }

    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
}