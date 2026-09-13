package com.jobportal.resumebuilder.dto;

/**
 * AI Structured output response for improved content bullet points.
 */
public class AiImprovementResponse {

    private String original;
    private String suggestion;
    private String reasoning;

    public AiImprovementResponse() {}

    public AiImprovementResponse(String original, String suggestion, String reasoning) {
        this.original = original;
        this.suggestion = suggestion;
        this.reasoning = reasoning;
    }

    public String getOriginal() { return original; }
    public void setOriginal(String original) { this.original = original; }

    public String getSuggestion() { return suggestion; }
    public void setSuggestion(String suggestion) { this.suggestion = suggestion; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
}
