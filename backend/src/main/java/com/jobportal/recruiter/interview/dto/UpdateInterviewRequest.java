package com.jobportal.recruiter.interview.dto;

import java.time.LocalDateTime;

import com.jobportal.recruiter.interview.enums.InterviewMode;
import com.jobportal.recruiter.interview.enums.InterviewRound;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing scheduled interview.
 * All fields are optional — only provided fields are updated.
 */
public class UpdateInterviewRequest {

    private InterviewRound interviewRound;
    private InterviewMode interviewMode;

    @Size(max = 200)
    private String interviewerName;

    @Size(max = 100)
    private String meetingPlatform;

    @Size(max = 500)
    private String meetingLink;

    private LocalDateTime scheduledAt;
    private LocalDateTime endsAt;
    private Integer durationMinutes;

    @Size(max = 2000)
    private String internalNotes;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public InterviewRound getInterviewRound() { return interviewRound; }
    public void setInterviewRound(InterviewRound interviewRound) { this.interviewRound = interviewRound; }

    public InterviewMode getInterviewMode() { return interviewMode; }
    public void setInterviewMode(InterviewMode interviewMode) { this.interviewMode = interviewMode; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

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
