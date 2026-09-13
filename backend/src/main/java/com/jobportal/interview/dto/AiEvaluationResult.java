package com.jobportal.interview.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Internal DTO mapped directly from Spring AI ChatClient structured output
 * when evaluating a candidate's answer.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiEvaluationResult {

    private Integer score;
    private String feedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;
    private String idealAnswer;
    private String followUpQuestion;

    public AiEvaluationResult() {}

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public String getIdealAnswer() { return idealAnswer; }
    public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }

    public String getFollowUpQuestion() { return followUpQuestion; }
    public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }
}
