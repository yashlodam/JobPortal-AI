package com.jobportal.dto.request;

import com.jobportal.domain.ApplicationStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request payload for updating an application's status.
 *
 * <p>{@code note} is optional — allows the recruiter to include a brief
 * message to the applicant (e.g. feedback, next steps, interview instructions).
 * It is included in the notification sent to the applicant.</p>
 */
public class UpdateApplicationStatusRequest {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    private String note;

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
