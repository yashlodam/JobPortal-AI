package com.jobportal.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Payload for admin review actions (approve / reject / suspend).
 *
 * <ul>
 *   <li>Approve: {@code reason} is optional (cleared on approval).</li>
 *   <li>Reject:  {@code reason} is required so the recruiter knows what to fix.</li>
 *   <li>Suspend: {@code reason} is required for the audit trail.</li>
 * </ul>
 */
public class AdminReviewRequest {

    @Size(max = 1000, message = "Reason must be at most 1000 characters")
    private String reason;

    public AdminReviewRequest() {}

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
