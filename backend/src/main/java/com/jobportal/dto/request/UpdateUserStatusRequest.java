package com.jobportal.dto.request;

/**
 * Request payload for updating or toggling user account status.
 */
public class UpdateUserStatusRequest {

    private String status;
    private Boolean isActive;
    private String reason;

    public UpdateUserStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
