package com.jobportal.chat.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for POST /api/chat/conversations.
 * The authenticated user becomes participant 1 automatically.
 * participantId is the OTHER user to start a conversation with.
 * jobApplicationId is optional context (e.g. recruiter messaging an applicant).
 */
public class CreateConversationRequest {

    @NotNull(message = "participantId is required")
    private Long participantId;

    /** Optional: link this conversation to a job application for context. */
    private Long jobApplicationId;

    /** Optional: override the auto-generated title. */
    private String title;

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public Long getJobApplicationId() { return jobApplicationId; }
    public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
