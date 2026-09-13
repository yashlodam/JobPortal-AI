package com.jobportal.interview.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Internal DTO mapped directly from Spring AI ChatClient structured output
 * when generating an interview question.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiQuestionResult {

    private String question;
    private String expectedAnswer;
    private String difficulty;

    public AiQuestionResult() {}

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
