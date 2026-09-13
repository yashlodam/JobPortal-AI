package com.jobportal.resumebuilder.dto;

import java.util.List;

/**
 * AI Structured output response for professional summary suggestions.
 */
public class AiSummaryResponse {

    private String summary;
    private List<String> suggestions;

    public AiSummaryResponse() {}

    public AiSummaryResponse(String summary, List<String> suggestions) {
        this.summary = summary;
        this.suggestions = suggestions;
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
}
