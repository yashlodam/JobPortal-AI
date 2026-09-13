package com.jobportal.recruiter.interview.dto;

import java.time.LocalDateTime;

import com.jobportal.recruiter.interview.enums.InterviewMode;
import com.jobportal.recruiter.interview.enums.InterviewRound;
import com.jobportal.recruiter.interview.enums.ScheduledInterviewStatus;

/**
 * Response DTO for a scheduled interview.
 * Returned to both recruiter and candidate endpoints.
 */
public class ScheduledInterviewResponse {

    private Long id;

    // ── Candidate Info (flattened) ────────────────────────────────────────────
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateProfileImage;

    // ── Job / Application Info (flattened) ────────────────────────────────────
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String companyLogo;

    // ── Recruiter Info (flattened) ────────────────────────────────────────────
    private Long recruiterId;
    private String recruiterName;

    // ── Interview Details ─────────────────────────────────────────────────────
    private String interviewerName;
    private InterviewRound interviewRound;
    private InterviewMode interviewMode;
    private String meetingPlatform;
    private String meetingLink;
    private LocalDateTime scheduledAt;
    private LocalDateTime endsAt;
    private Integer durationMinutes;
    private ScheduledInterviewStatus status;
    private Boolean inviteSent;

    // ── Feedback (visible after COMPLETED) ───────────────────────────────────
    private String feedback;
    private Integer candidateRating;
    private String recommendation;

    // ── Notes (recruiter-only) ────────────────────────────────────────────────
    private String internalNotes;

    // ── Audit ──────────────────────────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime statusUpdatedAt;

    /** Human-readable label for the status. */
    private String statusLabel;

    /** Whether the meeting link is currently joinable (status SCHEDULED/IN_PROGRESS and near scheduled time). */
    private boolean joinable;

    public ScheduledInterviewResponse() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidateProfileImage() { return candidateProfileImage; }
    public void setCandidateProfileImage(String candidateProfileImage) { this.candidateProfileImage = candidateProfileImage; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public InterviewRound getInterviewRound() { return interviewRound; }
    public void setInterviewRound(InterviewRound interviewRound) { this.interviewRound = interviewRound; }

    public InterviewMode getInterviewMode() { return interviewMode; }
    public void setInterviewMode(InterviewMode interviewMode) { this.interviewMode = interviewMode; }

    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDateTime endsAt) { this.endsAt = endsAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public ScheduledInterviewStatus getStatus() { return status; }
    public void setStatus(ScheduledInterviewStatus status) { this.status = status; }

    public Boolean getInviteSent() { return inviteSent; }
    public void setInviteSent(Boolean inviteSent) { this.inviteSent = inviteSent; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getCandidateRating() { return candidateRating; }
    public void setCandidateRating(Integer candidateRating) { this.candidateRating = candidateRating; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public boolean isJoinable() { return joinable; }
    public void setJoinable(boolean joinable) { this.joinable = joinable; }
}
