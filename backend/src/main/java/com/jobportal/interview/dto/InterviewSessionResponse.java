package com.jobportal.interview.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.interview.enums.DifficultyLevel;
import com.jobportal.interview.enums.InterviewStatus;
import com.jobportal.interview.enums.InterviewTrack;
import com.jobportal.interview.enums.InterviewType;

/**
 * Response DTO representing the status and details of an interview session.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InterviewSessionResponse {

    private Long id;
    private String userEmail;
    private String userName;

    private InterviewTrack interviewTrack;
    private InterviewType interviewType;
    private DifficultyLevel difficulty;

    private int totalQuestions;
    private int currentQuestion;
    private Integer overallScore;
    private InterviewStatus status;

    private Long resumeId;
    private Long jobId;
    private String trackTitle;
    private String trackId;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public InterviewSessionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public InterviewTrack getInterviewTrack() { return interviewTrack; }
    public void setInterviewTrack(InterviewTrack interviewTrack) { this.interviewTrack = interviewTrack; }

    public InterviewType getInterviewType() { return interviewType; }
    public void setInterviewType(InterviewType interviewType) { this.interviewType = interviewType; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCurrentQuestion() { return currentQuestion; }
    public void setCurrentQuestion(int currentQuestion) { this.currentQuestion = currentQuestion; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getTrackTitle() { return trackTitle; }
    public void setTrackTitle(String trackTitle) { this.trackTitle = trackTitle; }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
