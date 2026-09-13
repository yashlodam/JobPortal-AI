package com.jobportal.recruiter.interview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for submitting post-interview feedback (status → COMPLETED).
 */
public class InterviewFeedbackRequest {

    /** Post-interview feedback or evaluation notes. */
    @Size(max = 5000, message = "Feedback must not exceed 5000 characters")
    private String feedback;

    /** Candidate rating on a 1–5 scale. */
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer candidateRating;

    /** Optional recommendation outcome: RECOMMEND, DO_NOT_RECOMMEND, HOLD */
    private String recommendation;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getCandidateRating() { return candidateRating; }
    public void setCandidateRating(Integer candidateRating) { this.candidateRating = candidateRating; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
