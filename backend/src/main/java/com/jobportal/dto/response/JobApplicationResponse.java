package com.jobportal.dto.response;

import java.time.LocalDateTime;

import com.jobportal.domain.ApplicationStatus;

/**
 * Response DTO for job applications. Includes detailed resume information for recruiter review.
 */
public class JobApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String jobLocation;
    private String workMode;
    private Long minimumSalary;
    private Long maximumSalary;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private ApplicationStatus status;
    private String coverLetter;
    private String resumeUrl;
    private ResumeResponse resume;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public Long getMinimumSalary() { return minimumSalary; }
    public void setMinimumSalary(Long minimumSalary) { this.minimumSalary = minimumSalary; }

    public Long getMaximumSalary() { return maximumSalary; }
    public void setMaximumSalary(Long maximumSalary) { this.maximumSalary = maximumSalary; }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public ResumeResponse getResume() { return resume; }
    public void setResume(ResumeResponse resume) { this.resume = resume; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
