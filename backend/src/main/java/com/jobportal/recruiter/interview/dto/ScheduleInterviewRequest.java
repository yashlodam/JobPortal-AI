package com.jobportal.recruiter.interview.dto;

import java.time.LocalDateTime;

import com.jobportal.recruiter.interview.enums.InterviewMode;
import com.jobportal.recruiter.interview.enums.InterviewRound;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for scheduling a new interview.
 */
public class ScheduleInterviewRequest {

    /**
     * The job application ID this interview is for.
     * Required — every scheduled interview must tie to an application.
     */
    @NotNull(message = "Application ID is required")
    private Long applicationId;

    /** Internal interviewer name or email (person conducting the interview). */
    @Size(max = 200, message = "Interviewer name must not exceed 200 characters")
    private String interviewerName;

    /** Round type: SCREENING, TECHNICAL, HR, FINAL, etc. */
    private InterviewRound interviewRound = InterviewRound.SCREENING;

    /** Interview format: VIDEO_CALL, PHONE, IN_PERSON, etc. */
    @NotNull(message = "Interview mode is required")
    private InterviewMode interviewMode;

    /** Meeting platform display name (e.g. "Google Meet", "Zoom"). */
    @Size(max = 100)
    private String meetingPlatform;

    /** Full meeting join URL. */
    @Size(max = 500, message = "Meeting link must not exceed 500 characters")
    private String meetingLink;

    /** When the interview starts. Must be in the present or future. */
    @NotNull(message = "Scheduled date/time is required")
    @FutureOrPresent(message = "Interview must be scheduled in the present or future")
    private LocalDateTime scheduledAt;

    /** When the interview ends. Must be after scheduledAt. */
    private LocalDateTime endsAt;

    /** Duration in minutes (auto-computed if endsAt is provided; otherwise use this). */
    private Integer durationMinutes;

    /** Internal recruiter notes (not visible to candidate). */
    @Size(max = 2000)
    private String internalNotes;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

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

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
}
