package com.jobportal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public class CertificationRequest {

    @NotBlank(message = "Certification title is required")
    private String title;

    @NotBlank(message = "Issuer is required")
    private String issuer;

    private LocalDate issueDate;
    private String certificateId;
    private String certificateUrl;

    public CertificationRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
}
