package com.jobportal.interview.dto;

import com.jobportal.interview.enums.DifficultyLevel;

/**
 * Response DTO representing an interview question delivered to the candidate.
 */
public class QuestionResponse {

    private Long id;
    private Long sessionId;
    private String question;
    private DifficultyLevel difficulty;
    private int orderNumber;
    private int totalQuestions;

    public QuestionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public int getOrderNumber() { return orderNumber; }
    public void setOrderNumber(int orderNumber) { this.orderNumber = orderNumber; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
}
