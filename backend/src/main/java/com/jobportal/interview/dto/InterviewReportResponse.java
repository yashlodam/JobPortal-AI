package com.jobportal.interview.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.interview.enums.DifficultyLevel;
import com.jobportal.interview.enums.InterviewStatus;
import com.jobportal.interview.enums.InterviewTrack;

/**
 * Full summary report generated upon interview completion.
 */
public class InterviewReportResponse {

    private Long sessionId;
    private String candidateName;
    private String candidateEmail;

    private InterviewTrack track;
    private String trackTitle;
    private String trackId;
    private DifficultyLevel difficulty;
    private InterviewStatus status;

    private int totalQuestions;
    private int answeredQuestions;
    private Integer overallScore;

    private Integer technicalScore;
    private Integer communicationScore;
    private Integer problemSolvingScore;
    private Integer confidenceScore;
    private Integer bestPracticesScore;

    private List<AnswerEvaluationResponse> evaluations;
    private List<String> overallStrengths;
    private List<String> overallWeaknesses;
    private List<String> overallRecommendations;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public InterviewReportResponse() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public InterviewTrack getTrack() { return track; }
    public void setTrack(InterviewTrack track) { this.track = track; }

    public String getTrackTitle() { return trackTitle; }
    public void setTrackTitle(String trackTitle) { this.trackTitle = trackTitle; }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getAnsweredQuestions() { return answeredQuestions; }
    public void setAnsweredQuestions(int answeredQuestions) { this.answeredQuestions = answeredQuestions; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }

    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }

    public Integer getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(Integer problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public Integer getBestPracticesScore() { return bestPracticesScore; }
    public void setBestPracticesScore(Integer bestPracticesScore) { this.bestPracticesScore = bestPracticesScore; }

    public List<AnswerEvaluationResponse> getEvaluations() { return evaluations; }
    public void setEvaluations(List<AnswerEvaluationResponse> evaluations) { this.evaluations = evaluations; }

    public List<String> getOverallStrengths() { return overallStrengths; }
    public void setOverallStrengths(List<String> overallStrengths) { this.overallStrengths = overallStrengths; }

    public List<String> getOverallWeaknesses() { return overallWeaknesses; }
    public void setOverallWeaknesses(List<String> overallWeaknesses) { this.overallWeaknesses = overallWeaknesses; }

    public List<String> getOverallRecommendations() { return overallRecommendations; }
    public void setOverallRecommendations(List<String> overallRecommendations) { this.overallRecommendations = overallRecommendations; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
