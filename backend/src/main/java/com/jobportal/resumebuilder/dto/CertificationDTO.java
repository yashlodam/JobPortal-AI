package com.jobportal.resumebuilder.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for Certification section entry.
 */
public class CertificationDTO {

    private Long id;

    @NotBlank(message = "Certification name is required")
    private String name;

    private String issuingOrganization;
    private String issueDate;
    private String expiryDate;
    private String credentialUrl;
    private int displayOrder;

    public CertificationDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
