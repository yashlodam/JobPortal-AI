package com.jobportal.jobmatch.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.domain.ApplicationStatus;
import com.jobportal.jobmatch.enums.MatchStatus;

/**
 * Lightweight DTO for recruiter candidate listing with match scores and zero N+1 queries.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CandidateMatchSummaryDTO {

    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private ApplicationStatus applicationStatus;
    private String resumeUrl;
    private Integer matchPercentage;
    private MatchStatus matchStatus;
    private LocalDateTime appliedAt;

    public CandidateMatchSummaryDTO() {}

    public CandidateMatchSummaryDTO(Long applicationId, Long jobId, String jobTitle,
                                   Long candidateId, String candidateName, String candidateEmail,
                                   ApplicationStatus applicationStatus, String resumeUrl,
                                   Integer matchPercentage, MatchStatus matchStatus,
                                   LocalDateTime appliedAt) {
        this.applicationId = applicationId;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.applicationStatus = applicationStatus;
        this.resumeUrl = resumeUrl;
        this.matchPercentage = matchPercentage != null ? matchPercentage : 0;
        this.matchStatus = matchStatus != null ? matchStatus : MatchStatus.PENDING;
        this.appliedAt = appliedAt;
    }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public ApplicationStatus getApplicationStatus() { return applicationStatus; }
    public void setApplicationStatus(ApplicationStatus applicationStatus) { this.applicationStatus = applicationStatus; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }

    public MatchStatus getMatchStatus() { return matchStatus; }
    public void setMatchStatus(MatchStatus matchStatus) { this.matchStatus = matchStatus; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
