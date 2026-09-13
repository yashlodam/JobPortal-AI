package com.jobportal.interview.dto;

import com.jobportal.interview.enums.DifficultyLevel;
import com.jobportal.interview.enums.InterviewTrack;
import com.jobportal.interview.enums.InterviewType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload to start a new AI Mock Interview session.
 */
public class StartInterviewRequest {

    private InterviewTrack interviewTrack = InterviewTrack.TECHNICAL;
    private InterviewType interviewType = InterviewType.TEXT;
    private DifficultyLevel difficulty = DifficultyLevel.INTERMEDIATE;

    @Min(value = 1, message = "Total questions must be at least 1")
    @Max(value = 20, message = "Total questions cannot exceed 20")
    private int totalQuestions = 5;

    private Long resumeId;
    private Long jobId;
    private String trackTitle;
    private String trackId;

    public StartInterviewRequest() {}

    public String getTrackTitle() { return trackTitle; }
    public void setTrackTitle(String trackTitle) { this.trackTitle = trackTitle; }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }

    public InterviewTrack getInterviewTrack() {
        return interviewTrack != null ? interviewTrack : InterviewTrack.TECHNICAL;
    }
    public void setInterviewTrack(InterviewTrack interviewTrack) {
        this.interviewTrack = interviewTrack != null ? interviewTrack : InterviewTrack.TECHNICAL;
    }

    public InterviewType getInterviewType() {
        return interviewType != null ? interviewType : InterviewType.TEXT;
    }
    public void setInterviewType(InterviewType interviewType) {
        this.interviewType = interviewType != null ? interviewType : InterviewType.TEXT;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty != null ? difficulty : DifficultyLevel.INTERMEDIATE;
    }
    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty != null ? difficulty : DifficultyLevel.INTERMEDIATE;
    }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
